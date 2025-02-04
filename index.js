const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const deck = suits.flatMap(suit => ranks.map(rank => ({ suit, rank })));

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

shuffle(deck);
const imageCache = {};

function preloadImages() {
    suits.forEach(suit => {
        ranks.forEach(rank => {
            const img = new Image();
            const imagePath = `img/${suit}-${rank}.svg`;
            img.src = imagePath;
            imageCache[`${suit}-${rank}`] = img;
        });
    });
}

// Call this function when the game initializes
preloadImages();


const tableau = Array.from({ length: 7 }, () => []);
const foundation = suits.map(suit => []);
let stock = [];
let waste = [];

// Distribute cards to tableau and stock
function distributeCards(deck) {
    let cardIndex = 0;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            tableau[i].push({ ...deck[cardIndex], faceUp: j === i });
            cardIndex++;
        }
    }
    stock = deck.slice(cardIndex);
}

distributeCards(deck);

// Helper to get the color of a card

// Timer code
let timerInterval;
let seconds = 0;
let isPlaying = false;

const timerDisplay = document.querySelector('.timer span');
const gameBoard = document.querySelector('.game-board');
const playPauseButton = document.getElementById('play-pause');
const playIcon = document.getElementById('play');
const pauseIcon = document.getElementById('pause');

function startTimer() {
  if (!isPlaying) {
      isPlaying = true;
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline-block';
      timerInterval = setInterval(() => {
          seconds++;
          const minutes = Math.floor(seconds / 60);
          const secs = seconds % 60;
          timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }, 1000);
  }
}
function pauseTimer() {
  if (isPlaying) {
      isPlaying = false;
      playIcon.style.display = 'inline-block';
      pauseIcon.style.display = 'none';
      clearInterval(timerInterval);
  }
}
playPauseButton.addEventListener('click', () => {
  if (isPlaying) {
      pauseTimer();
  } else {
      startTimer();
  }
});
function addTimerStartListeners() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
      card.addEventListener('click', startTimer);
      card.addEventListener('dragstart', startTimer);
  });
}


function getColor(suit) {
    return ['hearts', 'diamonds'].includes(suit) ? 'red' : 'black';
}

// Check if a card can be moved to a tableau pile
function isValidTableauMove(card, toPile) {
    if (toPile.length === 0) {
        return card.rank === 'K'; // Only Kings can be placed on empty tableau piles
    }
    const topCard = toPile[toPile.length - 1];
    const isOppositeColor = getColor(card.suit) !== getColor(topCard.suit);
    const isOneLess = ranks.indexOf(card.rank) === ranks.indexOf(topCard.rank) - 1;
    return isOppositeColor && isOneLess;
}

// Check if a card can be moved to a foundation pile
function isValidFoundationMove(card, foundationPile, suit) {
  if (card.suit !== suit) {
      return false; // Card must match the suit of the foundation pile
  }
  if (foundationPile.length === 0) {
      return card.rank === 'A'; // Only Aces can start a foundation pile
  }
  const topCard = foundationPile[foundationPile.length - 1];
  const isOneMore = ranks.indexOf(card.rank) === ranks.indexOf(topCard.rank) + 1;
  return isOneMore;
}

let moves = 0;
let score = 0;

// Update moves counter
function updateMoves() {
  const moveCountDiv = document.querySelector('.move-count');
  moveCountDiv.querySelector('span').textContent = moves;
}

// Increment moves counter
function incrementMoves() {
  moves++;
  updateMoves();
}

// Decrement moves counter
function decrementMoves() {
  if (moves > 0) {
    moves--;
    updateMoves();
  }
}
// Update score counter
function updateScore() {
  const scoreDiv = document.querySelector('.score');
  scoreDiv.querySelector('span').textContent = score;
}

// Increment score counter
function incrementScore(points) {
  score += points;
  updateScore();
}

// Decrement score counter
function decrementScore(points) {
  if (score >= points) {
    score -= points;
    updateScore();
  }
}

// Move a card to a tableau pile
function moveToTableau(fromPile, toPile, cardIndex) {
  const card = fromPile[cardIndex];
  if (isValidTableauMove(card, toPile)) {
    const movingCards = fromPile.splice(cardIndex);
    toPile.push(...movingCards);
    if (fromPile.length > 0) {
      fromPile[fromPile.length - 1].faceUp = true;
    }
    renderGame();
    incrementMoves();
    incrementScore(10); 
  }
}

function moveWasteToTableau(toPile) {
  if (waste.length > 0) {
    const card = waste[waste.length - 1];
    if (isValidTableauMove(card, toPile)) {
      const movedCard = waste.pop();
      movedCard.faceUp = true; // Ensure the card is face-up
      toPile.push(movedCard);
      renderGame();
      incrementMoves();
      incrementScore(10); 
    }
  }
}

