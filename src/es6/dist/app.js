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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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
var getColor = function getColor() {
    var idx = arguments.length <= 0 || arguments[0] === undefined ? -1 : arguments[0];

    if (_rndColor >= COLORS.length) _rndColor = 0;
    if (idx > -1 && idx < COLORS.length) return COLORS[idx];
    return COLORS[_rndColor++];
};

var MAGIC_COLORS = (function () {
    var ret = [];
    for (var x = 0; x < 50; x++) {
        ret.push(getColor(x));
    }
    return ret;
})();
var MAGIC_COLORS_REVERSE = (function () {
    return [].concat(_toConsumableArray(MAGIC_COLORS)).reverse();
})();

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
            // ctx.fillStyle = (this.c + this.r) % 2 != 0 ? "#FF4500" : "#FFA500";
            ctx.fillStyle = MAGIC_COLORS[this.number - 1];
            ctx.fillRect(l, t, w, h);

            if (this.tracked) {
                ctx.lineWidth = 4;
                ctx.strokeStyle = MAGIC_COLORS_REVERSE[this.number - 1];
                ctx.strokeRect(l, t, w, h);
            }

            // write the number in the center of the tile
            var x = l + Math.ceil(w / 2.0);
            var y = t + Math.ceil(h / 2.0);

            // ctx.fillStyle = MAGIC_COLORS_REVERSE[this.number];
            ctx.fillStyle = "black";
            ctx.font = "32px courier";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.number, x, y);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiQzovVXNlcnMvZGtnL1Byb2pla3RlL2dhbWVzL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O3VCQ09pQixZQUFZOzs7O0FBSjdCLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQTs7QUFFdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFJckIsSUFBSSxJQUFJLEdBQUcsMEJBQVUsQ0FBQztBQUN0QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3QkNOaUIsYUFBYTs7Ozs7QUFLMUMsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN4QixJQUFNLGlCQUFpQixHQUFHLFdBQVcsR0FBRyxZQUFZLENBQUM7QUFDckQsSUFBTSxNQUFNLEdBQUcsQ0FBQyxZQUFNO0FBQ2xCLFFBQUksS0FBSyxHQUFHLFNBQVIsS0FBSyxHQUFTO0FBQ2QsWUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2IsYUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlDLGVBQU8sTUFBTSxHQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUUsR0FBRyxDQUFD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QUMsVUFBQyxJQUFJLEVBQUs7QUFDMUIsb0JBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN2QixDQUFDLENBQUM7U0FDTjs7O1dBL0hnQixJQUFJOzs7cUJBQUosSUFBSTs7Ozs7Ozs7Ozs7Ozs7OztBQy9HekIsSUFBSSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksR0FBRyxFQUFrQjtRQUFoQixHQUFHLHlEQUFHLEtBQUs7O0FBQ2hDLFFBQUksR0FBRyxLQUFLLEtBQUssRUFBRTtBQUNmLFdBQUcsR0FBRyxHQUFHLENBQUM7QUFDVixXQUFHLEdBQUcsQ0FBQyxDQUFDO0tBQ1g7QUFDRCxXQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQSxBQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDMUUsQ0FBQzs7UUFFTyxZQUFZLEdBQVosWUFBWSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxyXG4gICAgRVM2IGNvZGUgZW50cnkgcG9pbnRcclxuKi9cclxuY29uc3QgVkVSU0lPTiA9IFwiMC4wLjFcIlxyXG5cclxuY29uc29sZS5sb2coVkVSU0lPTik7XHJcblxyXG5pbXBvcnQgR2FtZSBmcm9tICcuL2dhbWUuZXM2JztcclxuXHJcbmxldCBnYW1lID0gbmV3IEdhbWUoKTtcclxuZ2FtZS5wbGF5KCk7XHJcbiIsIi8qXHJcbiAgICBUaGUgZ2FtZSBjb2RlIGFuZCBsb2dpYywgd2l0aCBVSSBoYW5kbGluZy5cclxuKi9cclxuXHJcbmltcG9ydCB7IGdldFJhbmRvbUludCB9IGZyb20gJy4vdXRpbHMuZXM2JztcclxuXHJcbi8vIHRoZXNlIGFyZSBub3QgaW4gcGl4ZWwsIGJ1dCByYXRoZXIgb3VyIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHVuaXRzXHJcbi8vIHRoaXMgbWVhbnMgTiA9IE4gbnVtYmVyIG9mIGl0ZW1zLCBlLmcuIDEwID0gMTAgaXRlbXMsIG5vdCAxMCBwaXhlbHNcclxuLy8gdGhlIGRyYXcoKSBjYWxsIHdpbGwgY29udmVydCB0aG9zZSBpbnRvIHByb3BlciBwaXhlbHNcclxuY29uc3QgQk9BUkRfV0lEVEggPSAxMDtcclxuY29uc3QgQk9BUkRfSEVJR0hUID0gMTA7XHJcbmNvbnN0IEJPQVJEX1RJTEVTX0NPVU5UID0gQk9BUkRfV0lEVEggKiBCT0FSRF9IRUlHSFQ7XHJcbmNvbnN0IENPTE9SUyA9ICgoKSA9PiB7XHJcbiAgICBsZXQgaW5uZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgbGV0IHJnYiA9IFtdO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCAzOyBpKyspXHJcbiAgICAgICAgICAgIHJnYi5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NSkpO1xyXG4gICAgICAgIHJldHVybiAncmdiKCcrIHJnYi5qb2luKCcsJykgKycpJztcclxuICAgIH1cclxuICAgIGxldCByZXQgPSBbXTtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgMTAwMDsgeCsrKSB7XHJcbiAgICAgICAgcmV0LnB1c2goaW5uZXIoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59KSgpO1xyXG5cclxubGV0IF9ybmRDb2xvciA9IDA7XHJcbmxldCBnZXRDb2xvciA9IChpZHggPSAtMSkgPT4ge1xyXG4gICAgaWYgKF9ybmRDb2xvciA+PSBDT0xPUlMubGVuZ3RoKVxyXG4gICAgICAgIF9ybmRDb2xvciA9IDA7XHJcbiAgICBpZiAoaWR4ID4gLTEgJiYgaWR4IDwgQ09MT1JTLmxlbmd0aClcclxuICAgICAgICByZXR1cm4gQ09MT1JTW2lkeF07XHJcbiAgICByZXR1cm4gQ09MT1JTW19ybmRDb2xvcisrXTtcclxufTtcclxuXHJcbmNvbnN0IE1BR0lDX0NPTE9SUyA9ICgoKSA9PiB7XHJcbiAgICBsZXQgcmV0ID0gW107XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IDUwOyB4KyspIHtcclxuICAgICAgICByZXQucHVzaChnZXRDb2xvcih4KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59KSgpO1xyXG5jb25zdCBNQUdJQ19DT0xPUlNfUkVWRVJTRSA9ICgoKSA9PiB7XHJcbiAgICByZXR1cm4gWy4uLk1BR0lDX0NPTE9SU10ucmV2ZXJzZSgpO1xyXG59KSgpO1xyXG5cclxuXHJcbmNsYXNzIFRpbGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHsgbnVtYmVyID0gMCwgYyA9IDAsIHIgPSAwIH0gPSB7fSkge1xyXG4gICAgICAgIHRoaXMubnVtYmVyID0gbnVtYmVyIHx8IGdldFJhbmRvbUludCgxLCAzKTtcclxuICAgICAgICAvLyBpbiBjb2wvcm93IGNvb3JkaW5hdGVzLCB0aGF0IGlzIGluIG91ciBvd24gaW50ZXJuYWwgdW5pdHNcclxuICAgICAgICB0aGlzLmMgPSBjO1xyXG4gICAgICAgIHRoaXMuciA9IHI7XHJcbiAgICAgICAgdGhpcy50cmFja2VkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjdHgsIHN3LCBzaCkge1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogcmFuZG9taXplIGNvbG9yIGFjY29yZGluZyB0byB0aGlzLm51bWJlclxyXG5cclxuICAgICAgICBsZXQgW3csIGhdID0gdGhpcy50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgIGxldCBbbCwgdF0gPSB0aGlzLmNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCk7XHJcblxyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAxO1xyXG4gICAgICAgIC8vIGN0eC5maWxsU3R5bGUgPSAodGhpcy5jICsgdGhpcy5yKSAlIDIgIT0gMCA/IFwiI0ZGNDUwMFwiIDogXCIjRkZBNTAwXCI7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IE1BR0lDX0NPTE9SU1t0aGlzLm51bWJlci0xXTtcclxuICAgICAgICBjdHguZmlsbFJlY3QobCwgdCwgdywgaCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRyYWNrZWQpIHtcclxuICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDQ7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IE1BR0lDX0NPTE9SU19SRVZFUlNFW3RoaXMubnVtYmVyLTFdO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlUmVjdChsLCB0LCB3LCBoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHdyaXRlIHRoZSBudW1iZXIgaW4gdGhlIGNlbnRlciBvZiB0aGUgdGlsZVxyXG4gICAgICAgIGxldCBbeCwgeV0gPSBbXHJcbiAgICAgICAgICAgIGwgKyBNYXRoLmNlaWwodyAvIDIuMCksIFxyXG4gICAgICAgICAgICB0ICsgTWF0aC5jZWlsKGggLyAyLjApXHJcbiAgICAgICAgXTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBjdHguZmlsbFN0eWxlID0gTUFHSUNfQ09MT1JTX1JFVkVSU0VbdGhpcy5udW1iZXJdO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgY3R4LmZvbnQgPSBcIjMycHggY291cmllclwiO1xyXG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLm51bWJlciwgeCwgeSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKSB7XHJcbiAgICAgICAgLy8gcmV0dXJuIHRoZSBjdXJyZW50IHRpbGUgcG9zaXRpb24gaW4gcGl4ZWxcclxuICAgICAgICBsZXQgW3R3LCB0aF0gPSB0aGlzLnRpbGVEaW1lbnNpb25zKHN3LCBzaCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gY2FsYyB0aGUgdG9wIGFuZCBsZWZ0IGNvb3JkaW5hdGVzIGluIHBpeGVsICh0b3AtbGVmdCBpcyAwLCAwIGluIG91ciBjb29yZGluYXRlIHN5c3RlbVxyXG4gICAgICAgIC8vIGFuZCBib3R0b20tcmlnaHQgaXMgb3VyIHNjcmVlbl9oZWlnaHQtc2NyZWVuX3dpZHRoKVxyXG4gICAgICAgIC8vIHRoaXMgZGVwZW5kcyBvbiB0aGUgdGlsZXMgcG9zaXRpb24gKGluIGNvbC9yb3cgY29vcmRzKVxyXG4gICAgICAgIGxldCBbbCwgdF0gPSBbXHJcbiAgICAgICAgICAgIHRoaXMuYyAqIHR3LFxyXG4gICAgICAgICAgICB0aGlzLnIgKiB0aFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiBbbCwgdF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRpbGVEaW1lbnNpb25zKHN3LCBzaCkge1xyXG4gICAgICAgIC8vIGNhbGMgdGlsZSB3aWR0aCBhbmQgaGVpZ2h0IGluIHBpeGVscyBmb3Igb25lIHRpbGVcclxuICAgICAgICAvLyBERVBFTkRJTkcgb24gdGhlIGN1cnJlbnQgc2NyZWVuIG9yIGJvYXJkIGRpbWVuc2lvbiFcclxuICAgICAgICAvLyBzdzogc2NyZWVuIG9yIGJvYXJkIHdpZHRoIGluIHBpeGVsXHJcbiAgICAgICAgLy8gc2g6IHNjcmVlbiBvciBib2FyZCBoZWlnaHQgaW4gcGl4ZWxcclxuICAgICAgICBcclxuICAgICAgICBsZXQgW3R3LCB0aF0gPSBbTWF0aC5jZWlsKHN3IC8gQk9BUkRfV0lEVEgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNlaWwoc2ggLyBCT0FSRF9IRUlHSFQpXTtcclxuICAgICAgICByZXR1cm4gW3R3LCB0aF07XHJcbiAgICB9XHJcbn0gLy8gY2xhc3MgVGlsZVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgICAgIGxldCB0aWxlcyA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0aWxlcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb3VudGVyID0gMDsgY291bnRlciA8IEJPQVJEX1RJTEVTX0NPVU5UOyBjb3VudGVyKyspIHtcclxuICAgICAgICAgICAgICAgIC8vIGxldCBbY29sdW1ucywgcm93c10gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcGFyc2VGbG9hdChCT0FSRF9USUxFU19DT1VOVCAvIEJPQVJEX1dJRFRIKSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBwYXJzZUZsb2F0KEJPQVJEX1RJTEVTX0NPVU5UIC8gQk9BUkRfSEVJR0hUKVxyXG4gICAgICAgICAgICAgICAgLy8gXTtcclxuICAgICAgICAgICAgICAgIGxldCBbY29sdW1uLCByb3ddID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGNvdW50ZXIgJSBCT0FSRF9XSURUSCwgMTApLCAgICAgICAgICAgICAgLy8gcG9zaXRpb24gaW4gY29sdW1uXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoTWF0aC5mbG9vcihjb3VudGVyIC8gQk9BUkRfSEVJR0hUKSwgMTApLCAvLyBwb3NpdGlvbiBpbiByb3dcclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGUgPSBuZXcgVGlsZSh7IG51bWJlcjogZ2V0UmFuZG9tSW50KDEsIDMpLCBjOiBjb2x1bW4sIHI6IHJvdyB9KTtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRpbGVzO1xyXG4gICAgICAgIH0pKCk7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IHRpbGVzO1xyXG4gICAgXHJcbiAgICAgICAgbGV0IGJvYXJkRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmRcIik7XHJcbiAgICAgICAgbGV0IGNvbnRleHQgPSBib2FyZEVsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eCA9IGNvbnRleHQ7XHJcbiAgICAgICAgdGhpcy5ib2FyZEVsZW1lbnQgPSBib2FyZEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGxldCByZXNpemUgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IFt3dywgd2hdID0gWyQod2luZG93KS53aWR0aCgpLCAkKHdpbmRvdykuaGVpZ2h0KCldO1xyXG4gICAgICAgICAgICBsZXQgbWFyZ2luID0gMjAwO1xyXG4gICAgICAgICAgICBsZXQgJGJvYXJkID0gJChcIiNib2FyZFwiKTtcclxuICAgICAgICAgICAgJGJvYXJkLmhlaWdodChgJHt3aC1tYXJnaW59cHhgKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHdoLW1hcmdpbjtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gJGJvYXJkLndpZHRoKCk7IC8vIHRoaXMgc2hvdWxkIHRha2UgbWFyZ2lucyBhbmQgQ1NTIGludG8gYWNjb3VudFxyXG4gICAgICAgICAgICAvLyB0aGlzLmRyYXcoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCByZXNpemUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBnZXRNb3VzZUNvb3JkaW5hdGVzID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBldmVudCA9IGV2IHx8IHdpbmRvdy5ldmVudDsgLy8gSUUtaXNtXHJcbiAgICAgICAgICAgIC8vIElmIHBhZ2VYL1kgYXJlbid0IGF2YWlsYWJsZSBhbmQgY2xpZW50WC9ZIGFyZSxcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHBhZ2VYL1kgLSBsb2dpYyB0YWtlbiBmcm9tIGpRdWVyeS5cclxuICAgICAgICAgICAgLy8gKFRoaXMgaXMgdG8gc3VwcG9ydCBvbGQgSUUpXHJcbiAgICAgICAgICAgIGlmIChldmVudC5wYWdlWCA9PSBudWxsICYmIGV2ZW50LmNsaWVudFggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50RG9jID0gKGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQub3duZXJEb2N1bWVudCkgfHwgZG9jdW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jID0gZXZlbnREb2MuZG9jdW1lbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBldmVudERvYy5ib2R5O1xyXG5cclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhZ2VYID0gZXZlbnQuY2xpZW50WCArXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLnNjcm9sbExlZnQgfHwgYm9keSAmJiBib2R5LnNjcm9sbExlZnQgfHwgMCkgLVxyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5jbGllbnRMZWZ0IHx8IGJvZHkgJiYgYm9keS5jbGllbnRMZWZ0IHx8IDApO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFnZVkgPSBldmVudC5jbGllbnRZICtcclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2Muc2Nyb2xsVG9wICB8fCBib2R5ICYmIGJvZHkuc2Nyb2xsVG9wICB8fCAwKSAtXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLmNsaWVudFRvcCAgfHwgYm9keSAmJiBib2R5LmNsaWVudFRvcCAgfHwgMCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgcGFyZW50T2Zmc2V0ID0gJChldmVudC50YXJnZXQpLnBhcmVudCgpLm9mZnNldCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgeDogZXZlbnQucGFnZVggLSBwYXJlbnRPZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgIHk6IGV2ZW50LnBhZ2VZIC0gcGFyZW50T2Zmc2V0LnRvcFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJtb3VzZSBtb3ZlZFwiLCBtb3VzZVBvcy54LCBtb3VzZVBvcy55KTtcclxuICAgICAgICAgICAgcmV0dXJuIG1vdXNlUG9zO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG1vdXNlVHJhY2tlciA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbW91c2VQb3MgPSBnZXRNb3VzZUNvb3JkaW5hdGVzKGV2KSxcclxuICAgICAgICAgICAgICAgIGRpbXMgPSB0aGlzLmdldERpbXMoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGlsZS50cmFja2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1vdXNlUG9zIGlzIGluIHBpeGVsIGNvb3Jkc1xyXG4gICAgICAgICAgICAgICAgbGV0IFtzdywgc2hdID0gZGltcztcclxuICAgICAgICAgICAgICAgIGxldCBbdHcsIHRoXSA9IHRpbGUudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICAgICAgICAgIGxldCBbdGwsIHR0XSA9IHRpbGUuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobW91c2VQb3MueCA+PSB0bCAmJiBtb3VzZVBvcy54IDw9ICh0bCArIHR3KSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlUG9zLnkgPj0gdHQgJiYgbW91c2VQb3MueSA8PSAodHQgKyB0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aWxlLnRyYWNrZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAkKFwiI2JvYXJkXCIpLm9uKFwibW91c2Vtb3ZlXCIsIG1vdXNlVHJhY2tlcik7XHJcblxyXG4gICAgICAgIHJlc2l6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy5kcmF3KCk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5wbGF5LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXREaW1zKCkge1xyXG4gICAgICAgIHJldHVybiBbcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50V2lkdGgsIDEwKSwgcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50SGVpZ2h0LCAxMCldO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiR2FtZTo6ZHJhd1wiKTtcclxuXHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuY3R4O1xyXG4gICAgICAgIGxldCBbdywgaF0gPSB0aGlzLmdldERpbXMoKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogaW1wbGVtZW50IHRoaXMhXHJcbiAgICAgICAgLy8gaWYgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXJlIE5PVCBhIG11bHRpcGxlIG9mIGVpdGhlciBCT0FSRF9XSURUSCBvclxyXG4gICAgICAgIC8vIEJPQVJEX0hFSUdIVCB3ZSBuZWVkIHRvIHVzZSB0aGUgdmFsdWVzIHRoYXQgZml0IGFuZCBcIm1vdmVcIiB0aGUgdG9wIFxyXG4gICAgICAgIC8vIGFuZCBsZWZ0IG9mIHRoZSBib2FyZCBhIGJpdCBhbmQgaW50cm9kdWNlIGEgYmxhY2sgYm9yZGVyIHRoYXQgZmlsbHNcclxuICAgICAgICAvLyB1cCB0aGUgZXh0cmFub3VzIFwic3BhY2UhXHJcbiAgICAgICAgLy8gQWxzbywgbW92ZSB0aGUgYm9hcmQgYXJlYSB0byB0aGUgY2VudGVyIGlmIHRoZXJlIGlzIG1vcmUgY2FudmFzIHNwYWNlXHJcbiAgICAgICAgLy8gdGhhbiBuZWVkZWQgdG8gZGlzcGxheSB0aGUgYm9hcmQuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZHJhdyBpbmRpdmlkdWFsIHRpbGVzXHJcbiAgICAgICAgdGhpcy5ib2FyZC5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgdGlsZS5kcmF3KGN0eCwgdywgaCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG4iLCIvKlxyXG4gKiAgVXRpbGl0eSBmdW5jdGlvbnNcclxuICovXHJcbiBcclxubGV0IGdldFJhbmRvbUludCA9IChtaW4sIG1heCA9IGZhbHNlKSA9PiB7XHJcbiAgICBpZiAobWF4ID09PSBmYWxzZSkge1xyXG4gICAgICAgIG1heCA9IG1pbjtcclxuICAgICAgICBtaW4gPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhcnNlSW50KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW4sIDEwKTtcclxufTtcclxuXHJcbmV4cG9ydCB7IGdldFJhbmRvbUludCB9O1xyXG4iXX0=
