/* Delivery-area check popup. Any element with [data-pincheck] opens it. */
(function () {
  var HOSTS = ['https://admin.palkkaran.in/api/v1', 'https://api.palkkaran.in/api/v1', 'https://palkkaran.in/api/v1'];
  var TEL = '+917994753798', LABEL = '+91 799 475 3798';
  var css = '.pcm{position:fixed;inset:0;z-index:9999;display:none;place-items:center;padding:16px;background:rgba(30,22,82,.55);backdrop-filter:blur(4px)}'
    + '.pcm.show{display:grid}.pcm-box{position:relative;background:#fff;border-radius:26px;padding:30px 26px 24px;width:min(440px,100%);text-align:center;box-shadow:0 30px 70px -30px rgba(30,22,82,.6);animation:pcPop .2s ease-out}'
    + '@keyframes pcPop{from{transform:scale(.92) translateY(8px);opacity:0}to{transform:none;opacity:1}}'
    + '.pcm-x{position:absolute;top:10px;right:14px;border:0;background:none;font-size:28px;line-height:1;color:#1e1652;cursor:pointer}'
    + '.pcm-ic{width:58px;height:58px;border-radius:50%;background:#efecff;display:grid;place-items:center;margin:0 auto 10px;font-size:28px}'
    + '.pcm h3{margin:0 0 6px;font-size:1.5rem;color:#1e1652}.pcm p{margin:0 0 16px;color:#7b75a0}'
    + '.pcm-row{display:flex;gap:10px}.pcm-row input{flex:1;min-width:0;padding:14px 18px;border-radius:999px;border:2px solid #e2ddff;font:inherit;font-size:1rem}'
    + '.pcm-row input:focus{outline:none;border-color:#6c5cf5}.pcm-row button{border:0;border-radius:999px;padding:0 22px;font:inherit;font-weight:700;background:#6c5cf5;color:#fff;cursor:pointer}'
    + '.pcm-row button:disabled{opacity:.6}#pcmOut{margin-top:16px;text-align:left}.pcm-ok,.pcm-no{border-radius:16px;padding:14px 16px;font-size:.95rem}'
    + '.pcm-ok{background:#dcfce7;color:#166534}.pcm-no{background:#fee2e2;color:#7f1d1d}'
    + '.pcm-b{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.pcm-b a{padding:9px 16px;border-radius:999px;font-weight:700;background:#fff;color:#1e1652;text-decoration:none;border:1px solid rgba(0,0,0,.1);font-size:.9rem}'
    + '.pcm-b a.p{background:#6c5cf5;color:#fff;border-color:#6c5cf5}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var m = document.createElement('div'); m.className = 'pcm'; m.id = 'pcm'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'pcmT');
  m.innerHTML = '<div class="pcm-box"><button class="pcm-x" aria-label="Close" type="button">&times;</button><div class="pcm-ic">📍</div>'
    + '<h3 id="pcmT">Do we deliver to you?</h3><p>Enter your pincode to check if Palkkaran delivers in your area.</p>'
    + '<form class="pcm-row" id="pcmF" novalidate><input id="pcmIn" type="tel" inputmode="numeric" maxlength="6" placeholder="6-digit pincode" aria-label="Pincode" autocomplete="postal-code"><button type="submit" id="pcmBtn">Check</button></form>'
    + '<div id="pcmOut" role="status" aria-live="polite"></div></div>';
  document.body.appendChild(m);
  var inp = m.querySelector('#pcmIn'), out = m.querySelector('#pcmOut'), btn = m.querySelector('#pcmBtn');
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function open() { m.classList.add('show'); document.body.style.overflow = 'hidden'; setTimeout(function () { inp.focus(); }, 50); }
  function close() { m.classList.remove('show'); document.body.style.overflow = ''; }
  async function check(pin) {
    for (var i = 0; i < HOSTS.length; i++) {
      try { var r = await fetch(HOSTS[i] + '/serviceability?pincode=' + pin, { headers: { Accept: 'application/json' } }); if (r.ok) return await r.json(); } catch (e) {}
    }
    throw new Error('net');
  }
  m.querySelector('#pcmF').addEventListener('submit', async function (e) {
    e.preventDefault();
    var pin = inp.value.replace(/\D/g, '');
    if (pin.length !== 6) { out.innerHTML = '<div class="pcm-no">Please enter a valid 6-digit pincode.</div>'; return; }
    btn.disabled = true; btn.textContent = 'Checking…'; out.innerHTML = '';
    try {
      var d = await check(pin);
      out.innerHTML = d.serviceable
        ? '<div class="pcm-ok"><b>Good news! We deliver to ' + esc(pin) + '</b>' + (d.places && d.places.length ? ' (' + d.places.map(esc).join(', ') + ')' : '') + '.<div class="pcm-b"><a class="p" href="https://shop.palkkaran.in">Order now</a><a href="contact.html">Contact us</a></div></div>'
        : '<div class="pcm-no"><b>Service is not available right now at ' + esc(pin) + '.</b><br>We are expanding soon. Contact us and we will let you know when we reach your area.<div class="pcm-b"><a class="p" href="tel:' + TEL + '">Call ' + LABEL + '</a><a href="https://wa.me/917994753798" rel="noopener">WhatsApp</a><a href="contact.html">Contact form</a></div></div>';
    } catch (err) { out.innerHTML = '<div class="pcm-no">Could not check right now. Please try again or call ' + LABEL + '.</div>'; }
    btn.disabled = false; btn.textContent = 'Check';
  });
  m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('.pcm-x')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-pincheck]'); if (t) { e.preventDefault(); open(); } });
})();