// Move a card to a foundation pile
function moveToFoundation(fromPile, cardIndex, foundationIndex) {
  const card = fromPile[cardIndex];
  const suit = suits[foundationIndex];
  if (isValidFoundationMove(card, foundation[foundationIndex], suit)) {
    foundation[foundationIndex].push(card);
    fromPile.splice(cardIndex, 1);
    if (fromPile.length > 0 && tableau.includes(fromPile)) {
      fromPile[fromPile.length - 1].faceUp = true;
    }
    renderGame();
    incrementMoves();
    incrementScore(50); 
  }
}
function moveWasteToFoundation(foundationIndex) {
  if (waste.length > 0) {
    const card = waste[waste.length - 1];
    const suit = suits[foundationIndex];
    if (isValidFoundationMove(card, foundation[foundationIndex], suit)) {
      foundation[foundationIndex].push(waste.pop());
      renderGame();
      incrementMoves();
      incrementScore(50); 
    }
  }
}

// Draw cards from the stock to the waste
function drawCardFromStock() {
    if (stock.length > 0) {
        const card = stock.pop();
        card.faceUp = true;
        waste.push(card);
        renderGame();
        incrementMoves();
        decrementScore(5);
    } else {
        // Reset stock from waste when stock is empty
        stock = waste.reverse().map(card => ({ ...card, faceUp: false }));
        waste = [];
        renderGame();
    }
}
let draggedCard = null;
let draggedFromPile = null;
let draggedCardIndex = null;

function onDragStart(e) {
    draggedCard = e.target;
    draggedFromPile = draggedCard.closest('.pile')?.id|| 'waste';
    draggedCardIndex = parseInt(draggedCard.dataset.index, 10);
    e.dataTransfer.setData('text/plain', '');
}

function onDragEnd() {
    draggedCard = null;
    draggedFromPile = null;
    draggedCardIndex = null;
}

function onDrop(e) {
  e.preventDefault();

  const targetPileId = e.target.closest('.pile')?.id;
  if (!targetPileId) return; // Invalid drop

  const isTableau = targetPileId.startsWith('tableau');
  const targetIndex = parseInt(targetPileId.split('-')[1], 10) - 1;
  const targetPile = isTableau ? tableau[targetIndex] : foundation[targetIndex];

  const card = getCardFromPile(draggedFromPile, draggedCardIndex);

  if (draggedFromPile === 'waste') {
      if (isTableau && isValidTableauMove(card, targetPile)) {
          moveWasteToTableau(targetPile);  // This moves the card from waste to tableau
      } else if (!isTableau && isValidFoundationMove(card, targetPile, suits[targetIndex])) {
          moveWasteToFoundation(targetIndex);  // Move to foundation pile
      }
  } else if (isTableau && isValidTableauMove(card, targetPile)) {
      moveToTableau(getPile(draggedFromPile), targetPile, draggedCardIndex);
  } else if (!isTableau && isValidFoundationMove(card, targetPile, suits[targetIndex])) {
      moveToFoundation(getPile(draggedFromPile), draggedCardIndex, targetIndex);
  }

  renderGame();  // Re-render game state after drop
}

function allowDrop(e) {
    e.preventDefault();
}

function getPile(pileId) {
  if (pileId.startsWith('tableau')) {
      return tableau[parseInt(pileId.split('-')[1], 10) - 1];
  } else if (pileId.startsWith('foundation')) {
      return foundation[parseInt(pileId.split('-')[1], 10) - 1];
  } else if (pileId === 'waste') {
      return waste;
  } else if (pileId === 'stock') {
      return stock;
  }
  return null; // Invalid ID
}


function getCardFromPile(pileId, index) {
    const pile = getPile(pileId);
    return pile[index];
}

function onDrop(e) {
  e.preventDefault();

  const targetPileId = e.target.closest('.pile')?.id;
  if (!targetPileId) return; // Invalid drop

  const isTableau = targetPileId.startsWith('tableau');
  const targetIndex = parseInt(targetPileId.split('-')[1], 10) - 1;
  const targetPile = isTableau ? tableau[targetIndex] : foundation[targetIndex];

  const card = getCardFromPile(draggedFromPile, draggedCardIndex);

  if (draggedFromPile === 'waste') {
    if (isTableau && isValidTableauMove(card, targetPile)) {
        moveWasteToTableau(targetPile);  // This moves the card from waste to tableau
    } else if (!isTableau && isValidFoundationMove(card, targetPile, suits[targetIndex])) {
        moveWasteToFoundation(targetIndex);  // Move to foundation pile
    }
} else if (isTableau && isValidTableauMove(card, targetPile)) {
    moveToTableau(getPile(draggedFromPile), targetPile, draggedCardIndex);
    // Ensure the dropped card is face-up
    targetPile[targetPile.length - 1].faceUp = true; 
} else if (!isTableau && isValidFoundationMove(card, targetPile, suits[targetIndex])) {
    moveToFoundation(getPile(draggedFromPile), draggedCardIndex, targetIndex);
}

  renderGame();
}

