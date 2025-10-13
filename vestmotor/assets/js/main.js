// Navigation and dynamic content
(function(){
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const year = document.getElementById('year');
  if(year){ year.textContent = new Date().getFullYear().toString(); }
  if(navToggle && nav){
    navToggle.addEventListener('click', ()=>{
      const opened = nav.getAttribute('data-mobile') === 'opened';
      nav.setAttribute('data-mobile', opened ? 'closed' : 'opened');
      navToggle.setAttribute('aria-expanded', (!opened).toString());
    });
  }
  // Load featured cars if present
  const featured = document.getElementById('featured-cars');
  if(featured){
    fetch('/vestmotor/assets/js/data/cars.json').then(r=>r.json()).then(cars=>{
      const top = cars.slice(0,6);
      featured.innerHTML = top.map(renderCarCard).join('');
    }).catch(()=>{ featured.innerHTML = '<p class="meta">Kunne ikke laste biler akkurat nå.</p>'; });
  }
  function renderCarCard(car){
    return `
    <article class="card">
      <img src="${car.image}" alt="${car.make} ${car.model}"/>
      <div class="content">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${car.make} ${car.model}</strong>
          <span class="price">${formatPrice(car.priceNok)}</span>
        </div>
        <div class="meta">${car.year} • ${car.mileageKm.toLocaleString('nb-NO')} km • ${car.transmission}</div>
        <a href="/vestmotor/car.html?id=${encodeURIComponent(car.id)}">Se mer</a>
      </div>
    </article>`;
  }
  function formatPrice(n){
    return new Intl.NumberFormat('nb-NO',{ style:'currency', currency:'NOK', maximumFractionDigits:0 }).format(n);
  }

  // PWA registration
  if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('/vestmotor/sw.js').catch(()=>{});
    });
  }
})();
