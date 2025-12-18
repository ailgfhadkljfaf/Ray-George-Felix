(function() {
  if (typeof Mario === 'undefined')
    window.Mario = {};

  var Fireball = Mario.Fireball = function(pos, owner) {
    this.hit = 0;
    this.standing = false;
    this.owner = owner || 'player'; // 'player' or 'enemy'
    this.spawnTime = 0; // Track time since spawn for enemy fireballs

    Mario.Entity.call(this, {
      pos: pos,
      sprite: new Mario.Sprite('sprites/items.png', [96, 144], [8,8], 5, [0,1,2,3]),
      hitbox: [0,0,8,8]
    });
  }

  Mario.Util.inherits(Fireball, Mario.Entity);

  Fireball.prototype.spawn = function(left) {
    sounds.fireball.currentTime = 0;
    sounds.fireball.play();
    if (fireballs[0]) {
      this.idx = 1;
      fireballs[1] = this;
    } else {
      this.idx = 0;
      fireballs[0] = this;
    }
    this.vel[0] = (left ? -5 : 5);
    this.standing = false;
    this.vel[1] = 0;
    this.spawnTime = 0; // Reset spawn time
  }

  Fireball.prototype.render = function(ctx, vX, vY) {
    this.sprite.render(ctx, this.pos[0], this.pos[1], vX, vY);
  }

  Fireball.prototype.update = function(dt) {
    if (this.hit == 1) {
      this.sprite.pos = [96, 160];
      this.sprite.size = [16,16];
      this.sprite.frames = [0,1,2];
      this.sprite.speed = 8;
      this.hit += 1;
      return;
    } else if (this.hit == 5) {
      delete fireballs[this.idx];
      player.fireballs -= 1;
      return;
    } else if (this.hit) {
      this.hit += 1;
      return;
    }

    // Track spawn time for enemy fireballs and remove after 5 seconds
    if (this.owner === 'enemy') {
      this.spawnTime += dt;
      if (this.spawnTime > 5000) {
        delete fireballs[this.idx];
        player.fireballs -= 1;
        return;
      }
    }

    //In retrospect, the way collision is being handled is RIDICULOUS
    //but I don't have to use some horrible kludge for this.
    if (this.standing) {
      this.standing = false;
      this.vel[1] = -4;
    }

    this.acc[1] = 0.5;

    this.vel[1] += this.acc[1];
    this.pos[0] += this.vel[0];
    this.pos[1] += this.vel[1];
    this.sprite.update(dt);
  }

  Fireball.prototype.collideWall = function() {
    if (!this.hit) this.hit = 1;
  }

  Fireball.prototype.checkCollisions = function() {
    if (this.hit) return;
    var h = this.pos[1] % 16 < 8 ? 1 : 2;
    var w = this.pos[0] % 16 < 8 ? 1 : 2;

    var baseX = Math.floor(this.pos[0] / 16);
    var baseY = Math.floor(this.pos[1] / 16);

    // Check if fireball is at ground level (row 13) to bounce
    if (baseY + h > 13 && baseY < 14) {
      // Check if there's actual ground beneath
      for (var j = 0; j < w; j++) {
        if (level.statics[13][baseX + j]) {
          this.standing = true;
          return;
        }
      }
    }

    for (var i = 0; i < h; i++) {
      for (var j = 0; j < w; j++) {
        var checkX = baseX + j;
        var checkY = baseY + i;
        
        // Safe bounds check - only check Y axis like other entities do
        if (checkY < 0 || checkY >= 14) continue;
        
        if (level.statics[checkY][checkX]) {
          // Reflect off tile
          var tileX = checkX * 16;
          var tileY = checkY * 16;
          var verticalDist = Math.min(Math.abs(this.pos[1] - tileY), Math.abs(this.pos[1] - (tileY + 16)));
          var horizontalDist = Math.min(Math.abs(this.pos[0] - tileX), Math.abs(this.pos[0] - (tileX + 16)));
          
          if (verticalDist < horizontalDist) {
            this.vel[1] = -this.vel[1];
          } else {
            this.vel[0] = -this.vel[0];
          }
          return;
        }
        if (level.blocks[checkY][checkX]) {
          // Reflect off tile
          var tileX = checkX * 16;
          var tileY = checkY * 16;
          var verticalDist = Math.min(Math.abs(this.pos[1] - tileY), Math.abs(this.pos[1] - (tileY + 16)));
          var horizontalDist = Math.min(Math.abs(this.pos[0] - tileX), Math.abs(this.pos[0] - (tileX + 16)));
          
          if (verticalDist < horizontalDist) {
            this.vel[1] = -this.vel[1];
          } else {
            this.vel[0] = -this.vel[0];
          }
          return;
        }
      }
    }

    var that = this;
    level.enemies.forEach(function(enemy){
      if (enemy.flipping || enemy.pos[0] - vX > 336){ //stop checking once we get to far away dudes.
        return;
      } else if (that.owner === 'player') {
        // Player fireballs hit enemies
        that.isCollideWith(enemy);
      }
    });
    
    // Enemy fireballs hit player
    if (this.owner === 'enemy') {
      this.isCollideWith(player);
    }
  }

  Fireball.prototype.isCollideWith = function(ent) {
    //the first two elements of the hitbox array are an offset, so let's do this now.
    var hpos1 = [this.pos[0] + this.hitbox[0], this.pos[1] + this.hitbox[1]];
    var hpos2 = [ent.pos[0] + ent.hitbox[0], ent.pos[1] + ent.hitbox[1]];

    //if the hitboxes actually overlap
    if (!(hpos1[0] > hpos2[0]+ent.hitbox[2] || (hpos1[0]+this.hitbox[2] < hpos2[0]))) {
      if (!(hpos1[1] > hpos2[1]+ent.hitbox[3] || (hpos1[1]+this.hitbox[3] < hpos2[1]))) {
        if (ent instanceof Mario.Player) {
          // Enemy fireball hits player - only hit if not invincible
          if (ent.invincibility) {
            return; // Don't hit invincible player, continue trajectory
          }
          this.hit = 1;
          ent.damage();
        } else {
          // Player fireball hits enemy
          this.hit = 1;
          ent.bump();
        }
      }
    }
  };

  Fireball.prototype.bump = function() {;}
})();
