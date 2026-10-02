const NAMES = ['Eli', 'Jade', 'Lumi', 'Sage'];
const BASE = `You are an AI companion in FaithTalk, created by Yuhan. Be warm, specific, honest and concise. Respond in the user's language. Respect doubt and different beliefs; never pressure conversion or claim divine authority, lived human experience, or certainty about God's intentions. Scripture may help when relevant: cite accurately and never invent a quotation. Do not substitute for professional care. For imminent danger, encourage immediate local emergency help and a trusted person. Avoid formulaic praise, repeated questions, lectures and generic reassurance. Use plain text with paragraph breaks, not Markdown markup.`;
const FAITH = `${BASE}\nHave a thoughtful Christian conversation. Acknowledge the specific question, offer one useful reflection or practical next step. Usually 60–140 words, fewer for a simple reply. At most one natural question; scripture is optional, not mandatory. Use short paragraphs.`;
const GROUP = `${BASE}\nWrite the next small exchange in a group of four fictional AI characters and the user. Eli is gentle and emotionally attentive; Jade is direct, practical and witty without cruelty; Lumi is hopeful, playful and concrete; Sage is quiet, reflective with dry humor. They are companions, not real people.\nReturn 2–3 short messages (usually 15–45 words each) from at least two different characters. Pick relevant speakers, vary who starts, and let a later speaker react to a specific earlier message, add a different perspective or gently disagree. Do not have everyone restate the same advice or address only the user. One question across the exchange at most. No staged introductions, fake memories or forced banter around distress. If the user directly addresses a character, that character starts. If a target is specified, return only that character's single message. Return JSON following the schema.`;
const replySchema = {
  type: 'object', properties: { replies: { type: 'array', items: {
    type: 'object', properties: { name: { type: 'string', enum: NAMES }, content: { type: 'string' } },
    required: ['name', 'content'], additionalProperties: false
  } } }, required: ['replies'], additionalProperties: false
};
function prepare(body) {
  if (!body || !Array.isArray(body.messages) || body.messages.length > 100) throw new Error('Send a valid conversation.');
  const mode = body.mode || 'faithtalk';
  if (!['faithtalk', 'group'].includes(mode)) throw new Error('Unknown conversation mode.');
  if (body.target && !NAMES.includes(body.target)) throw new Error('Unknown character.');
  const input = body.messages.filter(m => m && ['user', 'assistant'].includes(m.role));
  if (!input.length || input.at(-1).role !== 'user') throw new Error('The last message must be from you.');
  for (const m of input) {
    if (typeof m.content !== 'string' || !m.content.trim() || m.content.length > 4000) throw new Error('Messages must contain 1–4,000 characters.');
    if (m.name && !NAMES.includes(m.name)) throw new Error('Unknown character in history.');
  }
  // A hard input budget avoids repeated paid summaries. Keep recent context, not unbounded history.
  let remaining = 12000;
  const history = [];
  for (const m of input.slice(-16).reverse()) {
    const content = mode === 'group' && m.role === 'assistant' && m.name ? `${m.name}: ${m.content}` : m.content;
    if (content.length > remaining) break;
    history.unshift({ role: m.role, content });
    remaining -= content.length;
  }
  const prompt = mode === 'group' ? GROUP + (body.target ? `\nTarget: ${body.target}. Return exactly one message by ${body.target}.` : '') : FAITH;
  return { mode, target: body.target, messages: [{ role: 'system', content: prompt }, ...history] };
}
function validateReplies(data, target) {
  if (!data || !Array.isArray(data.replies) || data.replies.length < 1 || data.replies.length > 3) throw new Error('Invalid group response.');
  const replies = data.replies;
  if (target && (replies.length !== 1 || replies[0].name !== target)) throw new Error('Invalid targeted response.');
  if (!target && (replies.length < 2 || new Set(replies.map(r => r.name)).size < 2)) throw new Error('The group response needs different speakers.');
  for (const r of replies) if (!NAMES.includes(r.name) || typeof r.content !== 'string' || !r.content.trim() || r.content.length > 4000) throw new Error('Invalid character response.');
  return replies;
}
// Extract only complete reply objects from a partial structured JSON stream.
function completeReplies(text) {
  const found = [];
  let depth = 0, start = -1, quoted = false, escape = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (escape) escape = false; else if (c === '\\') escape = true; else if (c === '"') quoted = false; continue; }
    if (c === '"') { quoted = true; continue; }
    if (c === '{') { depth++; if (depth === 2) start = i; }
    if (c === '}') { if (depth === 2 && start !== -1) { const r = JSON.parse(text.slice(start, i + 1)); if (NAMES.includes(r.name) && typeof r.content === 'string' && r.content.trim()) found.push(r); } depth--; }
  }
  return found;
}
module.exports = { prepare, validateReplies, completeReplies, replySchema };
