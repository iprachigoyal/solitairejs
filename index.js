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
const tableau = Array.from({ length: 7 }, () => []);
const foundation = [[], [], [], []];
let stock = [];
let waste = [];


function distributeCards(deck) {
    let cardIndex = 0;
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        tableau[i].push({ ...deck[cardIndex], faceUp: j === i });
        cardIndex++;
      }
    }
    stock = deck.slice(cardIndex); // Remaining cards go to stock
}

distributeCards(deck);

function renderGame() {
  const tableauDiv = document.getElementById('tableau');
  const foundationDiv = document.querySelector('.foundation-piles');
  const stockDiv = document.getElementById('stock');
  const wasteDiv = document.getElementById('waste');

  // Clear existing content
  tableauDiv.innerHTML = '';
  foundationDiv.innerHTML = '';
  stockDiv.innerHTML = '';
  wasteDiv.innerHTML = '';

  // Render Tableau Piles
  tableau.forEach((pile, pileIndex) => {
      const pileDiv = document.createElement('div');
      pileDiv.classList.add('pile');
      pileDiv.id = `tableau-${pileIndex + 1}`;

      pile.forEach((card, cardIndex) => {
          const cardDiv = document.createElement('div');
          cardDiv.classList.add('card');
          cardDiv.dataset.suit = card.suit;
          cardDiv.dataset.rank = card.rank;

          if (!card.faceUp) {
              cardDiv.classList.add('face-down');
          } else {
              cardDiv.textContent = `${card.rank} ${card.suit}`;
          }

          // Offset cards vertically in tableau
          cardDiv.style.top = `${cardIndex * 20}px`;
          pileDiv.appendChild(cardDiv);
      });

      tableauDiv.appendChild(pileDiv);
  });

  // Render Foundation Piles
  foundation.forEach((pile, pileIndex) => {
      const pileDiv = document.createElement('div');
      pileDiv.classList.add('pile');
      pileDiv.id = `foundation-${pileIndex + 1}`;

      if (pile.length > 0) {
          const card = pile[pile.length - 1]; // Show the top card
          const cardDiv = document.createElement('div');
          cardDiv.classList.add('card');
          cardDiv.dataset.suit = card.suit;
          cardDiv.dataset.rank = card.rank;
          cardDiv.textContent = `${card.rank} ${card.suit}`;
          pileDiv.appendChild(cardDiv);
      }

      foundationDiv.appendChild(pileDiv);
  });

  // Render Stock Pile
  stock.forEach((card, index) => {
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('card', 'face-down');
      cardDiv.dataset.suit = card.suit;
      cardDiv.dataset.rank = card.rank;
      stockDiv.appendChild(cardDiv);
  });

  // Render Waste Pile
  waste.forEach((card, index) => {
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('card');
      cardDiv.dataset.suit = card.suit;
      cardDiv.dataset.rank = card.rank;
      cardDiv.textContent = `${card.rank} ${card.suit}`;
      wasteDiv.appendChild(cardDiv);
  });
}  
renderGame();
