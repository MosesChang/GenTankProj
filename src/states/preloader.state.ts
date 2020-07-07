'use strict';
/** Imports */
import State from './state';

// Webpack will replace these imports with a URLs to images
const skyImage        = require('assets/images/sky.png'); // const skyImage = '/assets/images/sky.png';
const platformImage   = require('assets/images/platform.png');
const starImage       = require('assets/images/star.png');
const dudeImage       = require('assets/images/dude.png');

const tileImage       = require('assets/images/tile.png');
const tankImage       = require('assets/images/tank.png');

// The state for loading core resources for the game
export default class PreloaderState extends State {
  preload(): void {
    console.debug('Assets loading started');

    this.game.load.image('sky', skyImage);
    this.game.load.image('platform', platformImage);
    this.game.load.image('star', starImage);
    this.game.load.spritesheet('dude', dudeImage, 32, 48);

    this.game.load.spritesheet('tileImage', tileImage, 32, 32);
    this.game.load.image('tankImage', tankImage);
  }

  create(): void {
    console.debug('Assets loading completed');

    this.game.state.start('main'); // Switch to main game state
  }
}
