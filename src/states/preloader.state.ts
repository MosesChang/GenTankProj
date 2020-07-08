'use strict';
/** Imports */
import State from './state';

// Webpack will replace these imports with a URLs to images
const xbox360Image    = require('assets/images/xbox360.png');
const xbox360Json     = require('assets/images/xbox360.json');
const rBtImage       = require('assets/images/rBt.png');
const uBtImage       = require('assets/images/uBt.png');
const lBtImage       = require('assets/images/lBt.png');
const dBtImage       = require('assets/images/dBt.png');
const tileImage       = require('assets/images/tile.png');
const tankImage       = require('assets/images/tank.png');
const bulletImage     = require('assets/images/bullet.png');

// The state for loading core resources for the game
export default class PreloaderState extends State {
  preload(): void {
    console.debug('Assets loading started');

    this.game.load.atlas('xbox360', xbox360Image, xbox360Json);
    this.game.load.image('rBtImage', rBtImage) ;
    this.game.load.image('uBtImage', uBtImage) ;
    this.game.load.image('lBtImage', lBtImage) ;
    this.game.load.image('dBtImage', dBtImage) ;
    this.game.load.spritesheet('tileImage', tileImage, 32, 32);
    this.game.load.spritesheet('tankImage', tankImage, 31, 40);
    this.game.load.spritesheet('bulletImage', bulletImage, 17, 17);
  }

  create(): void {
    console.debug('Assets loading completed');

    this.game.state.start('main'); // Switch to main game state
  }
}
