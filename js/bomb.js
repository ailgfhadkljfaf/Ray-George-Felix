(function() {
  if (typeof Mario === 'undefined')
    window.Mario = {};

  var Bomb = Mario.Bomb = function(pos) {
    this.pos = [pos[0], pos[1]];
    this.sprite = new Mario.Sprite('sprites/bullets.png', [0, 16], [8, 8], 0);
    this.dead = false;
  };

  Bomb.prototype.update = function() {
    this.pos[1] += 3;
    if (this.pos[1] >= 200) {
      this.dead = true;
    }
  };

  Bomb.prototype.render = function(ctx, vX, vY) {
    this.sprite.render(ctx, this.pos[0], this.pos[1], vX, vY);
  };

  var Fire = Mario.Fire = function(pos) {
    this.pos = [pos[0], pos[1]];
    this.sprite = new Mario.Sprite('sprites/bullets.png', [16, 16], [16, 16], 0);
    this.duration = 180;
    this.dead = false;
  };

  Fire.prototype.update = function() {
    this.duration--;
    if (this.duration <= 0) {
      this.dead = true;
    }
    
    if (player.pos[0] + 16 > this.pos[0] && player.pos[0] < this.pos[0] + 16 &&
        player.pos[1] + 16 > this.pos[1] && player.pos[1] < this.pos[1] + 16) {
      if (!player.invincibilityToggle) {
        player.death();
      }
    }
  };

  Fire.prototype.render = function(ctx, vX, vY) {
    this.sprite.render(ctx, this.pos[0], this.pos[1], vX, vY);
  };
})();
