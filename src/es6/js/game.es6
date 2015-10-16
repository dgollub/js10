/*
	The game code and logic, with UI handling.
*/

export default class Game {

	constructor() {

		let boardElement = document.getElementById("board");
		let context = boardElement.getContext("2d");

		this.ctx = context;

		let resize = (ev) => {
			let [ww, wh] = [$(window).width(), $(window).height()];
			// console.log(ww, wh);
			$("#board").height(`${wh-200}px`);
		}

		$(window).on("resize", resize);

		resize();
	}

	play() {
		this.draw();
	}
	
	draw() {
		console.log("Game::draw");
		let ctx = this.ctx;
		let [w, h] = [ctx.width, ctx.height];
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = "green";
		ctx.fillRect(10, 10, 100, 100);
	}
}
