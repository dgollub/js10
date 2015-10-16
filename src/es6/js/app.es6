/*
	ES6 code entry point
*/
const VERSION = "0.0.1"
console.log(VERSION);

import Game from './game.es6';

let game = new Game();
game.play();
