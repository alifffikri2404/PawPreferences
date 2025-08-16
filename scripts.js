const cardStack = document.getElementById('card-stack');
const summary = document.getElementById('summary');
const likeCount = document.getElementById('like-count');
const likedCatsContainer = document.getElementById('liked-cats');
const replayBtn = document.getElementById('replay-btn');
const likeIcon = document.createElement('div');
const dislikeIcon = document.createElement('div');

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
  likeIcon.className = 'feedback-icon like-icon';
  likeIcon.innerHTML = '👍🏻';
  dislikeIcon.className = 'feedback-icon dislike-icon';
  dislikeIcon.innerHTML = '👎🏻';
  document.body.appendChild(likeIcon);
  document.body.appendChild(dislikeIcon);

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

    // Handle both swipe (touch) and pan (mouse) events
    hammer.on('swipeleft swiperight panleft panright', (ev) => {
      if (ev.type === 'panleft' || ev.type === 'panright') {
        if (ev.isFinal) {
          hideFeedbackIcons();
          handleSwipe(ev, card, url);
        } else {
          // Feedback based on swipe direction
          if (ev.deltaX > 0){
            showFeedbackIcon(likeIcon, ev.center.x, ev.center.y);
          } else {
            showFeedbackIcon(dislikeIcon, ev.center.x, ev.center.y);
          }
          // Add some movement during pan (mouse) for visual UX
          card.style.transform = `translateX(${ev.deltaX}px) rotate(${ev.deltaX * 0.1}deg)`;
          card.style.opacity = 1 - Math.min(Math.abs(ev.deltaX) / 200, 0.5);
        } 
      } else {
        // For swipe gestures
        if (ev.type === 'swiperight') {
          showFeedbackIcon(likeIcon, ev.center.x, ev.center.y);
        } else {
          showFeedbackIcon(dislikeIcon, ev.center.x, ev.center.y);
        }
        setTimeout(() => hideFeedbackIcons(), 300);
        handleSwipe(ev, card, url);
      }
    });
  });
}

function showFeedbackIcon(icon, x, y) {
  icon.style.display = 'block';
  icon.style.left = `${x - 30}px`; // Center the icon
  icon.style.top = `${y - 30}px`;
  icon.style.opacity = '1';
  icon.style.transform = 'scale(1)';
}

function hideFeedbackIcons() {
  likeIcon.style.opacity = '0';
  dislikeIcon.style.opacity = '0';
  likeIcon.style.transform = 'scale(0.5)';
  dislikeIcon.style.transform = 'scale(0.5)';
  setTimeout(() => {
    likeIcon.style.display = 'none';
    dislikeIcon.style.display = 'none';
  }, 200);
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
  
  // Fade in 
  // setTimeout(() => {
  //   summary.style.opacity = '1';
  // }, 10);

  likeCount.textContent = likedCats.length;
  
  // Clear previous content
  likedCatsContainer.innerHTML = '';

  // Create message based on number of likes
  const message = document.createElement('p');
  message.className = 'result-message';

  // Categorized messages with emojis for extra fun
  const totalLikes = likedCats.length;
  let resultMessage = '';
  
  if (totalLikes === 10) {
    resultMessage = "🐱 PURRFECTION! You're a certified crazy cat person! 🐱";
    message.style.color = 'green';
    message.style.fontWeight = 'bold';
  } else if (totalLikes >= 8) {
    resultMessage = "😻 Cat-tastic! Are you sure you're not actually a cat in human form?";
  } else if (totalLikes >= 4) {
    resultMessage = "😼 Hmm... Do you actually like cats or just their memes?";
  } else if (totalLikes >= 1) {
    resultMessage = "🙀 Only a few? Maybe you're more of a dog person, or was that an accidental swipe?";
  } else {
    resultMessage = "🚨 ALERT: Possible robot detected! No human dislikes ALL cats!";
    message.style.color = 'red';
    message.style.fontWeight = 'bold';
  }
  message.textContent = resultMessage;
  
  // Append message before the liked cats gallery
  likedCatsContainer.parentNode.insertBefore(message, likedCatsContainer);

  // Count liked cats
  likedCats.forEach(url => {
    const img = document.createElement('img');
    img.src = url;
    img.loading = 'lazy';
    likedCatsContainer.appendChild(img);
  });
  // Hide the card stack
  cardStack.style.display = 'none';
  // Show summary after hiding card stack
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
  // Remove the result message if it exists
  const existingMessage = document.querySelector('.result-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  // Show the card stack again when replaying
  cardStack.style.display = '';
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