const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = Array.from({ length: 13 }, (_, i) => i + 1);
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
    const foundationDiv = document.getElementById('foundation');
    const stockDiv = document.getElementById('stock');

    tableau.forEach((pile, index) => {
        const pileDiv = document.createElement('div');
        pileDiv.classList.add('pile');
        pileDiv.dataset.pileIndex = index;
    
        pile.forEach((card, cardIndex) => {
          const cardDiv = document.createElement('div');
          cardDiv.classList.add('card');
          if (!card.faceUp) {
            cardDiv.classList.add('face-down');
          } else {
            cardDiv.textContent = `${card.rank} of ${card.suit}`;
          }
          cardDiv.style.top = `${cardIndex * 20}px`; // Offset cards vertically
          pileDiv.appendChild(cardDiv);
        });
    
        tableauDiv.appendChild(pileDiv);
    });

    foundation.forEach(() => {
        const pileDiv = document.createElement('div');
        pileDiv.classList.add('pile');
        foundationDiv.appendChild(pileDiv);
    });

    stockDiv.textContent = `${stock.length} cards`;

}    
renderGame();
