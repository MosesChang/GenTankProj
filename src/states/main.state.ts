'use strict';
/** Imports */
import State from './state';

enum TileType {
  Floor = 0,
  Hay,
  Wall
}

class Tile {
  public type: TileType ;
  private sprite: Phaser.Sprite ;
  private effectSprite: Phaser.Sprite ;
  private hp : number ;
  private game: Phaser.Game ;

  private ORIGIN_HP = [Number.POSITIVE_INFINITY, 100, Number.POSITIVE_INFINITY] ;

  constructor(game: Phaser.Game, id: TileType, sprite : Phaser.Sprite, effectGroup: Phaser.Group) {
    this.game = game ;
    this.sprite = sprite ;
    this.sprite.anchor.setTo(0.5, 0.5) ;
    this.setTileType(id) ;
    this.hp = this.ORIGIN_HP[this.type] ;
    if (id === TileType.Wall) {
      // Wall add to physic
      this.game.physics.p2.enable(this.sprite) ;
      this.sprite.body.kinematic = true ;
      this.sprite.body.static = true ;
    } else if (id === TileType.Hay)  {
      // Hay add effect
      this.effectSprite = this.game.add.sprite(0, 0, 'tileImage', id, effectGroup);
      this.effectSprite.position.setTo(this.sprite.position.x, this.sprite.position.y) ;
      this.effectSprite.anchor.setTo(0.5, 0.5) ;
    }
  }

  public setTileType(id: TileType) {
    this.type = id ;
    this.sprite.frame = this.type ;
  }

  public set visible(value: boolean) {
    this.sprite.visible = value ;
    if (this.type === TileType.Wall) {
      if (value) {
        this.sprite.body.addToWorld() ;
      } else {
        this.sprite.body.removeFromWorld() ;
      }
    }
  }

  public ckeckCollision(pos: Phaser.Point) {
    let width = pos.x - this.sprite.position.x ;
    let height = pos.y - this.sprite.position.y ;
    if (Math.sqrt((width * width) + (height * height)) <= 20) {
      return true ;
    } else {
      return false ;
    }
  }

  public hitBullet(damage: number) {
    this.hp -= damage ;
    if (this.hp <= 0) {   // Temp without point
      this.setTileType(TileType.Floor) ;
      this.hp = this.ORIGIN_HP[TileType.Floor] ;
      if (this.effectSprite) {
        this.effectSprite.visible = false ;
      }
    } else if (this.type === TileType.Hay) {
      this.game.add.tween(this.effectSprite.scale).to({x: 1.5, y: 1.5}, 100, Phaser.Easing.Cubic.Out, true, 0, 0, true) ;
    }
  }

  public get visible(): boolean {
    return this.sprite.visible ;
  }
}

// The main state of the game
export default class MainState extends State {
  private tiles : Tile[][] ;
  private allTileIndex : Phaser.Point[] ;
  private tankSprite: Phaser.Sprite ;
  private bulletSprite: Phaser.Sprite ;
  private bulletVelocity: Phaser.Point ;
  private tileGroup : Phaser.Group ;
  private tileEffectGroup: Phaser.Group ;
  private cursors: Phaser.CursorKeys ;
  private leftBoundry : number;
  private rightBoundry : number;
  private topBoundry : number;
  private bottomBoundry : number;

  private aBt : Phaser.Button ;
  private aPress : boolean = false ;
  private bBt : Phaser.Button ;
  private bPress : boolean = false ;
  private rBt : Phaser.Button ;
  private rPress : boolean = false ;
  private lBt : Phaser.Button ;
  private lPress : boolean = false ;
  private uBt : Phaser.Button ;
  private uPress : boolean = false ;
  private dBt : Phaser.Button ;
  private dPress : boolean = false ;

  private BULLET_DAMAGE = [10, 20, 25] ;
  private TANK_THRUST = 400 ;
  private TANK_ROTATE = 50 ;
  private BULLET_VELOCITY = 400 ;
  private TILE_WIDTH: number = 32 ;
  private VISIBLE_TILE_RADIUS: number = 15 ;    // test will be 5

