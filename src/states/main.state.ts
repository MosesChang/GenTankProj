'use strict';
/** Imports */
import State from './state';

enum TileType {
  Floor = 0,
  Hay,
  Wall
}

class Tile {
  sprite: Phaser.Sprite ;
  type: TileType ;

  constructor(id: TileType, sprite : Phaser.Sprite) {
    this.sprite = sprite ;
    this.setTileType(id) ;
  }
  public setTileType(id: TileType) {
    this.type = id ;
    this.sprite.frame = this.type ;
  }
}

// The main state of the game
export default class MainState extends State {
  sky: Phaser.Sprite; // Reference to background sprite

  tiles : Tile[][] ;
  tankSprite: Phaser.Sprite ;
  tileGroup : Phaser.Group ;
  cursors: Phaser.CursorKeys ;

  // const
  tileWidth: number = 32 ;
  visibleTileRadius: number = 5 ;

  create(): void {
    // Init
    this.tiles = [] ;
    this.game.world.setBounds(-10000, -10000, 19200, 19200) ;
    this.game.physics.startSystem(Phaser.Physics.P2JS) ;

    // Tile group
    this.tileGroup = new Phaser.Group(this.game) ;

    // Tile init
    for (let iX = -this.visibleTileRadius ; iX <= this.visibleTileRadius ; iX++) {
      for (let iY = -this.visibleTileRadius ; iY <= this.visibleTileRadius ; iY++) {
        let rand = this.game.rnd.integerInRange(0, 10) ;
        if (rand < 8) {
          rand = 0 ;
        } else if (rand === 8) {
          rand = 1 ;
        } else if (rand === 9) {
          rand = 2 ;
        }
        this.makeTile(iX, iY, this.game.rnd.integerInRange(0, rand)) ;
      }
    }

    // Tank
    this.tankSprite = this.game.add.sprite(0, 0, 'tankImage');
    this.game.physics.p2.enable(this.tankSprite);
    this.tankSprite.body.fixedRotation = true;      // May be not!
    this.game.camera.follow(this.tankSprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    this.cursors = this.game.input.keyboard.createCursorKeys();
  }

  public update() {
    this.tankSprite.body.setZeroVelocity();

    if (this.cursors.up.isDown) {
      this.tankSprite.body.moveUp(300);
    } else if (this.cursors.down.isDown) {
      this.tankSprite.body.moveDown(300);
    }

    if (this.cursors.left.isDown) {
      this.tankSprite.body.velocity.x = -300;
    } else if (this.cursors.right.isDown) {
      this.tankSprite.body.moveRight(300);
    }
  }

  private makeTile(inX: number, inY: number, id: TileType) {
    if ( !this.tiles[inX] ) {
      this.tiles[inX] = [] ;
    }
    if ( !this.tiles[inX][inY] ) {
      const tileSprite = this.game.add.sprite(inX * this.tileWidth, inY * this.tileWidth, 'tileImage', 0, this.tileGroup) ;
      this.tiles[inX][inY] = new Tile(id, tileSprite) ;
    } else {
      this.tiles[inX][inY].setTileType(id) ;
    }
  }

}
