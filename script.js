const CARD_SYMBOLS = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎺', '🎸', '🎻', '🎹', '🎤', '🎧', '🎼', '🎵', '🎶', '🎲', '🎯'];

const BASE_FLIP_PAIRS = 4;
const MAX_FLIP_PAIRS = 8;
const PAIRS_PER_LEVEL = 1;

const BASE_FLIP_BACK_DELAY = 1000;
const MIN_FLIP_BACK_DELAY = 400;
const DIFFICULTY_DECREASE = 100;

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let seconds = 0;
let timerInterval = null;
let isProcessing = false;
let level = 1;

function getCardPairs() {
    const pairs = BASE_FLIP_PAIRS + (level - 1) * PAIRS_PER_LEVEL;
    return Math.min(pairs, MAX_FLIP_PAIRS);
}

function initGame() {
    createCards();
    shuffleCards();
    renderBoard();
    resetGame();
}

function createCards() {
    cards = [];
    const pairs = getCardPairs();
    for (let i = 0; i < pairs; i++) {
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

function getFlipBackDelay() {
    const delay = BASE_FLIP_BACK_DELAY - (level - 1) * DIFFICULTY_DECREASE;
    return Math.max(delay, MIN_FLIP_BACK_DELAY);
}

function checkMatch() {
    isProcessing = true;
    
    const [first, second] = flippedCards;
    const flipBackDelay = getFlipBackDelay();
    
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
            
            if (matchedPairs === getCardPairs()) {
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
        }, flipBackDelay);
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
    document.getElementById('matches').textContent = `${matchedPairs}/${getCardPairs()}`;
}

function resetGame() {
    stopTimer();
    seconds = 0;
    moves = 0;
    matchedPairs = 0;
    flippedCards = [];
    isProcessing = false;
    level = 1;
    
    updateTimer();
    updateMoves();
    updateMatches();
    updateLevel();
    
    createCards();
    shuffleCards();
    renderBoard();
}

function gameWon() {
    stopTimer();
    
    level++;
    
    document.getElementById('final-time').textContent = document.getElementById('timer').textContent;
    document.getElementById('final-moves').textContent = moves;
    document.getElementById('final-level').textContent = level - 1;
    document.getElementById('next-level').textContent = level;
    
    setTimeout(() => {
        document.getElementById('game-over-overlay').style.display = 'flex';
    }, 500);
}

function updateLevel() {
    const levelElement = document.getElementById('level');
    if (levelElement) {
        levelElement.textContent = level;
    }
}

function hideGameOver() {
    document.getElementById('game-over-overlay').style.display = 'none';
}

function initEventListeners() {
    document.getElementById('restart-btn').addEventListener('click', resetGame);
    document.getElementById('play-again').addEventListener('click', () => {
        hideGameOver();
        stopTimer();
        seconds = 0;
        moves = 0;
        matchedPairs = 0;
        flippedCards = [];
        isProcessing = false;
        
        updateTimer();
        updateMoves();
        updateMatches();
        updateLevel();
        
        createCards();
        shuffleCards();
        renderBoard();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initGame();
});