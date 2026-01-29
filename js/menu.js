// Menu System for Mario Game
var gameMenuActive = true;
var gameStarted = false;
var playerDead = false;

document.addEventListener('DOMContentLoaded', function() {
  initializeMenu();
});

function initializeMenu() {
  const startBtn = document.getElementById('startBtn');
  const instructionsBtn = document.getElementById('instructionsBtn');
  const creditsBtn = document.getElementById('creditsBtn');
  const backBtn = document.getElementById('backBtn');
  const creditsBackBtn = document.getElementById('creditsBackBtn');

  // Start Game button
  startBtn.addEventListener('click', function() {
    startGame();
  });

  // Instructions button
  instructionsBtn.addEventListener('click', function() {
    showInstructions();
  });

  // Credits button
  creditsBtn.addEventListener('click', function() {
    showCredits();
  });

  // Back button from instructions
  backBtn.addEventListener('click', function() {
    hideInstructions();
  });

  // Back button from credits
  creditsBackBtn.addEventListener('click', function() {
    hideCredits();
  });

  // Try Again button
  const tryAgainBtn = document.getElementById('tryAgainBtn');
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', function() {
      tryAgain();
    });
  }

  // Rage Quit button
  const rageQuitBtn = document.getElementById('rageQuitBtn');
  if (rageQuitBtn) {
    rageQuitBtn.addEventListener('click', function() {
      rageQuit();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (gameMenuActive && !gameStarted) {
      if (e.key === 'Enter') {
        startGame();
      }
    }
  });
}

function startGame() {
  const menu = document.getElementById('menu');
  menu.classList.add('hidden');
  gameMenuActive = false;
  gameStarted = true;
}

function showInstructions() {
  const menu = document.getElementById('menu');
  const instructionsScreen = document.getElementById('instructions-screen');
  menu.classList.add('hidden');
  instructionsScreen.classList.remove('hidden');
}

function hideInstructions() {
  const menu = document.getElementById('menu');
  const instructionsScreen = document.getElementById('instructions-screen');
  menu.classList.remove('hidden');
  instructionsScreen.classList.add('hidden');
}

function showCredits() {
  const menu = document.getElementById('menu');
  const creditsScreen = document.getElementById('credits-screen');
  menu.classList.add('hidden');
  creditsScreen.classList.remove('hidden');
}

function hideCredits() {
  const menu = document.getElementById('menu');
  const creditsScreen = document.getElementById('credits-screen');
  menu.classList.remove('hidden');
  creditsScreen.classList.add('hidden');
}

function returnToMenu() {
  const menu = document.getElementById('menu');
  const instructionsScreen = document.getElementById('instructions-screen');
  const creditsScreen = document.getElementById('credits-screen');
  const deathScreen = document.getElementById('death-screen');
  
  menu.classList.remove('hidden');
  instructionsScreen.classList.add('hidden');
  creditsScreen.classList.add('hidden');
  if (deathScreen) deathScreen.classList.add('hidden');
  
  gameMenuActive = true;
  gameStarted = false;
  playerDead = false;
}

function showDeathScreen() {
  const deathScreen = document.getElementById('death-screen');
  if (deathScreen) {
    deathScreen.classList.remove('hidden');
    playerDead = true;
    gameStarted = false;
  }
}

function hideDeathScreen() {
  const deathScreen = document.getElementById('death-screen');
  if (deathScreen) {
    deathScreen.classList.add('hidden');
    playerDead = false;
  }
}

function tryAgain() {
  hideDeathScreen();
  // Reset game state and restart the level
  gameMenuActive = false;
  gameStarted = true;
  playerDead = false;
  
  // Reset the game: recreate player and reload level
  if (typeof level !== 'undefined' && level.loader) {
    // Reset updateables and fireballs
    if (typeof updateables !== 'undefined') {
      updateables = [];
    }
    if (typeof fireballs !== 'undefined') {
      fireballs = [];
    }
    // Recreate player
    if (typeof Mario !== 'undefined' && typeof Mario.Player !== 'undefined') {
      player = new Mario.Player(level.playerPos);
    }
    // Reset input
    if (typeof input !== 'undefined') {
      input.reset();
    }
    // Reload the level
    level.loader.call();
  }
}

function rageQuit() {
  hideDeathScreen();
  returnToMenu();
}
