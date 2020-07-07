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
  allTileIndex : Phaser.Point[] ;
  tankSprite: Phaser.Sprite ;
  tileGroup : Phaser.Group ;
  cursors: Phaser.CursorKeys ;

  // const
  tileWidth: number = 32 ;
  visibleTileRadius: number = 5 ;

  create(): void {
    // Init
    this.tiles = [] ;
    this.allTileIndex = [] ;
    this.game.world.setBounds(-10000, -10000, 19200, 19200) ;
    this.game.physics.startSystem(Phaser.Physics.P2JS) ;

    // Tile group
    this.tileGroup = new Phaser.Group(this.game) ;

    // Tank
    this.tankSprite = this.game.add.sprite(0, 0, 'tankImage');
    this.tankSprite.anchor.setTo(0.5, 0.5) ;
    this.game.physics.p2.enable(this.tankSprite);
    this.tankSprite.body.fixedRotation = true;      // May be not!
    this.game.camera.follow(this.tankSprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    // Tile init
    this.tileAssign() ;

    // Cursor
    this.cursors = this.game.input.keyboard.createCursorKeys();
  }

  public update() {
    this.tankSprite.body.setZeroVelocity();

    // input
    let move = false ;
    if (this.cursors.up.isDown) {
      this.tankSprite.body.moveUp(300);
      move = true ;
    } else if (this.cursors.down.isDown) {
      this.tankSprite.body.moveDown(300);
      move = true ;
    }

    if (this.cursors.left.isDown) {
      this.tankSprite.body.velocity.x = -300;
      move = true ;
    } else if (this.cursors.right.isDown) {
      this.tankSprite.body.moveRight(300);
      move = true ;
    }

    if (move) {
      this.tileAssign() ;
    }
  }

  private tileAssign() {
    let totalRadius = this.tileWidth * this.visibleTileRadius ;
    let leftBoundry = (this.tankSprite.position.x - totalRadius) / this.tileWidth | 0 ;
    let rightBoundry = (this.tankSprite.position.x + totalRadius) / this.tileWidth | 0 ;
    let topBoundry = (this.tankSprite.position.y - totalRadius) / this.tileWidth | 0 ;
    let bottomBoundry = (this.tankSprite.position.y + totalRadius) / this.tileWidth | 0 ;
    for (let iX = leftBoundry ; iX <= rightBoundry ; iX ++) {
      for (let iY = topBoundry ; iY <= bottomBoundry ; iY ++) {
        if (!this.checkTileExistAnyArrayIt(iX, iY)) {
          const tileSprite = this.game.add.sprite(iX * this.tileWidth, iY * this.tileWidth, 'tileImage', 0, this.tileGroup) ;
          let randID = this.game.rnd.integerInRange(0, 10) ;
          if (randID < 9) {
            randID = 0 ;
          } else if (randID === 9) {
            randID = 1 ;
          } else if (randID === 10) {
            randID = 2 ;
          }
          this.tiles[iX][iY] = new Tile(randID, tileSprite) ;
          this.allTileIndex.push(new Phaser.Point(iX, iY)) ;
        } else {
          this.tiles[iX][iY].sprite.visible = true ;
        }
      }
    }

    // invisivle out of boundry
    this.allTileIndex.forEach((value: Phaser.Point, index: number, array: Phaser.Point[]) => {
      if (value.x < leftBoundry || value.x > rightBoundry || value.y < topBoundry || value.y > bottomBoundry) {
        if (this.tiles[value.x][value.y].sprite.visible === true) {
          this.tiles[value.x][value.y].sprite.visible = false ;
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

}
