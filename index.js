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

// Draw cards from the stock to the waste
function drawCardFromStock() {
    if (stock.length > 0) {
        const card = stock.pop();
        waste.push(card);
        renderGame();
    } else {
        // Reset stock from waste when stock is empty
        stock = waste.reverse().map(card => ({ ...card, faceUp: false }));
        waste = [];
        renderGame();
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
  }
}
function moveWasteToFoundation(foundationIndex) {
  if (waste.length > 0) {
      const card = waste[waste.length - 1];
      const suit = suits[foundationIndex];
      if (isValidFoundationMove(card, foundation[foundationIndex], suit)) {
          foundation[foundationIndex].push(waste.pop());
          renderGame();
      }
  }
}
// Check if the game is won
function checkWin() {
    return foundation.every(pile => pile.length === 13);
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

            cardDiv.style.top = `${cardIndex * 20}px`;
            pileDiv.appendChild(cardDiv);

            cardDiv.addEventListener('click', () => {
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

        if (pile.length > 0) {
            const card = pile[pile.length - 1];
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');
            cardDiv.dataset.suit = card.suit;
            cardDiv.dataset.rank = card.rank;
            cardDiv.textContent = `${card.rank} ${card.suit}`;
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
    waste.forEach((card) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.dataset.suit = card.suit;
        cardDiv.dataset.rank = card.rank;
        cardDiv.textContent = `${card.rank} ${card.suit}`;
        wasteDiv.appendChild(cardDiv);

        // Add event listener to waste cards
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
}

// Initial render
renderGame();