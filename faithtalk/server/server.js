const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');
const { prepare, validateReplies, completeReplies, schemaFor } = require('./chat');

function createApp(client) {
  const app = express();
  app.disable('x-powered-by');
  const origins = new Set(['https://yuhanzhu.com', 'https://www.yuhanzhu.com', ...(process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)]);
  app.use(cors({ origin(origin, callback) { callback(null, !origin || origins.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)); }, methods: ['GET', 'POST'] }));
  app.use(express.json({ limit: '64kb' }));
  const limits = new Map();
  const timer = setInterval(() => { const now = Date.now(); for (const [key, entry] of limits) if (entry.until < now) limits.delete(key); }, 60000);
  timer.unref();
  app.get('/ping', (req, res) => res.json({ status: 'ready', apiVersion: 2, revision: '2026-10-04-original-prompt' }));
  app.post('/chat', async (req, res) => {
    let request;
    try { request = prepare(req.body); } catch (error) { return res.status(400).json({ error: error.message }); }
    // Best-effort instance-local limit. Configure a shared limiter/auth for a larger public deployment.
    const key = req.ip;
    const now = Date.now();
    let entry = limits.get(key);
    if (!entry || entry.until < now) { entry = { count: 0, until: now + 60000 }; limits.set(key, entry); }
    if (++entry.count > 20) return res.status(429).json({ error: 'Please pause a moment before sending another message.' });
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 90000);
    const disconnect = () => { if (!res.writableEnded) abort.abort(); };
    res.on('close', disconnect);
    const streaming = req.body.stream === true;
    const emit = event => { if (!res.destroyed) res.write(JSON.stringify(event) + '\n'); };
    try {
      const options = { model: process.env.OPENAI_MODEL || 'gpt-5-nano', messages: request.messages, reasoning_effort: 'minimal', max_completion_tokens: 1600, store: false };
      if (request.mode === 'group') options.response_format = { type: 'json_schema', json_schema: { name: 'group_exchange', strict: true, schema: schemaFor(request.target) } };
      if (!streaming) {
        const result = await client.chat.completions.create(options, { signal: abort.signal });
        const choice = result.choices[0];
        if (choice?.finish_reason !== 'stop' || choice.message.refusal || !choice.message.content) throw new Error('Incomplete response');
        const replies = request.mode === 'group' ? validateReplies(JSON.parse(choice.message.content), request.target) : [{ name: 'FaithTalk', content: choice.message.content }];
        return res.json({ replies, choices: [{ message: { content: replies.map(r => r.content).join('\n\n') } }], usage: result.usage });
      }
      const stream = await client.chat.completions.create({ ...options, stream: true, stream_options: { include_usage: true } }, { signal: abort.signal });
      res.set({ 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' });
      res.flushHeaders();
      emit({ type: 'start' });
      let text = '', emitted = 0, finish, usage, refusal = '';
      for await (const chunk of stream) {
        if (chunk.usage) usage = chunk.usage;
        const choice = chunk.choices[0];
        if (!choice) continue;
        if (choice.finish_reason) finish = choice.finish_reason;
        refusal += choice.delta?.refusal || '';
        const delta = choice.delta?.content || '';
        text += delta;
        if (request.mode === 'faithtalk' && delta) emit({ type: 'delta', content: delta });
        if (request.mode === 'group' && delta) {
          const replies = completeReplies(text);
          for (; emitted < replies.length; emitted++) emit({ type: 'reply', ...replies[emitted] });
        }
      }
      if (refusal) throw Object.assign(new Error('Model refusal'), { code: 'REFUSAL' });
      let warning;
      if (request.mode === 'group' && finish === 'length') {
        const complete = completeReplies(text);
        validateReplies({ replies: complete }, request.target, true);
        warning = 'The reply reached its length limit. Complete messages are kept; you can continue the conversation.';
      } else {
        if (finish !== 'stop' || !text.trim()) throw Object.assign(new Error('Incomplete response'), { code: 'INCOMPLETE_REPLY' });
        if (request.mode === 'group') validateReplies(JSON.parse(text), request.target);
      }
      emit({ type: 'done', usage, warning });
      res.end();
    } catch (error) {
      // Do not log conversation text or personal information.
      const code = abort.signal.aborted ? 'TIMEOUT' : error.code || (error.status ? 'UPSTREAM_' + error.status : 'INVALID_REPLY');
      console.error('Chat request failed:', { code, status: error.status, parameter: error.param, requestId: error.request_id });
      const message = abort.signal.aborted ? 'The reply took too long. Please try again.'
        : error.status === 401 || error.status === 403 ? 'The chat service couldn’t authenticate with its AI provider. Please check the server’s API configuration.'
        : error.status === 429 ? 'The AI service is at its usage limit. Please wait a moment and try again.'
        : error.status === 400 ? 'The AI service rejected the chat configuration. Please check the server logs for the affected parameter.'
        : code === 'REFUSAL' ? 'The AI couldn’t respond to this request. Try rephrasing your message.'
        : 'The reply was incomplete. Your message is still here; please retry.';
      if (res.headersSent) { emit({ type: 'error', error: message, code }); res.end(); }
      else res.status(502).json({ error: message, code });
    } finally { clearTimeout(timeout); res.off('close', disconnect); }
  });
  app.use((error, req, res, next) => { if (!res.headersSent) res.status(error.status || 500).json({ error: 'Invalid request. Please send a smaller message.' }); });
  return app;
}
if (require.main === module) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0, timeout: 90000 });
  createApp(client).listen(process.env.PORT || 3000, () => console.log('FaithTalk API v2 ready'));
}
module.exports = { createApp };
