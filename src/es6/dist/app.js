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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsEs6 = require('./utils.es6');

// these are not in pixel, but rather our internal representation of units
// this means N = N number of items, e.g. 10 = 10 items, not 10 pixels
// the draw() call will convert those into proper pixels
var BOARD_WIDTH = 10;
var BOARD_HEIGHT = 10;
var BOARD_TILES_COUNT = BOARD_WIDTH * BOARD_HEIGHT;
var COLORS = (function () {
    var inner = function inner() {
        var rgb = [];
        for (var i = 0; i < 3; i++) rgb.push(Math.floor(Math.random() * 255));
        return 'rgb(' + rgb.join(',') + ')';
    };
    var ret = [];
    for (var x = 0; x < 1000; x++) {
        ret.push(inner());
    }
    return ret;
})();

var _rndColor = 0;
var getRandomColor = function getRandomColor() {
    if (_rndColor >= COLORS.length) _rndColor = 0;
    return COLORS[_rndColor++];
};

var Tile = (function () {
    function Tile() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref$number = _ref.number;
        var number = _ref$number === undefined ? 0 : _ref$number;
        var _ref$c = _ref.c;
        var c = _ref$c === undefined ? 0 : _ref$c;
        var _ref$r = _ref.r;
        var r = _ref$r === undefined ? 0 : _ref$r;

        _classCallCheck(this, Tile);

        this.number = number || (0, _utilsEs6.getRandomInt)(1, 3);
        // in col/row coordinates, that is in our own internal units
        this.c = c;
        this.r = r;
        this.tracked = false;
    }

    // class Tile

    _createClass(Tile, [{
        key: 'draw',
        value: function draw(ctx, sw, sh) {
            // TODO(dkg): randomize color according to this.number

            var _tileDimensions = this.tileDimensions(sw, sh);

            var _tileDimensions2 = _slicedToArray(_tileDimensions, 2);

            var w = _tileDimensions2[0];
            var h = _tileDimensions2[1];

            var _canvasCoordinates = this.canvasCoordinates(sw, sh);

            var _canvasCoordinates2 = _slicedToArray(_canvasCoordinates, 2);

            var l = _canvasCoordinates2[0];
            var t = _canvasCoordinates2[1];

            ctx.lineWidth = 1;
            ctx.fillStyle = (this.c + this.r) % 2 != 0 ? "#FF4500" : "#FFA500";
            // ctx.fillStyle = COLORS[this.c + this.r];
            // ctx.fillStyle = getRandomColor();
            ctx.fillRect(l, t, w, h);

            if (this.tracked) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = (this.c + this.r) % 2 != 0 ? "magenta" : "yellow";
                ctx.strokeRect(l, t, w, h);
            }

            // this.tracked = false;
        }
    }, {
        key: 'canvasCoordinates',
        value: function canvasCoordinates(sw, sh) {
            // return the current tile position in pixel

            var _tileDimensions3 = this.tileDimensions(sw, sh);

            var _tileDimensions32 = _slicedToArray(_tileDimensions3, 2);

            var tw = _tileDimensions32[0];
            var th = _tileDimensions32[1];

            // calc the top and left coordinates in pixel (top-left is 0, 0 in our coordinate system
            // and bottom-right is our screen_height-screen_width)
            // this depends on the tiles position (in col/row coords)
            var l = this.c * tw;
            var t = this.r * th;

            return [l, t];
        }
    }, {
        key: 'tileDimensions',
        value: function tileDimensions(sw, sh) {
            // calc tile width and height in pixels for one tile
            // DEPENDING on the current screen or board dimension!
            // sw: screen or board width in pixel
            var tw = Math.ceil(sw / BOARD_WIDTH);
            var th = Math.ceil(sh / BOARD_HEIGHT);

            return [tw, th];
        }
    }]);

    return Tile;
})();

