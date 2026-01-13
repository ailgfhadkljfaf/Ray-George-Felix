var requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
      window.setTimeout(callback, 1000 / 60);
    };
})();

//create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');
var updateables = [];
var fireballs = [];
var player = new Mario.Player([0,0]);

//we might have to get the size and calculate the scaling
//but this method should let us make it however big.
//Cool!
//TODO: Automatically scale the game to work and look good on widescreen.
//TODO: fiddling with scaled sprites looks BETTER, but not perfect. Hmm.
canvas.width = 762;
canvas.height = 720;
ctx.scale(3,3);
canvas.style.display = 'none';
document.body.appendChild(canvas);

//viewport
var vX = 0,
    vY = 0,
    vWidth = 256,
    vHeight = 240;

//load our images
resources.load([
  'sprites/player.png',
  'sprites/enemy.png',
  'sprites/tiles.png',
  'sprites/playerl.png',
  'sprites/items.png',
  'sprites/enemyr.png',
]);

resources.onReady(function() {
  // Menu is already shown, wait for user to login
});

function startGame() {
  initializeGame();
}
var level;
var sounds;
var music;

//initialize
var lastTime;
function initializeGame() {
  canvas.style.display = 'block';
  music = {
    overworld: new Audio('sounds/aboveground_bgm.ogg'),
    underground: new Audio('sounds/underground_bgm.ogg'),
    clear: new Audio('sounds/stage_clear.wav'),
    death: new Audio('sounds/mariodie.wav')
  };
  sounds = {
    smallJump: new Audio('sounds/jump-small.wav'),
    bigJump: new Audio('sounds/jump-super.wav'),
    breakBlock: new Audio('sounds/breakblock.wav'),
    bump: new Audio('sounds/bump.wav'),
    coin: new Audio('sounds/coin.wav'),
    fireball: new Audio('sounds/fireball.wav'),
    flagpole: new Audio('sounds/flagpole.wav'),
    kick: new Audio('sounds/kick.wav'),
    pipe: new Audio('sounds/pipe.wav'),
    itemAppear: new Audio('sounds/itemAppear.wav'),
    powerup: new Audio('sounds/powerup.wav'),
    stomp: new Audio('sounds/stomp.wav')
  };
  Mario.oneone();
  lastTime = Date.now();
  main();
}

var gameTime = 0;

//set up the game loop
function main() {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  update(dt);
  render();

  lastTime = now;
  requestAnimFrame(main);
}

function update(dt) {
  gameTime += dt;

  handleInput(dt);
  updateEntities(dt, gameTime);

  checkCollisions();
}

function handleInput(dt) {
  if (player.piping || player.dying || player.noInput) return; //don't accept input

  if (input.isDown('RUN')){
    player.run();
  } else {
    player.noRun();
  }
  if (input.isDown('JUMP')) {
    player.jump();
  } else {
    //we need this to handle the timing for how long you hold it
    player.noJump();
  }

  if (input.isDown('FIRE')) {
    player.shoot();
  } else {
    player.noShoot();
  }

  if (input.isDown('INVINCIBILITY')) {
    player.toggleInvincibility();
  } else {
    player.noToggleInvincibility();
  }

  if (input.isDown('SPACE')) {
    player.fly();
  } else {
    player.noFly();
  }

  if (input.isDown('DOWN')) {
    player.crouch();
  } else {
    player.noCrouch();
  }

  if (input.isDown('LEFT')) { // 'd' or left arrow
    player.moveLeft();
  }
  else if (input.isDown('RIGHT')) { // 'k' or right arrow
    player.moveRight();
  } else {
    player.noWalk();
  }
}

