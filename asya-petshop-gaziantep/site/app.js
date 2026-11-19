// Asya Petshop: önizleme şeridi, giriş hareketi ve "Evinizde kimler bir arada?" seçici.
// Kullanıcı girdisi yok; DOM'a yalnızca textContent ile yazılır.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const WA = '905300759060';

  // Önizleme şeridi: kapatılınca bu oturumda gizli kalır (depolama kapalıysa yine çalışır)
  const strip = document.querySelector('.strip');
  const close = document.querySelector('.strip-close');
  try { if (sessionStorage.getItem('strip-off') === '1') strip.hidden = true; } catch (e) { /* depolama yok */ }
  if (close) {
    close.addEventListener('click', () => {
      strip.hidden = true;
      try { sessionStorage.setItem('strip-off', '1'); } catch (e) { /* depolama yok */ }
    });
  }

  // Giriş hareketi: her bölümde parçalar 80 ms arayla yükselir
  const items = document.querySelectorAll('.rise');
  const order = new Map();
  items.forEach((el) => {
    const box = el.closest('section, footer') || document.body;
    const i = order.get(box) || 0;
    order.set(box, i + 1);
    el.style.transitionDelay = Math.min(i, 6) * 80 + 'ms';
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  // Alt çubuk: iletişim bölümü ya da kapanış görünürken gizlenir
  const dock = document.querySelector('.dock');
  const ends = document.querySelectorAll('#iletisim, .end');
  if (dock && ends.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const dio = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      dock.classList.toggle('away', seen.size > 0);
    });
    ends.forEach((el) => dio.observe(el));
  }

  // Seçici: script yoksa her düğme kendi WhatsApp bağlantısıdır
  const chips = Array.from(document.querySelectorAll('.chip'));
  const cta = document.getElementById('pick-cta');
  const preview = document.getElementById('pick-msg');
  const stage = document.querySelectorAll('.stage use[data-pet]');
  const label = { kedi: 'kedi', kopek: 'köpek', kus: 'kuş', kemirgen: 'kemirgen', balik: 'balık' };
  if (!chips.length || !cta || !preview) return;

  const joinTr = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' ve ' + a[a.length - 1]);

  const update = () => {
    const sel = chips
      .filter((c) => c.getAttribute('aria-pressed') === 'true')
      .map((c) => c.dataset.pet)
      .filter((p) => Object.prototype.hasOwnProperty.call(label, p));
    stage.forEach((u) => u.classList.toggle('on', sel.includes(u.dataset.pet)));
    const msg = sel.length
      ? 'Merhaba, evimde ' + joinTr(sel.map((p) => label[p])) + ' var. Onlar için ürünlere bakmak istiyorum.'
      : 'Merhaba, evcil hayvanım için ürünlere bakmak istiyorum.';
    preview.textContent = msg;
    cta.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  };

  chips.forEach((c) => {
    c.setAttribute('role', 'button');
    c.setAttribute('aria-pressed', 'false');
    c.removeAttribute('target');
    c.addEventListener('click', (e) => {
      e.preventDefault();
      c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      update();
    });
    c.addEventListener('keydown', (e) => {
      if (e.key === ' ') { e.preventDefault(); c.click(); }
    });
  });
  update();
});
