(() => {
  const form = document.getElementById('coffee-form');
  const status = document.getElementById('order-status');
  const submit = document.getElementById('submit-order');
  const payment = document.getElementById('payment-buttons');
  const prices = { Espresso: 1.1, Americano: 1.1, Latte: 1.1, HandDrip: 1.4, Omakase: 1.5 };
  const milkPrices = { 'Whole Milk': .2, '2%Milk': .2, 'Oat Milk': .3, 'Almond Milk': .3, 'Lactose Free Milk': .4, 'Coconut Milk': .4 };
  let pending = false;
  let lastSavedSignature = '';
  let backend;
  const value = id => document.getElementById(id).value;
  function total() { return Math.round((prices[value('coffee-type')] + (milkPrices[value('milk-type')] || 0)) * Number(value('quantity')) * 100) / 100; }
  function update() {
    const quantity = Number(value('quantity'));
    const valid = Number.isInteger(quantity) && quantity >= 1 && quantity <= 15 && total() <= 25;
    document.getElementById('price').textContent = valid ? '$' + total().toFixed(2) : '—';
    const error = document.getElementById('quantity-error');
    error.hidden = valid;
    error.textContent = 'Please choose 1–15 whole cups and keep your order at $25 or less. Yuhan has only two hands!';
    document.getElementById('kindness-message').textContent = value('joke') === 'pay' ? 'Thank you! Save your order, then continue to Venmo.' : 'Your kindness covers this cup. Pass it on.';
    submit.disabled = pending || !valid;
    payment.hidden = true;
    status.textContent = '';
    return valid;
  }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  document.querySelectorAll('[data-coffee]').forEach(link => link.addEventListener('click', () => {
    document.getElementById('coffee-type').value = link.dataset.coffee;
    update();
  }));
  async function getBackend() {
    if (!backend) backend = Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js'),
      import('./firebase-config.js')
    ]).then(([app, db, config]) => ({ db, database: db.getDatabase(app.initializeApp(config.firebaseConfig)) })).catch(error => { backend = undefined; throw error; });
    return backend;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity() || !update()) return;
    const order = { userName: value('user-name').trim(), coffeeType: value('coffee-type'), coffeeTemp: value('coffee-temp'), milkType: value('milk-type'), decaf: value('decaf'), quantity: value('quantity'), note: value('note').trim(), kindness: value('joke') };
    const signature = JSON.stringify(order);
    const amount = total();
    pending = true;
    submit.disabled = true;
    submit.textContent = 'Sending your order…';
    status.textContent = 'Just a moment while we save your coffee order.';
    Array.from(form.elements).forEach(control => { control.disabled = true; });
    try {
      if (signature !== lastSavedSignature) {
        const { db, database } = await getBackend();
        await db.push(db.ref(database, 'orders'), { ...order, orderTime: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }), totalPrice: amount, paymentMethod: order.kindness === 'pay' ? 'Venmo' : 'Kindness', paymentStatus: order.kindness === 'pay' ? 'Pending' : 'Not required' });
        lastSavedSignature = signature;
      }
      if (order.kindness === 'pay') {
        const note = `${order.userName || 'Coffee friend'}: ${order.quantity} ${order.decaf} ${order.coffeeType} (${order.coffeeTemp}), ${order.milkType}. ${order.note}`;
        document.getElementById('venmo-button').href = `venmo://paycharge?txn=pay&recipients=Yuhan-Zhu-1&amount=${amount.toFixed(2)}&note=${encodeURIComponent(note)}`;
        payment.hidden = false;
        status.textContent = 'Your order is saved. One more step: pay with Venmo below.';
      } else status.textContent = 'Your order is saved! Your kindness covers this cup. Have a joyful day.';
    } catch (error) {
      status.textContent = 'We couldn’t save your order. Please check your connection and try again.';
      console.error('Coffee order submission failed:', error);
    } finally {
      pending = false;
      Array.from(form.elements).forEach(control => { control.disabled = false; });
      // Restore unavailable options after re-enabling the form.
      document.querySelectorAll('#milk-type option[value="2%Milk"], #milk-type option[value="Oat Milk"]').forEach(option => { option.disabled = true; });
      submit.innerHTML = 'Send my coffee order <span aria-hidden="true">↗</span>';
      refresh();
    }
  });
  document.querySelectorAll('.hero-media img').forEach(img => {
    const fallback = () => { img.hidden = true; img.parentElement.querySelector('.photo-fallback').hidden = false; };
    img.addEventListener('error', fallback);
    if (img.complete && !img.naturalWidth) fallback();
  });
  function refresh() { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); }
  let cleanupMotion = () => {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function setupMotion() {
    cleanupMotion();
    if (reducedMotion.matches || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    let lenis;
    let tick;
    if (window.Lenis) {
      // Lenis keeps native scroll and suits this simple static page; no Locomotive Scroll is initialized.
      lenis = new Lenis({ anchors: true, duration: 1.05 });
      lenis.on('scroll', ScrollTrigger.update);
      tick = time => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    const splitHeadings = [];
    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { duration: .85, ease: 'power2.out' } });
      intro.from('.hero-copy > *', { y: 24, stagger: .09 }).from('.hero-media', { y: 30, rotation: 1 }, .15);
      document.querySelectorAll('.section h2, .closing h2').forEach(heading => {
        const original = heading.innerHTML;
        const accessibleName = heading.textContent;
        heading.setAttribute('aria-label', accessibleName);
        // Split only plain text nodes, preserving emphasis and line breaks.
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => {
          const fragment = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(word => {
            if (!word.trim()) fragment.append(document.createTextNode(word));
            else { const span = document.createElement('span'); span.setAttribute('aria-hidden', 'true'); span.style.display = 'inline-block'; span.textContent = word; fragment.append(span); }
          });
          node.replaceWith(fragment);
        });
        splitHeadings.push({ heading, original });
        gsap.from(heading.querySelectorAll('span'), { y: 20, duration: .7, stagger: .08, ease: 'power2.out', scrollTrigger: { trigger: heading, start: 'top 90%', once: true } });
      });
      document.querySelectorAll('.menu-list, .kindness > div, .order-card').forEach(element => gsap.from(element, { y: 26, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } }));
    });
    cleanupMotion = () => {
      context.revert();
      splitHeadings.forEach(({ heading, original }) => { heading.innerHTML = original; heading.removeAttribute('aria-label'); });
      if (tick) gsap.ticker.remove(tick);
      if (lenis) lenis.destroy();
      cleanupMotion = () => {};
    };
    refresh();
  }
  reducedMotion.addEventListener('change', setupMotion);
  window.addEventListener('load', refresh);
  if (document.fonts) document.fonts.ready.then(refresh);
  document.querySelectorAll('img').forEach(img => img.addEventListener('load', refresh));
  window.addEventListener('pagehide', () => cleanupMotion());
  window.addEventListener('pageshow', event => { if (event.persisted) setupMotion(); });
  update();
  setupMotion();
})();
