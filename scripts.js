const cardStack = document.getElementById('card-stack');
const summary = document.getElementById('summary');
const likeCount = document.getElementById('like-count');
const likedCatsContainer = document.getElementById('liked-cats');
const replayBtn = document.getElementById('replay-btn');

let likedCats = [];
let cats = [];

// Fetch multiple random cats from CATAAS API
async function loadCats(count = 5) {
  cardStack.innerHTML = '';
  cats = [];
  for (let i = 0; i < count; i++) {
    cats.push(`https://cataas.com/cat?random=${Date.now()}-${i}`);
  }
  createCards();
}

function createCards() {
  cats.forEach((url, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `<img src="${url}" alt="Cat" />`;
    cardStack.appendChild(card);

    // Only touch events, mouse cannot detect swipe action
    // const hammer = new Hammer(card);
    // hammer.on('swipeleft swiperight', (ev) => {
    //   handleSwipe(ev, card, url);
    // });

    // Enable both touch and mouse events
    const hammer = new Hammer(card, {
      recognizers: [
        [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }],
        [Hammer.Pan, { direction: Hammer.DIRECTION_HORIZONTAL }]
      ]
    });

    // Handle both swipe and pan events
    hammer.on('swipeleft swiperight panleft panright', (ev) => {
      if (ev.type === 'panleft' || ev.type === 'panright') {
        if (ev.isFinal) {
          handleSwipe(ev, card, url);
        } else {
          // Add some movement during pan for visual UX
          card.style.transform = `translateX(${ev.deltaX}px) rotate(${ev.deltaX * 0.1}deg)`;
          card.style.opacity = 1 - Math.min(Math.abs(ev.deltaX) / 200, 0.5);
        }
      } else {
        handleSwipe(ev, card, url);
      }
    });
  });
}

function handleSwipe(ev, card, url) {
  card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  // card.style.transform = ev.type === 'swipeleft' ? 'translateX(-150%)' : 'translateX(150%)';
  const direction = ev.type.includes('left') ? -1 : 1;
  card.style.transform = `translateX(${direction * 150}%) rotate(${direction * 20}deg)`;
  card.style.opacity = '0';

  // if (ev.type === 'swiperight') {
  //   likedCats.push(url);
  // }
  if (ev.type.includes('right')) {
    likedCats.push(url);
  }

  setTimeout(() => {
    card.remove();
    if (cardStack.children.length === 0) {
      showSummary();
    }
  }, 300);
}

function showSummary() {
  // summary.style.opacity = '0';
  // summary.style.transition = 'opacity 0.3s ease';
  // summary.classList.remove('hidden');
  
  // // Fade in 
  // setTimeout(() => {
  //   summary.style.opacity = '1';
  // }, 10);

  likeCount.textContent = likedCats.length;
  likedCatsContainer.innerHTML = '';
  likedCats.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.loading = 'lazy';
    likedCatsContainer.appendChild(img);
  });
  summary.classList.remove('hidden');
    requestAnimationFrame(() => {
    summary.classList.add('visible');
    setTimeout(() => {
      summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  });
}

function replay(){
  likedCats = [];
  summary.classList.remove('visible');
  summary.classList.add('hidden');
  loadCats(10);
}

// Event listeners
replayBtn.addEventListener('click', replay);

// Initialize CATAAS API
loadCats(10);

// Add hover effect for desktop
if (window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousedown', () => {
      card.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mouseup', () => {
      card.style.cursor = 'grab';
    });
  });
}