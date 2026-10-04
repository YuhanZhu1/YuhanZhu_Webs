/* Render a small Markdown subset using DOM nodes only; raw HTML never executes. */
window.renderFaithTalkMarkdown = function(container, source) {
  const fragment = document.createDocumentFragment();
  function inline(parent, text) {
    const pattern = /(\*\*([^\n]+?)\*\*|_([^\n]+?)_|\*([^\n]+?)\*)/g;
    let last = 0, match;
    while ((match = pattern.exec(text))) {
      parent.append(document.createTextNode(text.slice(last, match.index)));
      const node = document.createElement(match[2] ? 'strong' : 'em');
      node.textContent = match[2] || match[3] || match[4]; parent.append(node); last = pattern.lastIndex;
    }
    parent.append(document.createTextNode(text.slice(last)));
  }
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  let paragraph = [], list;
  function flush() { if (paragraph.length) { const p = document.createElement('p'); inline(p, paragraph.join('\n')); fragment.append(p); paragraph = []; } list = null; }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { flush(); continue; }
    const quoted = /^\s*>\s?/.test(line);
    // Also recognize the owner's Chinese example: a quoted verse in a bullet.
    const verse = /^\s*(?:[-*]\s+)?[_*]*[“"「].+[”"」].*[（(].+\d+[:：]\d+/.test(line);
    if (quoted || verse) {
      flush(); const quote = document.createElement('blockquote');
      const block = [line.replace(/^\s*>\s?/, '').replace(/^\s*[-*]\s+/, '')];
      if (quoted) while (i + 1 < lines.length && /^\s*>/.test(lines[i + 1])) block.push(lines[++i].replace(/^\s*>\s?/, ''));
      const text = block.join('\n'); inline(quote, /[“"「]/.test(text) ? text : `“${text}”`); fragment.append(quote); continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      if (paragraph.length) flush();
      if (!list) { list = document.createElement('ul'); fragment.append(list); }
      const li = document.createElement('li'); inline(li, line.replace(/^\s*[-*]\s+/, '')); list.append(li); continue;
    }
    if (/^\s*---+\s*$/.test(line)) { flush(); fragment.append(document.createElement('hr')); continue; }
    if (list) flush(); paragraph.push(line);
  }
  flush(); container.replaceChildren(fragment);
};