  create(): void {
    // Init
    this.tiles = [] ;
    this.allTileIndex = [] ;
    this.game.world.setBounds(-10000, -10000, 19200, 19200) ;
    this.game.physics.startSystem(Phaser.Physics.P2JS) ;

    // Tile group
    this.tileGroup = new Phaser.Group(this.game) ;
    this.tileEffectGroup = new Phaser.Group(this.game) ;

    // Tank
    this.tankSprite = this.game.add.sprite(0, 0, 'tankImage', 0);
    this.tankSprite.anchor.setTo(0.5, 0.5) ;
    this.game.physics.p2.enable(this.tankSprite);
    this.tankSprite.body.setCircle(15);
    this.tankSprite.body.damping = 0.95 ;
    this.game.camera.follow(this.tankSprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    // Bullet
    this.bulletSprite = this.game.add.sprite(0, 0, 'bulletImage', 0);
    this.bulletSprite.anchor.setTo(0.5, 0.5) ;
    this.bulletSprite.visible = false ;
    this.bulletVelocity = new Phaser.Point(0, 0) ;

    // Tile init
    this.tileAssign() ;

    // Bullet fire
    this.game.input.keyboard.addKey(Phaser.KeyCode.ONE).onDown.add(() => this.bulletFire());

    // Tank color
    this.game.input.keyboard.addKey(Phaser.KeyCode.TWO).onDown.add(() => this.changeTankColor());

    // Pad
    this.initBts() ;

    // Cursor
    this.cursors = this.game.input.keyboard.createCursorKeys();
  }

  public update() {
    // input and move
    this.tankSprite.body.setZeroRotation();
    let move = false ;
    if (this.cursors.up.isDown || this.uPress) {
      this.tankSprite.body.thrust(this.TANK_THRUST) ;
      move = true ;
    } else if (this.cursors.down.isDown || this.dPress) {
      this.tankSprite.body.thrust(-this.TANK_THRUST) ;
      move = true ;
    }
    if (this.cursors.left.isDown || this.lPress) {
      this.tankSprite.body.rotateLeft(this.TANK_ROTATE);
    } else if (this.cursors.right.isDown || this.rPress) {
      this.tankSprite.body.rotateRight(this.TANK_ROTATE);
    }

    // Bullet move & collision
    this.bulletMoveCollision() ;

    // Pad position follow camera
    this.aBt.position.setTo(this.game.camera.position.x + 580, this.game.camera.position.y + 460) ;
    this.bBt.position.setTo(this.game.camera.position.x + 680, this.game.camera.position.y + 460) ;
    this.rBt.position.setTo(this.game.camera.position.x + 500, this.game.camera.position.y + 478) ;
    this.lBt.position.setTo(this.game.camera.position.x + 380, this.game.camera.position.y + 478) ;
    this.uBt.position.setTo(this.game.camera.position.x + 445, this.game.camera.position.y + 410) ;
    this.dBt.position.setTo(this.game.camera.position.x + 445, this.game.camera.position.y + 532) ;

    // Tile assign (create, show & hide)
    if (move) {
      this.tileAssign() ;
    }
  }

  private tileAssign() {
    // Count boundry
    let totalRadius = this.TILE_WIDTH * this.VISIBLE_TILE_RADIUS ;
    this.leftBoundry = (this.tankSprite.position.x - totalRadius) / this.TILE_WIDTH | 0 ;
    this.rightBoundry = (this.tankSprite.position.x + totalRadius) / this.TILE_WIDTH | 0 ;
    this.topBoundry = (this.tankSprite.position.y - totalRadius) / this.TILE_WIDTH | 0 ;
    this.bottomBoundry = (this.tankSprite.position.y + totalRadius) / this.TILE_WIDTH | 0 ;

    // visible in boundry
    for (let iX = this.leftBoundry ; iX <= this.rightBoundry ; iX ++) {
      for (let iY = this.topBoundry ; iY <= this.bottomBoundry ; iY ++) {
        if (!this.checkTileExistAnyArrayIt(iX, iY)) {
          const tileSprite = this.game.add.sprite(iX * this.TILE_WIDTH, iY * this.TILE_WIDTH, 'tileImage', 0, this.tileGroup) ;
          let randID = this.game.rnd.integerInRange(0, 10) ;
          if (randID < 9) {
            randID = 0 ;
          } else if (randID === 9) {
            randID = 1 ;
          } else if (randID === 10) {
            randID = 2 ;
          }
          this.tiles[iX][iY] = new Tile(this.game, randID, tileSprite, this.tileEffectGroup) ;
          this.allTileIndex.push(new Phaser.Point(iX, iY)) ;
        } else {
          this.tiles[iX][iY].visible = true ;
        }
      }
    }

    // invisivle out of boundry
    this.allTileIndex.forEach((value: Phaser.Point, index: number, array: Phaser.Point[]) => {
      if (value.x < this.leftBoundry || value.x > this.rightBoundry || value.y < this.topBoundry || value.y > this.bottomBoundry) {
        if (this.tiles[value.x][value.y].visible === true) {
          this.tiles[value.x][value.y].visible = false ;
        }
      }
    }) ;
  }

  private checkTileExistAnyArrayIt(inX: number, inY: number): boolean {
    let isExist = true ;
    if (!this.tiles[inX]) {
      isExist = false ;
      this.tiles[inX] = [] ;
    }
    if ( !this.tiles[inX][inY] ) {
      isExist = false ;
    }
    return isExist ;
  }

  private bulletMoveCollision() {
    if (this.bulletSprite.visible) {
      // Bullet move
      this.bulletSprite.position.setTo(this.bulletSprite.position.x + (this.bulletVelocity.x * this.game.time.elapsed / 1000),
        this.bulletSprite.position.y + (this.bulletVelocity.y * this.game.time.elapsed / 1000)) ;
      let pos = this.bulletSprite.position ;
      // Boundry check
      if (pos.x >= this.rightBoundry * this.TILE_WIDTH || pos.x <= this.leftBoundry * this.TILE_WIDTH ||
        pos.y >= this.bottomBoundry * this.TILE_WIDTH || pos.y <= this.topBoundry * this.TILE_WIDTH) {
        this.bulletSprite.visible = false ;
      } else {
        let xless = (this.bulletSprite.position.x / this.TILE_WIDTH | 0) - 2  ;
        let xMore = (this.bulletSprite.position.x / this.TILE_WIDTH | 0) + 2  ;
        let yless = (this.bulletSprite.position.y / this.TILE_WIDTH | 0) - 2  ;
        let yMore = (this.bulletSprite.position.y / this.TILE_WIDTH | 0) + 2  ;
        for (let iX = xless ; iX <= xMore ; iX++) {
          for (let iY = yless ; iY <= yMore ; iY++) {
            if (iX < this.leftBoundry || iX > this.rightBoundry || iY < this.topBoundry || iY > this.bottomBoundry) {
              continue ;
            }
            if (this.tiles[iX][iY].type !== TileType.Floor) {
              if (this.tiles[iX][iY].ckeckCollision(this.bulletSprite.position)) {
                this.bulletSprite.visible = false ;
                // Hit hey
                if (this.tiles[iX][iY].type === TileType.Hay) {
                  this.tiles[iX][iY].hitBullet(this.BULLET_DAMAGE[this.bulletSprite.frame]) ;
                }
                break ;
              }
            }
          }
          if (this.bulletSprite.visible === false) {
            break ;
          }
        }
      }
    }
  }

  private initBts() {
    this.aPress = false ;
    this.aBt = this.game.add.button(0, 0, 'xbox360', undefined, this, '360_A', '360_A', '360_A');
    this.aBt.alpha = 0.5 ;
    this.aBt.events.onInputDown.add(() => {
      this.aPress = true; this.aBt.alpha = 1;
      this.bulletFire();
    }, this);
    this.aBt.events.onInputOut.add(() => {
      this.aPress = false;
      this.aBt.alpha = 0.5;
    }, this);
    this.aBt.events.onInputUp.add(() => {
      this.aPress = false;
      this.aBt.alpha = 0.5;
    }, this);

    this.bPress = false ;
    this.bBt = this.game.add.button(0, 0, 'xbox360', undefined, this, '360_B', '360_B', '360_B');
    this.bBt.alpha = 0.5 ;
    this.bBt.events.onInputDown.add(() => {
      this.bPress = true; this.bBt.alpha = 1;
      this.changeTankColor();
    }, this);
    this.bBt.events.onInputOut.add(() => {
      this.bPress = false;
      this.bBt.alpha = 0.5;
    }, this);
    this.bBt.events.onInputUp.add(() => {
      this.bPress = false;
      this.bBt.alpha = 0.5;
    }, this);

    this.rPress = false ;
    this.rBt = this.game.add.button(0, 0, 'rBtImage', undefined, this, 0, 0, 0);
    this.rBt.alpha = 0.5 ;
    this.rBt.events.onInputDown.add(() => {
      this.rPress = true;
      this.rBt.alpha = 1;
    }, this);
    this.rBt.events.onInputOut.add(() => {
      this.rPress = false;
      this.rBt.alpha = 0.5;
    }, this);
    this.rBt.events.onInputUp.add(() => {
      this.rPress = false;
      this.rBt.alpha = 0.5;
    }, this);

    this.lPress = false ;
    this.lBt = this.game.add.button(0, 0, 'lBtImage', undefined, this, 0, 0, 0);
    this.lBt.alpha = 0.5 ;
    this.lBt.events.onInputDown.add(() => {
      this.lPress = true;
      this.lBt.alpha = 1;
    }, this);
    this.lBt.events.onInputOut.add(() => {
      this.lPress = false;
      this.lBt.alpha = 0.5;
    }, this);
    this.lBt.events.onInputUp.add(() => {
      this.lPress = false;
      this.lBt.alpha = 0.5;
    }, this);

    this.uPress = false ;
    this.uBt = this.game.add.button(0, 0, 'uBtImage', undefined, this, 0, 0, 0);
    this.uBt.alpha = 0.5 ;
    this.uBt.events.onInputDown.add(() => {
      this.uPress = true;
      this.uBt.alpha = 1;
    }, this);
    this.uBt.events.onInputOut.add(() => {
      this.uPress = false;
      this.uBt.alpha = 0.5;
    }, this);
    this.uBt.events.onInputUp.add(() => {
      this.uPress = false;
      this.uBt.alpha = 0.5;
    }, this);

    this.dPress = false ;
    this.dBt = this.game.add.button(0, 0, 'dBtImage', undefined, this, 0, 0, 0);
    this.dBt.alpha = 0.5 ;
    this.dBt.events.onInputDown.add(() => {
      this.dPress = true;
      this.dBt.alpha = 1;
    }, this);
    this.dBt.events.onInputOut.add(() => {
      this.dPress = false;
      this.dBt.alpha = 0.5;
    }, this);
    this.dBt.events.onInputUp.add(() => {
      this.dPress = false;
      this.dBt.alpha = 0.5;
    }, this);
  }

  private bulletFire() {
    if (!this.bulletSprite.visible) {
      let recoil = (this.tankSprite.frame as number + 1) * 0.9 * -this.TANK_THRUST;
      this.tankSprite.body.thrust(recoil) ;
      const lootAt = new Phaser.Point( Math.cos(Phaser.Math.degToRad(this.tankSprite.body.angle - 90)), Math.sin(Phaser.Math.degToRad(this.tankSprite.body.angle - 90))) ;
      this.bulletSprite.visible = true ;
      this.bulletSprite.frame = this.tankSprite.frame ;
      this.bulletSprite.position.setTo(this.tankSprite.position.x + (lootAt.x * 18), this.tankSprite.position.y + (lootAt.y * 18)) ;
      this.bulletVelocity.x = lootAt.x * this.BULLET_VELOCITY ;
      this.bulletVelocity.y = lootAt.y * this.BULLET_VELOCITY ;
    }
  }

  private changeTankColor() {
    let frameID = this.tankSprite.frame as number ;
    frameID ++ ;
    if (frameID > 2) {
      frameID = 0 ;
    }
    this.tankSprite.frame = frameID ;
  }

}
