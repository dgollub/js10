(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
	ES6 code entry point
*/
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _gameEs6 = require('./game.es6');

var _gameEs62 = _interopRequireDefault(_gameEs6);

var VERSION = "0.0.1";
console.log(VERSION);

var game = new _gameEs62["default"]();
game.play();

},{"./game.es6":2}],2:[function(require,module,exports){
/*
	The game code and logic, with UI handling.
*/

"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = (function () {
	function Game() {
		_classCallCheck(this, Game);

		var boardElement = document.getElementById("board");
		var context = boardElement.getContext("2d");

		this.ctx = context;

		var resize = function resize(ev) {
			var ww = $(window).width();
			var wh = $(window).height();

			// console.log(ww, wh);
			$("#board").height(wh - 200 + "px");
		};

		$(window).on("resize", resize);

		resize();
	}

	_createClass(Game, [{
		key: "play",
		value: function play() {
			this.draw();
		}
	}, {
		key: "draw",
		value: function draw() {
			console.log("Game::draw");
			var ctx = this.ctx;
			var w = ctx.width;
			var h = ctx.height;

			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = "green";
			ctx.fillRect(10, 10, 100, 100);
		}
	}]);

	return Game;
})();

exports["default"] = Game;
module.exports = exports["default"];

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozt1QkNNaUIsWUFBWTs7OztBQUg3QixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFJckIsSUFBSSxJQUFJLEdBQUcsMEJBQVUsQ0FBQztBQUN0QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDTFMsSUFBSTtBQUViLFVBRlMsSUFBSSxHQUVWO3dCQUZNLElBQUk7O0FBSXZCLE1BQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEQsTUFBSSxPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFNUMsTUFBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUM7O0FBRW5CLE1BQUksTUFBTSxHQUFHLFNBQVQsTUFBTSxDQUFJLEVBQUUsRUFBSztPQUNmLEVBQUUsR0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFO09BQXhCLEVBQUUsR0FBd0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRTs7O0FBRXJELElBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUksRUFBRSxHQUFDLEdBQUcsUUFBSyxDQUFDO0dBQ2xDLENBQUE7O0FBRUQsR0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRS9CLFFBQU0sRUFBRSxDQUFDO0VBQ1Q7O2NBbEJtQixJQUFJOztTQW9CcEIsZ0JBQUc7QUFDTixPQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDWjs7O1NBRUcsZ0JBQUc7QUFDTixVQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzFCLE9BQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7T0FDZCxDQUFDLEdBQVEsR0FBRyxDQUFDLEtBQUs7T0FBZixDQUFDLEdBQWdCLEdBQUcsQ0FBQyxNQUFNOztBQUNuQyxNQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFCLE1BQUcsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLE1BQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FDL0I7OztRQS9CbUIsSUFBSTs7O3FCQUFKLElBQUkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcclxuXHRFUzYgY29kZSBlbnRyeSBwb2ludFxyXG4qL1xyXG5jb25zdCBWRVJTSU9OID0gXCIwLjAuMVwiXHJcbmNvbnNvbGUubG9nKFZFUlNJT04pO1xyXG5cclxuaW1wb3J0IEdhbWUgZnJvbSAnLi9nYW1lLmVzNic7XHJcblxyXG5sZXQgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbmdhbWUucGxheSgpO1xyXG4iLCIvKlxyXG5cdFRoZSBnYW1lIGNvZGUgYW5kIGxvZ2ljLCB3aXRoIFVJIGhhbmRsaW5nLlxyXG4qL1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKCkge1xyXG5cclxuXHRcdGxldCBib2FyZEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkXCIpO1xyXG5cdFx0bGV0IGNvbnRleHQgPSBib2FyZEVsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuXHRcdHRoaXMuY3R4ID0gY29udGV4dDtcclxuXHJcblx0XHRsZXQgcmVzaXplID0gKGV2KSA9PiB7XHJcblx0XHRcdGxldCBbd3csIHdoXSA9IFskKHdpbmRvdykud2lkdGgoKSwgJCh3aW5kb3cpLmhlaWdodCgpXTtcclxuXHRcdFx0Ly8gY29uc29sZS5sb2cod3csIHdoKTtcclxuXHRcdFx0JChcIiNib2FyZFwiKS5oZWlnaHQoYCR7d2gtMjAwfXB4YCk7XHJcblx0XHR9XHJcblxyXG5cdFx0JCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHJlc2l6ZSk7XHJcblxyXG5cdFx0cmVzaXplKCk7XHJcblx0fVxyXG5cclxuXHRwbGF5KCkge1xyXG5cdFx0dGhpcy5kcmF3KCk7XHJcblx0fVxyXG5cdFxyXG5cdGRyYXcoKSB7XHJcblx0XHRjb25zb2xlLmxvZyhcIkdhbWU6OmRyYXdcIik7XHJcblx0XHRsZXQgY3R4ID0gdGhpcy5jdHg7XHJcblx0XHRsZXQgW3csIGhdID0gW2N0eC53aWR0aCwgY3R4LmhlaWdodF07XHJcblx0XHRjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG5cdFx0Y3R4LmZpbGxTdHlsZSA9IFwiZ3JlZW5cIjtcclxuXHRcdGN0eC5maWxsUmVjdCgxMCwgMTAsIDEwMCwgMTAwKTtcclxuXHR9XHJcbn1cclxuIl19
