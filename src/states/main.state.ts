'use strict';
/** Imports */
import State from './state';

enum TileType {
  Floor = 0,
  Hay,
  Wall
}

class Tile {
  private sprite: Phaser.Sprite ;
  private game: Phaser.Game ;
  private type: TileType ;

  constructor(game: Phaser.Game, id: TileType, sprite : Phaser.Sprite) {
    this.game = game ;
    this.sprite = sprite ;
    this.sprite.anchor.setTo(0.5, 0.5) ;
    this.setTileType(id) ;
    if (id === TileType.Wall) {
      this.game.physics.p2.enable(this.sprite) ;
      this.sprite.body.kinematic = true ;
      this.sprite.body.static = true ;
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

  public get visible(): boolean {
    return this.sprite.visible ;
  }
}

// The main state of the game
export default class MainState extends State {
  tiles : Tile[][] ;
  allTileIndex : Phaser.Point[] ;
  tankSprite: Phaser.Sprite ;
  tileGroup : Phaser.Group ;
  cursors: Phaser.CursorKeys ;

  TILE_WIDTH: number = 32 ;
  VISIBLE_TILE_RADIUS: number = 5 ;

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
    this.tankSprite.body.setCircle(15);
    this.tankSprite.body.damping = 0.95 ;
    this.game.camera.follow(this.tankSprite, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    // Tile init
    this.tileAssign() ;

    // Cursor
    this.cursors = this.game.input.keyboard.createCursorKeys();
  }

  public update() {
    // input and move
    this.tankSprite.body.setZeroRotation();
    let move = false ;
    if (this.cursors.up.isDown) {
      this.tankSprite.body.thrust(400) ;
      move = true ;
    } else if (this.cursors.down.isDown) {
      this.tankSprite.body.thrust(-400) ;
      move = true ;
    }
    if (this.cursors.left.isDown) {
      this.tankSprite.body.rotateLeft(100);
      move = true ;
    } else if (this.cursors.right.isDown) {
      this.tankSprite.body.rotateRight(100);
      move = true ;
    }

    // Tile assign (create, show & hide)
    if (move) {
      this.tileAssign() ;
    }
  }

  private tileAssign() {
    // Count boundry
    let totalRadius = this.TILE_WIDTH * this.VISIBLE_TILE_RADIUS ;
    let leftBoundry = (this.tankSprite.position.x - totalRadius) / this.TILE_WIDTH | 0 ;
    let rightBoundry = (this.tankSprite.position.x + totalRadius) / this.TILE_WIDTH | 0 ;
    let topBoundry = (this.tankSprite.position.y - totalRadius) / this.TILE_WIDTH | 0 ;
    let bottomBoundry = (this.tankSprite.position.y + totalRadius) / this.TILE_WIDTH | 0 ;

    // visible in boundry
    for (let iX = leftBoundry ; iX <= rightBoundry ; iX ++) {
      for (let iY = topBoundry ; iY <= bottomBoundry ; iY ++) {
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
          this.tiles[iX][iY] = new Tile(this.game, randID, tileSprite) ;
          this.allTileIndex.push(new Phaser.Point(iX, iY)) ;
        } else {
          this.tiles[iX][iY].visible = true ;
        }
      }
    }

    // invisivle out of boundry
    this.allTileIndex.forEach((value: Phaser.Point, index: number, array: Phaser.Point[]) => {
      if (value.x < leftBoundry || value.x > rightBoundry || value.y < topBoundry || value.y > bottomBoundry) {
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

}