// Check if the game is won
function checkWin() {
    return foundation.every(pile => pile.length === 13);
}
// Render Card Face
function renderCardFace(card) {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card');
  cardDiv.dataset.suit = card.suit;
  cardDiv.dataset.rank = card.rank;

  if (card.faceUp) {
      // Use preloaded image
      const cachedImage = imageCache[`${card.suit}-${card.rank}`];
      if (cachedImage) {
          cardDiv.style.backgroundImage = `url(${cachedImage.src})`;
      }
  } else {
      cardDiv.style.backgroundImage = 'url("img/card-back.svg")'; // Use a cached back image if needed
  }

  return cardDiv;
}

// Render the game state
function renderGame() {
  const tableauDiv = document.getElementById('tableau');
    const foundationDiv = document.querySelector('.foundation-piles');
    const stockDiv = document.getElementById('stock');
    const wasteDiv = document.getElementById('waste');

    tableauDiv.innerHTML = '';
    foundationDiv.innerHTML = '';
    stockDiv.innerHTML = '';
    wasteDiv.innerHTML = '';

    // Render Tableau
    tableau.forEach((pile, pileIndex) => {
        const pileDiv = document.createElement('div');
        pileDiv.classList.add('pile');
        pileDiv.id = `tableau-${pileIndex + 1}`;
        pileDiv.addEventListener('dragover', allowDrop);
        pileDiv.addEventListener('drop', onDrop);

        pile.forEach((card, cardIndex) => {
          const cardDiv = renderCardFace(card);
            cardDiv.dataset.pile = `tableau-${pileIndex + 1}`;
            cardDiv.dataset.index = cardIndex;

            if (!card.faceUp) {
                cardDiv.classList.add('face-down');
            } else {
                // cardDiv.textContent = `${card.rank} ${card.suit}`;
            }

            cardDiv.style.top = `${cardIndex * 20}px`;
            pileDiv.appendChild(cardDiv);

            cardDiv.setAttribute('draggable', 'true');
            cardDiv.addEventListener('dragstart', onDragStart);
            cardDiv.addEventListener('dragend', onDragEnd);

            cardDiv.addEventListener('click', () => {
              if (!card.faceUp) return;
                tableau.forEach((toPile, toIndex) => {
                    if (isValidTableauMove(card, toPile)) {
                        moveToTableau(pile, toPile, cardIndex);
                    }
                });
                foundation.forEach((foundationPile, foundationIndex) => {
                    if (isValidFoundationMove(card, foundationPile, suits[foundationIndex])) {
                        moveToFoundation(pile, cardIndex, foundationIndex);
                    }
                });
            });
        });

        tableauDiv.appendChild(pileDiv);
    });


    // Render Foundation
    foundation.forEach((pile, pileIndex) => {
        const pileDiv = document.createElement('div');
        pileDiv.classList.add('pile');
        pileDiv.id = `foundation-${pileIndex + 1}`;
        pileDiv.addEventListener('dragover', allowDrop);
        pileDiv.addEventListener('drop', onDrop);

        if (pile.length > 0) {
            const card = pile[pile.length - 1];
            const cardDiv = renderCardFace(card);
            pileDiv.appendChild(cardDiv);
        }

        foundationDiv.appendChild(pileDiv);
    });

    // Render Stock
    stock.forEach(() => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card', 'face-down');
        stockDiv.appendChild(cardDiv);
    });

    // Render Waste
    waste.forEach((card, cardIndex) => {
      const cardDiv = renderCardFace(card);
        cardDiv.dataset.pile = 'waste';
        cardDiv.dataset.index = cardIndex;
        // cardDiv.textContent = `${card.rank} ${card.suit}`;
        wasteDiv.appendChild(cardDiv);

        // Add event listener to waste cards
        cardDiv.setAttribute('draggable', 'true');
        cardDiv.addEventListener('dragstart', onDragStart);
        cardDiv.addEventListener('dragend', onDragEnd);
        cardDiv.addEventListener('click', () => {
            tableau.forEach((toPile, toIndex) => {
                if (isValidTableauMove(card, toPile)) {
                    moveWasteToTableau(toPile);
                }
            });
            foundation.forEach((foundationPile, foundationIndex) => {
                if (isValidFoundationMove(card, foundation[foundationIndex], suits[foundationIndex])) {
                    moveWasteToFoundation(foundationIndex);
                }
            });
        });
    });

    stockDiv.addEventListener('click', drawCardFromStock);
    addTimerStartListeners();
}

// Initial render
renderGame();
updateMoves(); 