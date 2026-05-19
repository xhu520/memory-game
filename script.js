const CARD_PAIRS = 8;
const CARD_SYMBOLS = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎺', '🎸', '🎻'];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let seconds = 0;
let timerInterval = null;
let isProcessing = false;

function initGame() {
    createCards();
    shuffleCards();
    renderBoard();
    resetGame();
}

function createCards() {
    cards = [];
    for (let i = 0; i < CARD_PAIRS; i++) {
        cards.push({
            id: i * 2,
            symbol: CARD_SYMBOLS[i],
            flipped: false,
            matched: false
        });
        cards.push({
            id: i * 2 + 1,
            symbol: CARD_SYMBOLS[i],
            flipped: false,
            matched: false
        });
    }
}

function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

function renderBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        
        cardElement.innerHTML = `
            <div class="card-back"></div>
            <div class="card-front">${card.symbol}</div>
        `;
        
        cardElement.addEventListener('click', () => flipCard(index));
        board.appendChild(cardElement);
    });
}

function flipCard(index) {
    if (isProcessing) return;
    
    const card = cards[index];
    if (card.flipped || card.matched) return;
    if (flippedCards.length >= 2) return;
    
    startTimer();
    
    card.flipped = true;
    const cardElement = document.querySelector(`[data-index="${index}"]`);
    cardElement.classList.add('flipped');
    
    flippedCards.push({ index, card });
    
    if (flippedCards.length === 2) {
        moves++;
        updateMoves();
        checkMatch();
    }
}

function checkMatch() {
    isProcessing = true;
    
    const [first, second] = flippedCards;
    
    if (first.card.symbol === second.card.symbol) {
        setTimeout(() => {
            cards[first.index].matched = true;
            cards[second.index].matched = true;
            
            const firstElement = document.querySelector(`[data-index="${first.index}"]`);
            const secondElement = document.querySelector(`[data-index="${second.index}"]`);
            
            firstElement.classList.add('matched');
            secondElement.classList.add('matched');
            
            matchedPairs++;
            updateMatches();
            
            flippedCards = [];
            isProcessing = false;
            
            if (matchedPairs === CARD_PAIRS) {
                gameWon();
            }
        }, 500);
    } else {
        setTimeout(() => {
            cards[first.index].flipped = false;
            cards[second.index].flipped = false;
            
            const firstElement = document.querySelector(`[data-index="${first.index}"]`);
            const secondElement = document.querySelector(`[data-index="${second.index}"]`);
            
            firstElement.classList.remove('flipped');
            secondElement.classList.remove('flipped');
            
            flippedCards = [];
            isProcessing = false;
        }, 1000);
    }
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        seconds++;
        updateTimer();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimer() {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timer').textContent = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateMoves() {
    document.getElementById('moves').textContent = moves;
}

function updateMatches() {
    document.getElementById('matches').textContent = `${matchedPairs}/${CARD_PAIRS}`;
}

function resetGame() {
    stopTimer();
    seconds = 0;
    moves = 0;
    matchedPairs = 0;
    flippedCards = [];
    isProcessing = false;
    
    updateTimer();
    updateMoves();
    updateMatches();
    
    createCards();
    shuffleCards();
    renderBoard();
}

function gameWon() {
    stopTimer();
    
    document.getElementById('final-time').textContent = document.getElementById('timer').textContent;
    document.getElementById('final-moves').textContent = moves;
    
    setTimeout(() => {
        document.getElementById('game-over-overlay').style.display = 'flex';
    }, 500);
}

function hideGameOver() {
    document.getElementById('game-over-overlay').style.display = 'none';
}

function initEventListeners() {
    document.getElementById('restart-btn').addEventListener('click', resetGame);
    document.getElementById('play-again').addEventListener('click', () => {
        hideGameOver();
        resetGame();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initGame();
});