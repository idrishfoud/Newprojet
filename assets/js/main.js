/*
  Main JS
  - Navigation toggle & active links
  - Header blur & scroll up
  - ScrollReveal animations
  - Stats counter
  - Shop filters & cart (localStorage)
  - Forms validation & localStorage
*/

/*=============== SHOW/HIDE MENU ===============*/
(function menuToggle(){
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  if (!navMenu || !navToggle) return;
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.addEventListener('click', ()=> {
    const open = navMenu.classList.toggle('show-menu');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  // Close menu on link click (mobile)
  navMenu.addEventListener('click', (e)=>{
    const link = e.target.closest('.nav__link');
    if(link) navMenu.classList.remove('show-menu');
  });
})();

/*=============== ADD BLUR HEADER ===============*/
(function blurHeader(){
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = ()=> window.scrollY > 50 ? header.classList.add('blur-header') : header.classList.remove('blur-header');
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/*=============== SHOW SCROLL UP ===============*/
(function scrollUp(){
  const scrollUp = document.getElementById('scroll-up');
  if (!scrollUp) return;
  const onScroll = ()=> window.scrollY > 400 ? scrollUp.classList.add('show-scroll') : scrollUp.classList.remove('show-scroll');
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
(function activeLinkOnScroll(){
  const links = [...document.querySelectorAll('.nav__link')];
  if (!links.length) return;

  // Path-based highlighting for multi-page nav
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  links.forEach(l => l.classList.remove('active-link'));
  const currentLink = links.find(l => (l.getAttribute('href') || '').toLowerCase().endsWith(page));
  if (currentLink) currentLink.classList.add('active-link');

  // Section-based highlighting only if links include hashes
  const hashLinks = links.filter(l => (l.getAttribute('href') || '').includes('#'));
  const sections = [...document.querySelectorAll('section[id]')];
  if (!hashLinks.length || !sections.length) return;
  function onScroll(){
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionTop = current.offsetTop - 100;
      const sectionHeight = current.offsetHeight;
      const id = current.getAttribute('id');
      const isActive = scrollY > sectionTop && scrollY <= sectionTop + sectionHeight;
      hashLinks.forEach(l => l.classList.toggle('active-link', isActive && l.getAttribute('href').includes(`#${id}`)));
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/*=============== SCROLL REVEAL ANIMATION ===============*/
(function reveal(){
  if (typeof ScrollReveal === 'undefined') return; // graceful degrade
  const sr = ScrollReveal({ distance: '40px', duration: 1200, delay: 150, easing: 'ease-out' });
  sr.reveal('.hero__content', { origin: 'left' });
  sr.reveal('.hero__image', { origin: 'right' });
  sr.reveal('.stat__item, .gallery__img, .project, .form, .table', { interval: 100, origin: 'bottom' });
})();

/*=============== STATS COUNTER ===============*/
(function counters(){
  const values = document.querySelectorAll('.stat__value[data-count]');
  if (!values.length) return;
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target; const target = parseInt(el.dataset.count||'0',10);
        let current = 0; const inc = Math.max(1, Math.ceil(target/60));
        const int = setInterval(()=>{ current += inc; if (current >= target) { current = target; clearInterval(int); }
          el.textContent = target >= 100 ? `${current}+` : `${current}`; }, 20);
        observer.unobserve(el);
      }
    });
  }, { threshold: .3 });
  values.forEach(v => observer.observe(v));
})();

/*=============== SHOP: FILTERS ===============*/
(function shopFilters(){
  const container = document.querySelector('[data-shop]');
  if (!container) return;
  const buttons = container.querySelectorAll('[data-filter]');
  const items = container.querySelectorAll('[data-category]');
  buttons.forEach(btn => btn.addEventListener('click', ()=>{
    const filter = btn.dataset.filter;
    buttons.forEach(b => b.classList.remove('button--primary'));
    btn.classList.add('button--primary');
    items.forEach(it => {
      const show = filter === 'all' || it.dataset.category === filter;
      it.style.display = show ? '' : 'none';
    });
  }));
})();

/*=============== CART (localStorage) ===============*/
(function cart(){
  const cartList = document.getElementById('cart-list');
  const totalEl = document.getElementById('cart-total');
  const clearBtn = document.getElementById('cart-clear');
  const countBadge = document.querySelector('.nav__cart');

  const load = () => JSON.parse(localStorage.getItem('cartItems') || '[]');
  const save = (items)=> localStorage.setItem('cartItems', JSON.stringify(items));
  const sum = (items)=> items.reduce((a,i)=> a + i.price * i.qty, 0);
  const count = (items)=> items.reduce((a,i)=> a + i.qty, 0);

  function render(){
    const items = load();
    if (cartList) {
      cartList.innerHTML = items.map((i,idx)=> `
        <div class="cart__item">
          <span>${i.title} × ${i.qty}</span>
          <div>
            <button data-dec="${idx}" class="button button--ghost" title="-">–</button>
            <button data-inc="${idx}" class="button button--ghost" title="+">+</button>
            <button data-rem="${idx}" class="button button--outline" title="Supprimer">Suppr</button>
          </div>
          <strong class="product__price">${(i.price*i.qty).toFixed(2)} MAD</strong>
        </div>`).join('');
      if (totalEl) totalEl.textContent = `${sum(items).toFixed(2)} MAD`;
    }
    if (countBadge) countBadge.setAttribute('data-count', String(count(items)));
  }

  // Delegate add-to-cart clicks
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const product = btn.closest('[data-product]');
    if (!product) return;
    const id = product.dataset.id || product.querySelector('h3')?.textContent?.trim() || String(Math.random());
    const title = product.querySelector('h3')?.textContent?.trim() || 'Produit';
    const price = parseFloat(product.dataset.price || product.querySelector('[data-price]')?.textContent?.replace(/[^\d.]/g,'') || '0');
    const items = load();
    const existing = items.find(i => i.id === id);
    if (existing) existing.qty += 1; else items.push({ id, title, price, qty: 1 });
    save(items); render();
  });

  // Cart controls
  if (cartList) cartList.addEventListener('click', (e)=>{
    const dec = e.target.closest('[data-dec]');
    const inc = e.target.closest('[data-inc]');
    const rem = e.target.closest('[data-rem]');
    if (!dec && !inc && !rem) return;
    const items = load();
    const idx = parseInt((dec||inc||rem).dataset.dec|| (inc?.dataset.inc)|| (rem?.dataset.rem),10);
    if (Number.isNaN(idx) || !items[idx]) return;
    if (dec) items[idx].qty = Math.max(0, items[idx].qty - 1);
    if (inc) items[idx].qty += 1;
    if (rem) items.splice(idx,1);
    const filtered = items.filter(i=> i.qty>0);
    save(filtered); render();
  });

  if (clearBtn) clearBtn.addEventListener('click', ()=>{ save([]); render(); });

  render();
})();

/*=============== FORMS: CONTACT & INTERMEDIAIRE ===============*/
(function forms(){
  const byId = (id)=> document.getElementById(id);
  // Contact
  const cForm = byId('contact-form');
  if (cForm) cForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = byId('contact-name').value.trim();
    const email = byId('contact-email').value.trim();
    const message = byId('contact-message').value.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !message) {
      alert('Veuillez remplir correctement tous les champs.'); return;
    }
    const contacts = JSON.parse(localStorage.getItem('contacts')||'[]');
    contacts.push({ name, email, message, date: new Date().toISOString() });
    localStorage.setItem('contacts', JSON.stringify(contacts));
    cForm.reset();
    alert('Merci pour votre message !');
  });

  // Intermédiaire
  const iForm = byId('inter-form');
  const iTable = byId('inter-table-body');
  const iClear = byId('inter-clear');
  function loadInter(){ return JSON.parse(localStorage.getItem('intermediaires')||'[]'); }
  function saveInter(arr){ localStorage.setItem('intermediaires', JSON.stringify(arr)); }
  function renderInter(){ if (!iTable) return; const rows = loadInter().map((r,idx)=>`
    <tr>
      <td>${idx+1}</td>
      <td>${r.name}</td>
      <td>${r.email}</td>
      <td>${r.role}</td>
      <td>${r.product}</td>
      <td>${r.message}</td>
      <td><button class="button button--outline" data-del="${idx}">Suppr</button></td>
    </tr>`).join(''); iTable.innerHTML = rows; }
  if (iForm) iForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = byId('inter-name').value.trim();
    const email = byId('inter-email').value.trim();
    const role = byId('inter-role').value;
    const product = byId('inter-product').value.trim();
    const message = byId('inter-message').value.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !product || !message) {
      alert('Veuillez compléter correctement le formulaire.'); return;
    }
    const rows = loadInter(); rows.push({ name, email, role, product, message, date: new Date().toISOString() });
    saveInter(rows); iForm.reset(); renderInter();
  });
  if (iTable) iTable.addEventListener('click', (e)=>{
    const del = e.target.closest('[data-del]'); if (!del) return;
    const idx = parseInt(del.dataset.del, 10); const rows = loadInter(); rows.splice(idx,1); saveInter(rows); renderInter();
  });
  if (iClear) iClear.addEventListener('click', ()=>{ saveInter([]); renderInter(); });
  renderInter();
})();
