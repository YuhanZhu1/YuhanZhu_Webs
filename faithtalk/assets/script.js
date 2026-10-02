(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const api = local ? 'http://localhost:3000' : document.querySelector('meta[name="faithtalk-api"]').content;
  const characters = {
    Eli: { avatar: 'assets/eli-avatar.png' }, Jade: { avatar: 'assets/jade-avatar.png' },
    Lumi: { avatar: 'assets/lumi-avatar.png' }, Sage: { avatar: 'assets/sage-avatar.png' }
  };
  const sessions = { faithtalk: { history: [], error: '', usage: null, totalTokens: 0 }, group: { history: [], error: '', usage: null, totalTokens: 0 } };
  const prompts = {
    faithtalk: ['I have questions about prayer', 'How do I live with doubt?', 'I need a little encouragement', 'Help me reflect on my day'],
    group: ['What was one small win today?', 'I feel a little stuck lately', 'Faith and doubt: can they coexist?', 'Help me see this differently']
  };
  let mode = 'faithtalk', active = null, warmup = null, ready = false;
  function connection(text, state = '') {
    $('connection-status').textContent = text;
    $('connection-dot').className = 'connection-dot ' + state;
    $('reconnect').hidden = state !== 'failed';
  }
  async function connect() {
    if (ready) return;
    if (warmup) return warmup;
    const controller = new AbortController();
    const slow = setTimeout(() => connection('The server is waking up. You can write your message while it connects.'), 7000);
    const deadline = setTimeout(() => controller.abort(), 85000);
    connection('Connecting to your conversation…');
    warmup = (async () => {
      const response = await fetch(api + '/ping', { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error('The server is unavailable. Please try connecting again.');
      let data;
      try { data = await response.json(); } catch { throw new Error('The server needs the FaithTalk v2 update before this page can chat.'); }
      if (data.apiVersion !== 2) throw new Error('The server needs the FaithTalk v2 update before this page can chat.');
      ready = true;
      connection('Connected · Ready when you are', 'ready');
    })().catch(error => {
      const message = error.name === 'AbortError' ? 'Connection is taking longer than expected. Please try again.' : error.message;
      connection(message, 'failed');
      throw new Error(message);
    }).finally(() => { clearTimeout(slow); clearTimeout(deadline); warmup = null; });
    return warmup;
  }
  const nearBottom = () => $('chat-scroll').scrollHeight - $('chat-scroll').scrollTop - $('chat-scroll').clientHeight < 100;
  function scroll(force = false) {
    if (force || nearBottom()) $('chat-scroll').scrollTop = $('chat-scroll').scrollHeight;
    $('jump-latest').hidden = nearBottom();
  }
  $('chat-scroll').addEventListener('scroll', () => { $('jump-latest').hidden = nearBottom(); }, { passive: true });
  $('jump-latest').addEventListener('click', () => scroll(true));
  $('write-message').addEventListener('click', () => $('userInput').focus());
  function bubble(message, live = true) {
    const row = document.createElement('article');
    row.className = 'message ' + (message.role === 'user' ? 'user' : 'bot');
    const name = message.role === 'user' ? 'You' : message.name || 'FaithTalk';
    row.dataset.name = name;
    if (message.role !== 'user') {
      if (characters[name]) { const img = document.createElement('img'); img.src = characters[name].avatar; img.alt = ''; img.className = 'message-avatar'; row.append(img); }
      else { const symbol = document.createElement('span'); symbol.className = 'message-symbol'; symbol.textContent = '✳'; symbol.setAttribute('aria-hidden', 'true'); row.append(symbol); }
    }
    const body = document.createElement('div'); body.className = 'message-body';
    const author = document.createElement('p'); author.className = 'message-author'; author.textContent = name;
    const content = document.createElement('div'); content.className = 'message-content'; content.textContent = message.content;
    // Plain text rendering prevents user or model HTML from executing; paragraphs still retain their spacing.
    body.append(author, content); row.append(body);
    if (!live) row.setAttribute('aria-live', 'off');
    $('chatbox').append(row);
    return { row, content };
  }
  function usage() {
    const s = sessions[mode];
    $('usage-details').textContent = s.usage ? `Last reply: ${s.usage.prompt_tokens || 0} input + ${s.usage.completion_tokens || 0} output tokens (including reasoning). Completed replies in this mode: ${s.totalTokens.toLocaleString()} tokens. One model request per turn; recent context only. Interrupted replies may incur additional tokens not shown here.` : 'No completed model calls yet. Each turn uses one request with at most 16 recent messages and 12,000 context characters. Older details may be forgotten.';
  }
  function render() {
    const group = mode === 'group', s = sessions[mode];
    $('mode-title').textContent = group ? 'The circle' : 'FaithTalk';
    $('mode-eyebrow').textContent = group ? 'FOUR AI VOICES. ROOM FOR YOURS.' : 'A MOMENT TO REFLECT';
    $('circle-members').hidden = !group; $('target-control').hidden = !group;
    $('welcome-title').innerHTML = group ? 'A little circle.<br>A fresh perspective.' : "You don't need to have<br>it all figured out.";
    $('welcome-description').textContent = group ? 'Eli, Jade, Lumi, and Sage bring different voices to the same conversation. Share a thought, pick a topic, or ask someone directly.' : 'Questions, doubts, everyday worries. There’s room for all of it here. Where would you like to start?';
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    $('starters').replaceChildren();
    prompts[mode].forEach(text => { const button = document.createElement('button'); button.type = 'button'; button.textContent = text; const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); button.append(arrow); button.addEventListener('click', () => { $('userInput').value = text; resize(); $('userInput').focus(); }); $('starters').append(button); });
    $('chatbox').replaceChildren(); s.history.forEach(message => bubble(message, false));
    $('welcome').hidden = s.history.length > 0;
    $('chat-error').hidden = !s.error; $('chat-error-text').textContent = s.error;
    $('reply-progress').hidden = true;
    $('reply-warning').hidden = !s.warning; $('reply-warning').textContent = s.warning || '';
    usage(); scroll(true);
  }
  function resize() {
    const input = $('userInput');
    input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 160) + 'px';
    $('character-count').textContent = `${input.value.length.toLocaleString()} / 2,000`;
  }
  function busy(on) {
    $('send-button').disabled = on;
    $('stop-button').hidden = !on;
    $('target').disabled = on;
    $('retry').disabled = on;
    $('reply-progress').hidden = !on;
    $('send-button').textContent = on ? 'Replying…' : 'Send message ↗';
  }
  async function events(response, receive) {
    if (!response.body || !response.headers.get('content-type')?.includes('application/x-ndjson')) throw new Error('Please update the server to FaithTalk v2.');
    const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
        let newline;
        while ((newline = buffer.indexOf('\n')) !== -1) { const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1); if (line.trim()) receive(JSON.parse(line)); }
        if (done) break;
      }
      if (buffer.trim()) receive(JSON.parse(buffer));
    } finally { reader.releaseLock(); }
  }
  async function send(retry = false) {
    if (active) return;
    const s = sessions[mode];
    const text = retry ? s.history.at(-1)?.content : $('userInput').value.trim();
    if (!text || text.length > 2000) return;
    const current = mode, controller = new AbortController();
    active = { controller, mode: current };
    s.error = ''; s.warning = ''; $('reply-warning').hidden = true;
    $('reply-announcement').textContent = '';
    if (!retry) { s.history.push({ role: 'user', content: text }); bubble(s.history.at(-1)); $('userInput').value = ''; resize(); }
    $('welcome').hidden = true; $('chat-error').hidden = true;
    busy(true); scroll(true);
    $('reply-progress-text').textContent = ready ? (mode === 'group' ? 'The circle is considering your message…' : 'Thinking about your message…') : 'Connecting first. Your message is waiting here…';
    const staged = [], rows = []; let draft, done = false, resultUsage;
    let deadline;
    // Capture target before waiting for a cold server.
    const target = mode === 'group' ? $('target').value : '';
    try {
      await Promise.race([connect(), new Promise((resolve, reject) => controller.signal.addEventListener('abort', () => reject(new DOMException('Stopped', 'AbortError')), { once: true }))]);
      if (controller.signal.aborted) throw new DOMException('Stopped', 'AbortError');
      $('reply-progress-text').textContent = current === 'group' ? 'The circle is considering your message…' : 'Thinking about your message…';
      deadline = setTimeout(() => controller.abort(), 95000);
      const response = await fetch(api + '/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ mode: current, target: target || undefined, stream: true, messages: s.history.slice(-16).map(({ role, content, name }) => ({ role, content, ...(current === 'group' && characters[name] ? { name } : {}) })) })
      });
      if (!response.ok) { let data; try { data = await response.json(); } catch {} throw new Error(data?.error || 'The server couldn’t reply. Please try again.'); }
      await events(response, event => {
        if (controller.signal.aborted || current !== mode) return;
        const follow = nearBottom();
        if (event.type === 'error') throw new Error(event.error);
        if (event.type === 'delta') {
          if (!draft) { draft = { role: 'assistant', name: 'FaithTalk', content: '' }; staged.push(draft); const b = bubble(draft, false); rows.push(b); }
          draft.content += event.content; rows[0].content.textContent = draft.content;
        }
        if (event.type === 'reply') {
          if (!characters[event.name] || typeof event.content !== 'string' || staged.length >= 3) throw new Error('The group reply was incomplete. Please retry.');
          const message = { role: 'assistant', name: event.name, content: event.content };
          staged.push(message); rows.push(bubble(message));
          $('reply-progress-text').textContent = 'The circle is finishing its thoughts…';
        }
        if (event.type === 'done') { done = true; resultUsage = event.usage; s.warning = event.warning || ''; }
        if (follow) scroll(true);
      });
      if (controller.signal.aborted) throw new DOMException('Stopped', 'AbortError');
      if (!done || !staged.length) throw new Error('The reply was interrupted. Please try again.');
      s.history.push(...staged);
      if (current === 'faithtalk' && current === mode) $('reply-announcement').textContent = 'FaithTalk: ' + staged[0].content;
      if (resultUsage) { s.usage = resultUsage; s.totalTokens += resultUsage.total_tokens || 0; }
      if (current === mode) { usage(); $('reply-warning').textContent = s.warning; $('reply-warning').hidden = !s.warning; }
    } catch (error) {
      rows.forEach(b => b.row.remove());
      if (sessions[current] === s && (!active || active.controller === controller)) {
        s.error = controller.signal.aborted ? 'Reply stopped. You can retry when you’re ready.' : error.message;
        if (current === mode) { $('chat-error-text').textContent = s.error; $('chat-error').hidden = false; scroll(true); }
      }
    } finally {
      clearTimeout(deadline);
      // Mode switches may already have started another request.
      if (active?.controller === controller) { active = null; busy(false); }
      if (current === mode && document.activeElement === $('send-button')) $('userInput').focus();
    }
  }
  function stop() { if (active) { active.controller.abort(); active = null; busy(false); } }
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.mode === mode) return;
    if (active) sessions[mode].error = 'Reply stopped when you changed spaces. Retry to continue.';
    sessions[mode].draft = $('userInput').value;
    sessions[mode].target = $('target').value;
    stop(); mode = button.dataset.mode;
    $('userInput').value = sessions[mode].draft || ''; $('target').value = sessions[mode].target || ''; resize(); render();
  }));
  $('composer').addEventListener('submit', event => { event.preventDefault(); send(); });
  $('userInput').addEventListener('input', resize);
  $('userInput').addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !matchMedia('(pointer: coarse)').matches) { event.preventDefault(); send(); } });
  $('retry').addEventListener('click', () => send(true));
  $('stop-button').addEventListener('click', stop);
  $('reconnect').addEventListener('click', () => connect().catch(() => {}));
  $('new-chat').addEventListener('click', () => { stop(); sessions[mode] = { history: [], error: '', usage: null, totalTokens: 0 }; $('userInput').value = ''; resize(); render(); $('userInput').focus(); });
  const dialog = $('about-dialog');
  ['about-button', 'privacy-button'].forEach(id => $(id).addEventListener('click', () => dialog.showModal()));
  $('close-about').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  $('usage-button').addEventListener('click', () => { const open = $('usage-button').getAttribute('aria-expanded') !== 'true'; $('usage-button').setAttribute('aria-expanded', String(open)); $('usage-details').hidden = !open; });
  render(); resize(); connect().catch(() => {});
})();
