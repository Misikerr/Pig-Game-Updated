'use strict';
const player0El = document.querySelector('.player--0');
const player1El = document.querySelector('.player--1');
const score0El = document.getElementById('score--0');
const score1El = document.getElementById('score--1');
const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');
const diceEl = document.querySelector('.dice');
const btnNew = document.querySelector('.btn--new');
const btnHold = document.querySelector('.btn--hold');
const btnRoll = document.querySelector('.btn--roll');
const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');
const winningScoreInput = document.getElementById('winning-score-input');
const confirmBtn = document.getElementById('confirm-btn');
const winningScoreTxt = document.querySelector('.winning-score');
const btnCloseModal = document.querySelector('.close-modal');

//starting conditions
let scores,
  currentScore,
  activePlayer,
  playing,
  winningScore = 100;
let isAITurn = false;

// Audio elements
const rollSound = document.getElementById('rollSound');
const gameOverSound = document.getElementById('gameOverSound');
const holdBtnSound = document.getElementById('hold');

// Ensure audio elements are loaded
rollSound.load();
gameOverSound.load();
holdBtnSound.load();

const init = function () {
  scores = [0, 0];
  currentScore = 0;
  activePlayer = 0;
  playing = true;
  isAITurn = false;

  score0El.textContent = 0;
  score1El.textContent = 0;
  diceEl.classList.add('hidden');
  current0El.textContent = 0;
  current1El.textContent = 0;
  player0El.classList.remove('player--winner');
  player1El.classList.remove('player--winner');
  player0El.classList.add('player--active');
  player1El.classList.remove('player--active');
  // Reset player names
  document.getElementById('name--0').textContent = 'Your turn!';
  document.getElementById('name--1').textContent = "AI's turn..";
  // Display default winning score
  winningScoreTxt.textContent = `Winning Score: ${winningScore}`;
};
init();

const switchPlayer = function () {
  document.getElementById(`current--${activePlayer}`).textContent = 0;
  currentScore = 0;
  activePlayer = activePlayer === 0 ? 1 : 0;
  player0El.classList.toggle('player--active');
  player1El.classList.toggle('player--active');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

const makeAIDecision = function () {
  if (!playing || activePlayer !== 1) return;

  // Calculate risk factors
  const aiTotalScore = scores[1] + currentScore;
  const playerTotalScore = scores[0];
  const scoreDifference = playerTotalScore - aiTotalScore;
  const remainingToWin = winningScore - aiTotalScore;

  // AI decision making logic
  let shouldHold = false;

  // If AI is winning by a significant margin, be more conservative
  if (aiTotalScore > playerTotalScore + 20) {
    shouldHold = currentScore > 10 || Math.random() > 0.7;
  }
  // If AI is losing, be more aggressive
  else if (scoreDifference > 20) {
    shouldHold = currentScore > 15 || Math.random() > 0.5;
  }
  // If close to winning, be more conservative
  else if (remainingToWin < 30) {
    shouldHold = currentScore > 8 || Math.random() > 0.8;
  }
  // Default behavior
  else {
    shouldHold = currentScore > 12 || Math.random() > 0.6;
  }

  // Add a small delay to make AI moves visible
  setTimeout(() => {
    if (shouldHold) {
      btnHold.click();
    } else {
      btnRoll.click();
    }
  }, 1000);
};

btnRoll.addEventListener('click', function () {
  if (playing) {
    // Play roll sound
    rollSound.play();

    diceEl.classList.add('shake');
    setTimeout(() => {
      diceEl.classList.remove('shake');
    }, 150);

    const randomDiceRoll = Math.trunc(Math.random() * 6) + 1;

    diceEl.classList.remove('hidden');
    diceEl.src =`images/dice-${randomDiceRoll}.png`;

    if (randomDiceRoll !== 1) {
      currentScore += randomDiceRoll;
      document.getElementById(`current--${activePlayer}`).textContent =
        currentScore;

      // Only make AI decision if it's AI's turn
      if (activePlayer === 1) {
        makeAIDecision();
      }
    } else {
      // Reset current score when rolling a 1
      currentScore = 0;
      document.getElementById(`current--${activePlayer}`).textContent = 0;
      switchPlayer();
      // If it's now AI's turn, start AI's move
      if (activePlayer === 1) {
        setTimeout(() => {
          btnRoll.click();
        }, 1000);
      }
    }
  }
});

btnHold.addEventListener('click', function () {
  if (playing) {
    // Play hold sound
    holdBtnSound.play();

    scores[activePlayer] += currentScore;

    document.getElementById(`score--${activePlayer}`).textContent =
      scores[activePlayer];

    if (scores[activePlayer] >= winningScore) {
      playing = false;
      document
        .querySelector(`.player--${activePlayer}`)
        .classList.add('player--winner');
      document
        .querySelector(`.player--${activePlayer}`)
        .classList.remove('player--active');
      diceEl.classList.add('hidden');
      // Change player name to "You won!" / "Computer won!"
      document.getElementById(`name--${activePlayer}`).textContent =
        activePlayer === 0 ? 'You won!' : 'AI won!';
      
      // Play game over sound only if AI wins
      if (activePlayer === 1) {
        // Reset and play game over sound for 2 seconds
        gameOverSound.currentTime = 0;
        gameOverSound.play();
        setTimeout(() => {
          gameOverSound.pause();
          gameOverSound.currentTime = 0;
        }, 7500);
      }
    } else {
      switchPlayer();
      // If it's now AI's turn, start AI's move
      if (activePlayer === 1) {
        setTimeout(() => {
          btnRoll.click();
        }, 1000);
      }
    }
  }
});

btnNew.addEventListener('click', function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
  winningScoreInput.value = ''; // Clear previous input
  winningScoreInput.focus();

});

// Confirm button or Enter key
function confirmWinningScore() {
  const value = Number(winningScoreInput.value);
  if (value > 0 && value <= 500) {
    winningScore = value;
    winningScoreTxt.textContent = `Winning Score: ${winningScore}`;
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    init();
  } else {
    winningScoreTxt.textContent = 'Please enter a valid number 1-500 !';
  }
}

confirmBtn.addEventListener('click', confirmWinningScore);
btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
  if (!modal.classList.contains('hidden')) {
    if (e.key === 'Enter') {
      confirmWinningScore();
    }
    if (e.key === 'Backspace') {
      winningScoreInput.value = ''; // Clear input on Backspace
    }
  }
});