var Game = (function () {
    function Game() {
        var _this = this;

        _classCallCheck(this, Game);

        var tiles = (function () {
            var tiles = [];
            for (var counter = 0; counter < BOARD_TILES_COUNT; counter++) {
                // let [columns, rows] = [
                // parseFloat(BOARD_TILES_COUNT / BOARD_WIDTH),
                // parseFloat(BOARD_TILES_COUNT / BOARD_HEIGHT)
                var column = parseInt(counter % BOARD_WIDTH, 10);
                var row = // position in column
                parseInt(Math.floor(counter / BOARD_HEIGHT), 10);
                // position in row

                var tile = new Tile({ number: (0, _utilsEs6.getRandomInt)(1, 3), c: column, r: row });
                tiles.push(tile);
            }
            return tiles;
        })();
        this.board = tiles;

        var boardElement = document.getElementById("board");
        var context = boardElement.getContext("2d");

        this.ctx = context;
        this.boardElement = boardElement;

        var resize = (function (ev) {
            var ww = $(window).width();
            var wh = $(window).height();

            var margin = 200;
            var $board = $("#board");
            $board.height(wh - margin + 'px');
            _this.ctx.canvas.height = wh - margin;
            _this.ctx.canvas.width = $board.width(); // this should take margins and CSS into account
            // this.draw();
        }).bind(this);

        $(window).on("resize", resize);

        var getMouseCoordinates = function getMouseCoordinates(ev) {
            var event = ev || window.event; // IE-ism
            // If pageX/Y aren't available and clientX/Y are,
            // calculate pageX/Y - logic taken from jQuery.
            // (This is to support old IE)
            if (event.pageX == null && event.clientX != null) {
                var eventDoc = event.target && event.target.ownerDocument || document,
                    doc = eventDoc.documentElement,
                    body = eventDoc.body;

                event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
            }

            var parentOffset = $(event.target).parent().offset();

            var mousePos = {
                x: event.pageX - parentOffset.left,
                y: event.pageY - parentOffset.top
            };

            // console.log("mouse moved", mousePos.x, mousePos.y);
            return mousePos;
        };

        var mouseTracker = (function (ev) {
            var mousePos = getMouseCoordinates(ev),
                dims = _this.getDims();

            _this.board.forEach(function (tile) {
                tile.tracked = false;

                // the mousePos is in pixel coords

                var _dims = _slicedToArray(dims, 2);

                var sw = _dims[0];
                var sh = _dims[1];

                var _tile$tileDimensions = tile.tileDimensions(sw, sh);

                var _tile$tileDimensions2 = _slicedToArray(_tile$tileDimensions, 2);

                var tw = _tile$tileDimensions2[0];
                var th = _tile$tileDimensions2[1];

                var _tile$canvasCoordinates = tile.canvasCoordinates(sw, sh);

                var _tile$canvasCoordinates2 = _slicedToArray(_tile$canvasCoordinates, 2);

                var tl = _tile$canvasCoordinates2[0];
                var tt = _tile$canvasCoordinates2[1];

                if (mousePos.x >= tl && mousePos.x <= tl + tw && mousePos.y >= tt && mousePos.y <= tt + th) {
                    tile.tracked = true;
                }
            });
        }).bind(this);

        $("#board").on("mousemove", mouseTracker);

        resize();
    }

    _createClass(Game, [{
        key: 'play',
        value: function play() {
            this.draw();

            window.requestAnimationFrame(this.play.bind(this));
        }
    }, {
        key: 'getDims',
        value: function getDims() {
            return [parseInt(this.boardElement.clientWidth, 10), parseInt(this.boardElement.clientHeight, 10)];
        }
    }, {
        key: 'draw',
        value: function draw() {
            console.log("Game::draw");

            var ctx = this.ctx;

            var _getDims = this.getDims();

            var _getDims2 = _slicedToArray(_getDims, 2);

            var w = _getDims2[0];
            var h = _getDims2[1];

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, w, h);

            // TODO(dkg): implement this!
            // if the width and height are NOT a multiple of either BOARD_WIDTH or
            // BOARD_HEIGHT we need to use the values that fit and "move" the top
            // and left of the board a bit and introduce a black border that fills
            // up the extranous "space!
            // Also, move the board area to the center if there is more canvas space
            // than needed to display the board.

            // draw individual tiles
            this.board.forEach(function (tile) {
                tile.draw(ctx, w, h);
            });
        }
    }]);

    return Game;
})();