//update all the moving stuff
function updateEntities(dt, gameTime) {
  player.update(dt, vX);
  updateables.forEach (function(ent) {
    ent.update(dt, gameTime);
  });

  //This should stop the jump when he switches sides on the flag.
  if (player.exiting) {
    if (player.pos[0] > vX + 96)
      vX = player.pos[0] - 96
  } else if (level.scrolling) {
    // Scroll forward when player moves past the right threshold
    if (player.pos[0] > vX + 80) {
      vX = player.pos[0] - 80;
    }
    // Scroll backward when player moves past the left threshold
    else if (player.pos[0] < vX + 48) {
      vX = Math.max(0, player.pos[0] - 48);
    }
  }

  if (player.powering.length !== 0 || player.dying) { return; }
  
  level.items.forEach (function(ent) {
    ent.update(dt);
  });

  level.enemies.forEach (function(ent) {
    ent.update(dt, vX);
  });

  fireballs.forEach(function(fireball) {
    fireball.update(dt);
  });
  
  level.pipes.forEach (function(pipe) {
    pipe.update(dt);
  });
}

//scan for collisions
function checkCollisions() {
  if (player.powering.length !== 0 || player.dying) { return; }
  player.checkCollisions();

  //Apparently for each will just skip indices where things were deleted.
  level.items.forEach(function(item) {
    item.checkCollisions();
  });
  level.enemies.forEach (function(ent) {
    ent.checkCollisions();
  });
  fireballs.forEach(function(fireball){
    fireball.checkCollisions();
  });
  level.pipes.forEach (function(pipe) {
    pipe.checkCollisions();
  });
}

//draw the game!
function render() {
  updateables = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = level.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //scenery gets drawn first to get layering right.
  for(var i = 0; i < 15; i++) {
    for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
      if (level.scenery[i][j]) {
        renderEntity(level.scenery[i][j]);
      }
    }
  }

  //then items
  level.items.forEach (function (item) {
    renderEntity(item);
  });

  level.enemies.forEach (function(enemy) {
    renderEntity(enemy);
  });



  fireballs.forEach(function(fireball) {
    renderEntity(fireball);
  })
  
  //then we draw every static object.
  for(var i = 0; i < 15; i++) {
    for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
      if (level.statics[i][j]) {
        renderEntity(level.statics[i][j]);
      }
      if (level.blocks[i][j]) {
        renderEntity(level.blocks[i][j]);
        updateables.push(level.blocks[i][j]);
      }
    }
  }

  //then the player
  if (player.invincibility % 2 === 0) {
    renderEntity(player);
  }

  //Mario goes INTO pipes, so naturally they go after.
  level.pipes.forEach (function(pipe) {
    renderEntity(pipe);
  });

  // Flight meter / cooldown bar (only visible while flying, in cooldown, or during flash)
  try {
    if (player.flying || player.cooldownActive || player.flashActive || player.flashVisible) {
      var barWidth = Math.round(vWidth * 0.6); // not full width
      var barHeight = 8;
      var barX = Math.round((vWidth - barWidth) / 2);
      var barY = vHeight - barHeight - 2; // 2 pixels above bottom

      // background (border)
      ctx.fillStyle = '#000000';
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

      // Flash sequence: alternate full blue and full white fills
      if (player.flashActive) {
        ctx.fillStyle = player.flashVisible ? '#0000FF' : '#FFFFFF';
        ctx.fillRect(barX, barY, barWidth, barHeight);
      } else if (player.flying) {
        // Blue full, white overlays from right as meter is used
        var usedFrac = 1 - (player.flyMeter / player.flyMeterMax);
        usedFrac = Math.max(0, Math.min(1, usedFrac));
        var whiteWidth = Math.round(usedFrac * barWidth);

        ctx.fillStyle = '#0000FF'; // blue
        ctx.fillRect(barX, barY, barWidth, barHeight);

        if (whiteWidth > 0) {
          ctx.fillStyle = '#FFFFFF'; // white used portion
          ctx.fillRect(barX + (barWidth - whiteWidth), barY, whiteWidth, barHeight);
        }
      } else if (player.cooldownActive) {
        // Cooldown: white base, red grows from left
        var frac = Math.max(0, Math.min(1, player.cooldownTimer / player.cooldownMax));
        var redWidth = Math.round(frac * barWidth);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        if (redWidth > 0) {
          ctx.fillStyle = '#FF0000';
          ctx.fillRect(barX, barY, redWidth, barHeight);
        }
      }
    }
  } catch (e) {
    // rendering should never crash game loop; swallow errors
  }
}

function renderEntity(entity) {
  entity.render(ctx, vX, vY);
}

window.startGame = startGame;
