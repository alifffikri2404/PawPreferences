const cardStack = document.getElementById('card-stack');
const summary = document.getElementById('summary');
const likeCount = document.getElementById('like-count');
const likedCatsContainer = document.getElementById('liked-cats');

let likedCats = [];
let cats = [];

// Fetch multiple random cats
async function loadCats(count = 5) {
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

    const hammer = new Hammer(card);
    hammer.on('swipeleft swiperight', (ev) => {
      handleSwipe(ev, card, url);
    });
  });
}

function handleSwipe(ev, card, url) {
  card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  card.style.transform = ev.type === 'swipeleft' ? 'translateX(-150%)' : 'translateX(150%)';
  card.style.opacity = '0';

  if (ev.type === 'swiperight') {
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
  likeCount.textContent = likedCats.length;
  likedCats.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    likedCatsContainer.appendChild(img);
  });
  summary.classList.remove('hidden');
}

loadCats(10);