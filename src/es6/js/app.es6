/*
    ES6 code entry point
*/
const VERSION = "0.0.2"

console.log(VERSION);

import Game from './game.es6';

let game = new Game();
game.play();


$("#buttonRestart").on("click", (ev) => {

	console.info("===> RESTART GAME");

	game = new Game();
	game.play();

});