exports['default'] = Game;
module.exports = exports['default'];
// sh: screen or board height in pixel

// ];

},{"./utils.es6":3}],3:[function(require,module,exports){
/*
 *  Utility functions
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var getRandomInt = function getRandomInt(min) {
    var max = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    if (max === false) {
        max = min;
        min = 0;
    }
    return parseInt(Math.floor(Math.random() * (max - min + 1)) + min, 10);
};

exports.getRandomInt = getRandomInt;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiQzovVXNlcnMvZGtnL1Byb2pla3RlL2dhbWVzL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O3VCQ09pQixZQUFZOzs7O0FBSjdCLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQTs7QUFFdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFJckIsSUFBSSxJQUFJLEdBQUcsMEJBQVUsQ0FBQztBQUN0QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JDTmlCLGFBQWE7Ozs7O0FBSzFDLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN2QixJQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDeEIsSUFBTSxpQkFBaUIsR0FBRyxXQUFXLEdBQUcsWUFBWSxDQUFDO0FBQ3JELElBQU0sTUFBTSxHQUFHLENBQUMsWUFBTTtBQUNsQixRQUFJLEtBQUssR0FBRyxTQUFSLEtBQUssR0FBUztBQUNkLFlBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLGFBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5QyxlQUFPLE1BQU0sR0FBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFFLEdBQUcsQ0FBQztL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QyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxQixlQUFHLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztBQUN4QixlQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7Ozs7Ozs7OztBQVd6QixnQkFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDMUIsb0JBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN2QixDQUFDLENBQUM7U0FDTjs7O1dBL0hnQixJQUFJOzs7cUJBQUosSUFBSTs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZGekIsSUFBSSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksR0FBRyxFQUFrQjtRQUFoQixHQUFHLHlEQUFHLEtBQUs7O0FBQ2hDLFFBQUksR0FBRyxLQUFLLEtBQUssRUFBRTtBQUNmLFdBQUcsR0FBRyxHQUFHLENBQUM7QUFDVixXQUFHLEdBQUcsQ0FBQyxDQUFDO0tBQ1g7QUFDRCxXQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQSxBQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDMUUsQ0FBQzs7UUFFTyxZQUFZLEdBQVosWUFBWSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxyXG4gICAgRVM2IGNvZGUgZW50cnkgcG9pbnRcclxuKi9cclxuY29uc3QgVkVSU0lPTiA9IFwiMC4wLjFcIlxyXG5cclxuY29uc29sZS5sb2coVkVSU0lPTik7XHJcblxyXG5pbXBvcnQgR2FtZSBmcm9tICcuL2dhbWUuZXM2JztcclxuXHJcbmxldCBnYW1lID0gbmV3IEdhbWUoKTtcclxuZ2FtZS5wbGF5KCk7XHJcbiIsIi8qXHJcbiAgICBUaGUgZ2FtZSBjb2RlIGFuZCBsb2dpYywgd2l0aCBVSSBoYW5kbGluZy5cclxuKi9cclxuXHJcbmltcG9ydCB7IGdldFJhbmRvbUludCB9IGZyb20gJy4vdXRpbHMuZXM2JztcclxuXHJcbi8vIHRoZXNlIGFyZSBub3QgaW4gcGl4ZWwsIGJ1dCByYXRoZXIgb3VyIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHVuaXRzXHJcbi8vIHRoaXMgbWVhbnMgTiA9IE4gbnVtYmVyIG9mIGl0ZW1zLCBlLmcuIDEwID0gMTAgaXRlbXMsIG5vdCAxMCBwaXhlbHNcclxuLy8gdGhlIGRyYXcoKSBjYWxsIHdpbGwgY29udmVydCB0aG9zZSBpbnRvIHByb3BlciBwaXhlbHNcclxuY29uc3QgQk9BUkRfV0lEVEggPSAxMDtcclxuY29uc3QgQk9BUkRfSEVJR0hUID0gMTA7XHJcbmNvbnN0IEJPQVJEX1RJTEVTX0NPVU5UID0gQk9BUkRfV0lEVEggKiBCT0FSRF9IRUlHSFQ7XHJcbmNvbnN0IENPTE9SUyA9ICgoKSA9PiB7XHJcbiAgICBsZXQgaW5uZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgbGV0IHJnYiA9IFtdO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCAzOyBpKyspXHJcbiAgICAgICAgICAgIHJnYi5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NSkpO1xyXG4gICAgICAgIHJldHVybiAncmdiKCcrIHJnYi5qb2luKCcsJykgKycpJztcclxuICAgIH1cclxuICAgIGxldCByZXQgPSBbXTtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgMTAwMDsgeCsrKSB7XHJcbiAgICAgICAgcmV0LnB1c2goaW5uZXIoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59KSgpO1xyXG5cclxubGV0IF9ybmRDb2xvciA9IDA7XHJcbmxldCBnZXRSYW5kb21Db2xvciA9ICgpID0+IHtcclxuICAgIGlmIChfcm5kQ29sb3IgPj0gQ09MT1JTLmxlbmd0aClcclxuICAgICAgICBfcm5kQ29sb3IgPSAwO1xyXG4gICAgcmV0dXJuIENPTE9SU1tfcm5kQ29sb3IrK107XHJcbn07XHJcblxyXG5jbGFzcyBUaWxlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih7IG51bWJlciA9IDAsIGMgPSAwLCByID0gMCB9ID0ge30pIHtcclxuICAgICAgICB0aGlzLm51bWJlciA9IG51bWJlciB8fCBnZXRSYW5kb21JbnQoMSwgMyk7XHJcbiAgICAgICAgLy8gaW4gY29sL3JvdyBjb29yZGluYXRlcywgdGhhdCBpcyBpbiBvdXIgb3duIGludGVybmFsIHVuaXRzXHJcbiAgICAgICAgdGhpcy5jID0gYztcclxuICAgICAgICB0aGlzLnIgPSByO1xyXG4gICAgICAgIHRoaXMudHJhY2tlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoY3R4LCBzdywgc2gpIHtcclxuICAgICAgICAvLyBUT0RPKGRrZyk6IHJhbmRvbWl6ZSBjb2xvciBhY2NvcmRpbmcgdG8gdGhpcy5udW1iZXJcclxuXHJcbiAgICAgICAgbGV0IFt3LCBoXSA9IHRoaXMudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICBsZXQgW2wsIHRdID0gdGhpcy5jYW52YXNDb29yZGluYXRlcyhzdywgc2gpO1xyXG5cclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gKHRoaXMuYyArIHRoaXMucikgJSAyICE9IDAgPyBcIiNGRjQ1MDBcIiA6IFwiI0ZGQTUwMFwiO1xyXG4gICAgICAgIC8vIGN0eC5maWxsU3R5bGUgPSBDT0xPUlNbdGhpcy5jICsgdGhpcy5yXTtcclxuICAgICAgICAvLyBjdHguZmlsbFN0eWxlID0gZ2V0UmFuZG9tQ29sb3IoKTtcclxuICAgICAgICBjdHguZmlsbFJlY3QobCwgdCwgdywgaCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMudHJhY2tlZCkge1xyXG4gICAgICAgICAgICBjdHgubGluZVdpZHRoID0gMztcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gKHRoaXMuYyArIHRoaXMucikgJSAyICE9IDAgPyBcIm1hZ2VudGFcIiA6IFwieWVsbG93XCI7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VSZWN0KGwsIHQsIHcsIGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdGhpcy50cmFja2VkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKSB7XHJcbiAgICAgICAgLy8gcmV0dXJuIHRoZSBjdXJyZW50IHRpbGUgcG9zaXRpb24gaW4gcGl4ZWxcclxuICAgICAgICBsZXQgW3R3LCB0aF0gPSB0aGlzLnRpbGVEaW1lbnNpb25zKHN3LCBzaCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gY2FsYyB0aGUgdG9wIGFuZCBsZWZ0IGNvb3JkaW5hdGVzIGluIHBpeGVsICh0b3AtbGVmdCBpcyAwLCAwIGluIG91ciBjb29yZGluYXRlIHN5c3RlbVxyXG4gICAgICAgIC8vIGFuZCBib3R0b20tcmlnaHQgaXMgb3VyIHNjcmVlbl9oZWlnaHQtc2NyZWVuX3dpZHRoKVxyXG4gICAgICAgIC8vIHRoaXMgZGVwZW5kcyBvbiB0aGUgdGlsZXMgcG9zaXRpb24gKGluIGNvbC9yb3cgY29vcmRzKVxyXG4gICAgICAgIGxldCBbbCwgdF0gPSBbXHJcbiAgICAgICAgICAgIHRoaXMuYyAqIHR3LFxyXG4gICAgICAgICAgICB0aGlzLnIgKiB0aFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiBbbCwgdF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRpbGVEaW1lbnNpb25zKHN3LCBzaCkge1xyXG4gICAgICAgIC8vIGNhbGMgdGlsZSB3aWR0aCBhbmQgaGVpZ2h0IGluIHBpeGVscyBmb3Igb25lIHRpbGVcclxuICAgICAgICAvLyBERVBFTkRJTkcgb24gdGhlIGN1cnJlbnQgc2NyZWVuIG9yIGJvYXJkIGRpbWVuc2lvbiFcclxuICAgICAgICAvLyBzdzogc2NyZWVuIG9yIGJvYXJkIHdpZHRoIGluIHBpeGVsXHJcbiAgICAgICAgLy8gc2g6IHNjcmVlbiBvciBib2FyZCBoZWlnaHQgaW4gcGl4ZWxcclxuICAgICAgICBcclxuICAgICAgICBsZXQgW3R3LCB0aF0gPSBbTWF0aC5jZWlsKHN3IC8gQk9BUkRfV0lEVEgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNlaWwoc2ggLyBCT0FSRF9IRUlHSFQpXTtcclxuICAgICAgICByZXR1cm4gW3R3LCB0aF07XHJcbiAgICB9XHJcbn0gLy8gY2xhc3MgVGlsZVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgICAgIGxldCB0aWxlcyA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0aWxlcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb3VudGVyID0gMDsgY291bnRlciA8IEJPQVJEX1RJTEVTX0NPVU5UOyBjb3VudGVyKyspIHtcclxuICAgICAgICAgICAgICAgIC8vIGxldCBbY29sdW1ucywgcm93c10gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcGFyc2VGbG9hdChCT0FSRF9USUxFU19DT1VOVCAvIEJPQVJEX1dJRFRIKSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBwYXJzZUZsb2F0KEJPQVJEX1RJTEVTX0NPVU5UIC8gQk9BUkRfSEVJR0hUKVxyXG4gICAgICAgICAgICAgICAgLy8gXTtcclxuICAgICAgICAgICAgICAgIGxldCBbY29sdW1uLCByb3ddID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGNvdW50ZXIgJSBCT0FSRF9XSURUSCwgMTApLCAgICAgICAgICAgICAgLy8gcG9zaXRpb24gaW4gY29sdW1uXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoTWF0aC5mbG9vcihjb3VudGVyIC8gQk9BUkRfSEVJR0hUKSwgMTApLCAvLyBwb3NpdGlvbiBpbiByb3dcclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGUgPSBuZXcgVGlsZSh7IG51bWJlcjogZ2V0UmFuZG9tSW50KDEsIDMpLCBjOiBjb2x1bW4sIHI6IHJvdyB9KTtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRpbGVzO1xyXG4gICAgICAgIH0pKCk7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IHRpbGVzO1xyXG4gICAgXHJcbiAgICAgICAgbGV0IGJvYXJkRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmRcIik7XHJcbiAgICAgICAgbGV0IGNvbnRleHQgPSBib2FyZEVsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eCA9IGNvbnRleHQ7XHJcbiAgICAgICAgdGhpcy5ib2FyZEVsZW1lbnQgPSBib2FyZEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGxldCByZXNpemUgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IFt3dywgd2hdID0gWyQod2luZG93KS53aWR0aCgpLCAkKHdpbmRvdykuaGVpZ2h0KCldO1xyXG4gICAgICAgICAgICBsZXQgbWFyZ2luID0gMjAwO1xyXG4gICAgICAgICAgICBsZXQgJGJvYXJkID0gJChcIiNib2FyZFwiKTtcclxuICAgICAgICAgICAgJGJvYXJkLmhlaWdodChgJHt3aC1tYXJnaW59cHhgKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHdoLW1hcmdpbjtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gJGJvYXJkLndpZHRoKCk7IC8vIHRoaXMgc2hvdWxkIHRha2UgbWFyZ2lucyBhbmQgQ1NTIGludG8gYWNjb3VudFxyXG4gICAgICAgICAgICAvLyB0aGlzLmRyYXcoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCByZXNpemUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBnZXRNb3VzZUNvb3JkaW5hdGVzID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBldmVudCA9IGV2IHx8IHdpbmRvdy5ldmVudDsgLy8gSUUtaXNtXHJcbiAgICAgICAgICAgIC8vIElmIHBhZ2VYL1kgYXJlbid0IGF2YWlsYWJsZSBhbmQgY2xpZW50WC9ZIGFyZSxcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHBhZ2VYL1kgLSBsb2dpYyB0YWtlbiBmcm9tIGpRdWVyeS5cclxuICAgICAgICAgICAgLy8gKFRoaXMgaXMgdG8gc3VwcG9ydCBvbGQgSUUpXHJcbiAgICAgICAgICAgIGlmIChldmVudC5wYWdlWCA9PSBudWxsICYmIGV2ZW50LmNsaWVudFggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50RG9jID0gKGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQub3duZXJEb2N1bWVudCkgfHwgZG9jdW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jID0gZXZlbnREb2MuZG9jdW1lbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBldmVudERvYy5ib2R5O1xyXG5cclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhZ2VYID0gZXZlbnQuY2xpZW50WCArXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLnNjcm9sbExlZnQgfHwgYm9keSAmJiBib2R5LnNjcm9sbExlZnQgfHwgMCkgLVxyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5jbGllbnRMZWZ0IHx8IGJvZHkgJiYgYm9keS5jbGllbnRMZWZ0IHx8IDApO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFnZVkgPSBldmVudC5jbGllbnRZICtcclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2Muc2Nyb2xsVG9wICB8fCBib2R5ICYmIGJvZHkuc2Nyb2xsVG9wICB8fCAwKSAtXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLmNsaWVudFRvcCAgfHwgYm9keSAmJiBib2R5LmNsaWVudFRvcCAgfHwgMCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgcGFyZW50T2Zmc2V0ID0gJChldmVudC50YXJnZXQpLnBhcmVudCgpLm9mZnNldCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgeDogZXZlbnQucGFnZVggLSBwYXJlbnRPZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgIHk6IGV2ZW50LnBhZ2VZIC0gcGFyZW50T2Zmc2V0LnRvcFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJtb3VzZSBtb3ZlZFwiLCBtb3VzZVBvcy54LCBtb3VzZVBvcy55KTtcclxuICAgICAgICAgICAgcmV0dXJuIG1vdXNlUG9zO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG1vdXNlVHJhY2tlciA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbW91c2VQb3MgPSBnZXRNb3VzZUNvb3JkaW5hdGVzKGV2KSxcclxuICAgICAgICAgICAgICAgIGRpbXMgPSB0aGlzLmdldERpbXMoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGlsZS50cmFja2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1vdXNlUG9zIGlzIGluIHBpeGVsIGNvb3Jkc1xyXG4gICAgICAgICAgICAgICAgbGV0IFtzdywgc2hdID0gZGltcztcclxuICAgICAgICAgICAgICAgIGxldCBbdHcsIHRoXSA9IHRpbGUudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICAgICAgICAgIGxldCBbdGwsIHR0XSA9IHRpbGUuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobW91c2VQb3MueCA+PSB0bCAmJiBtb3VzZVBvcy54IDw9ICh0bCArIHR3KSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlUG9zLnkgPj0gdHQgJiYgbW91c2VQb3MueSA8PSAodHQgKyB0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aWxlLnRyYWNrZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAkKFwiI2JvYXJkXCIpLm9uKFwibW91c2Vtb3ZlXCIsIG1vdXNlVHJhY2tlcik7XHJcblxyXG4gICAgICAgIHJlc2l6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy5kcmF3KCk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5wbGF5LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXREaW1zKCkge1xyXG4gICAgICAgIHJldHVybiBbcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50V2lkdGgsIDEwKSwgcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50SGVpZ2h0LCAxMCldO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiR2FtZTo6ZHJhd1wiKTtcclxuXHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuY3R4O1xyXG4gICAgICAgIGxldCBbdywgaF0gPSB0aGlzLmdldERpbXMoKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogaW1wbGVtZW50IHRoaXMhXHJcbiAgICAgICAgLy8gaWYgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXJlIE5PVCBhIG11bHRpcGxlIG9mIGVpdGhlciBCT0FSRF9XSURUSCBvclxyXG4gICAgICAgIC8vIEJPQVJEX0hFSUdIVCB3ZSBuZWVkIHRvIHVzZSB0aGUgdmFsdWVzIHRoYXQgZml0IGFuZCBcIm1vdmVcIiB0aGUgdG9wIFxyXG4gICAgICAgIC8vIGFuZCBsZWZ0IG9mIHRoZSBib2FyZCBhIGJpdCBhbmQgaW50cm9kdWNlIGEgYmxhY2sgYm9yZGVyIHRoYXQgZmlsbHNcclxuICAgICAgICAvLyB1cCB0aGUgZXh0cmFub3VzIFwic3BhY2UhXHJcbiAgICAgICAgLy8gQWxzbywgbW92ZSB0aGUgYm9hcmQgYXJlYSB0byB0aGUgY2VudGVyIGlmIHRoZXJlIGlzIG1vcmUgY2FudmFzIHNwYWNlXHJcbiAgICAgICAgLy8gdGhhbiBuZWVkZWQgdG8gZGlzcGxheSB0aGUgYm9hcmQuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZHJhdyBpbmRpdmlkdWFsIHRpbGVzXHJcbiAgICAgICAgdGhpcy5ib2FyZC5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgdGlsZS5kcmF3KGN0eCwgdywgaCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG4iLCIvKlxyXG4gKiAgVXRpbGl0eSBmdW5jdGlvbnNcclxuICovXHJcbiBcclxubGV0IGdldFJhbmRvbUludCA9IChtaW4sIG1heCA9IGZhbHNlKSA9PiB7XHJcbiAgICBpZiAobWF4ID09PSBmYWxzZSkge1xyXG4gICAgICAgIG1heCA9IG1pbjtcclxuICAgICAgICBtaW4gPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhcnNlSW50KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW4sIDEwKTtcclxufTtcclxuXHJcbmV4cG9ydCB7IGdldFJhbmRvbUludCB9O1xyXG4iXX0=
