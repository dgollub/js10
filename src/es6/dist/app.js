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

        var mouseClick = (function (ev) {
            var mousePos = getMouseCoordinates(ev),
                dims = _this.getDims();
            // console.log("clicked here", mousePos);

            var clickedOnTiles = _this.board.filter(function (tile) {
                return tile.tracked; // we are cheating here
            });

            _this.handleTileClicked(clickedOnTiles.length > 0 ? clickedOnTiles[0] : null);
        }).bind(this);

        $("#board").on("click", mouseClick);

        resize();
    }

    _createClass(Game, [{
        key: 'handleTileClicked',
        value: function handleTileClicked(clickedOnTile) {
            // console.log("handleTileClicked", clickedOnTile);
            if (null === clickedOnTile) return;
            // TODO(dkg): check if tile has neighbours with the same number
            // if yes, increase current tile's number and collapse all connected
            // neighbours with the same number onto the tile (animate this as well).
            // Then let gravity drop down all tiles that are hanging in the air.
            // After that add fresh tiles to the board until all empty spaces are
            // filled up again - let these drop from the top as well.
        }
    }, {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiQzovVXNlcnMvZGtnL1Byb2pla3RlL2dhbWVzL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O3VCQ09pQixZQUFZOzs7O0FBSjdCLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQTs7QUFFdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFJckIsSUFBSSxJQUFJLEdBQUcsMEJBQVUsQ0FBQztBQUN0QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3QkNOaUIsYUFBYTs7Ozs7QUFLMUMsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN4QixJQUFNLGlCQUFpQixHQUFHLFdBQVcsR0FBRyxZQUFZLENBQUM7O0FBRXJELElBQU0sTUFBTSxHQUFHLENBQUMsWUFBTTtBQUNsQixRQUFJLEtBQUssR0FBRyxTQUFSLEtBQUssR0FBUztBQUNkLFlBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLGFBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5QyxlQUFPLE1BQU0sR0FBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFFLEdBQUcsQ0FB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QUFBLEFBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUMxRSxDQUFDOztRQUVPLFlBQVksR0FBWixZQUFZIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXHJcbiAgICBFUzYgY29kZSBlbnRyeSBwb2ludFxyXG4qL1xyXG5jb25zdCBWRVJTSU9OID0gXCIwLjAuMVwiXHJcblxyXG5jb25zb2xlLmxvZyhWRVJTSU9OKTtcclxuXHJcbmltcG9ydCBHYW1lIGZyb20gJy4vZ2FtZS5lczYnO1xyXG5cclxubGV0IGdhbWUgPSBuZXcgR2FtZSgpO1xyXG5nYW1lLnBsYXkoKTtcclxuIiwiLypcclxuICAgIFRoZSBnYW1lIGNvZGUgYW5kIGxvZ2ljLCB3aXRoIFVJIGhhbmRsaW5nLlxyXG4qL1xyXG5cclxuaW1wb3J0IHsgZ2V0UmFuZG9tSW50IH0gZnJvbSAnLi91dGlscy5lczYnO1xyXG5cclxuLy8gdGhlc2UgYXJlIG5vdCBpbiBwaXhlbCwgYnV0IHJhdGhlciBvdXIgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgdW5pdHNcclxuLy8gdGhpcyBtZWFucyBOID0gTiBudW1iZXIgb2YgaXRlbXMsIGUuZy4gMTAgPSAxMCBpdGVtcywgbm90IDEwIHBpeGVsc1xyXG4vLyB0aGUgZHJhdygpIGNhbGwgd2lsbCBjb252ZXJ0IHRob3NlIGludG8gcHJvcGVyIHBpeGVsc1xyXG5jb25zdCBCT0FSRF9XSURUSCA9IDEwO1xyXG5jb25zdCBCT0FSRF9IRUlHSFQgPSAxMDtcclxuY29uc3QgQk9BUkRfVElMRVNfQ09VTlQgPSBCT0FSRF9XSURUSCAqIEJPQVJEX0hFSUdIVDtcclxuXHJcbmNvbnN0IENPTE9SUyA9ICgoKSA9PiB7XHJcbiAgICBsZXQgaW5uZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgbGV0IHJnYiA9IFtdO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCAzOyBpKyspXHJcbiAgICAgICAgICAgIHJnYi5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NSkpO1xyXG4gICAgICAgIHJldHVybiAncmdiKCcrIHJnYi5qb2luKCcsJykgKycpJztcclxuICAgIH1cclxuICAgIGxldCByZXQgPSBbXTtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgMTAwMDsgeCsrKSB7XHJcbiAgICAgICAgcmV0LnB1c2goaW5uZXIoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59KSgpO1xyXG5cclxubGV0IF9ybmRDb2xvciA9IDA7XHJcbmxldCBnZXRDb2xvciA9IChpZHggPSAtMSkgPT4ge1xyXG4gICAgaWYgKF9ybmRDb2xvciA+PSBDT0xPUlMubGVuZ3RoKVxyXG4gICAgICAgIF9ybmRDb2xvciA9IDA7XHJcbiAgICBpZiAoaWR4ID4gLTEgJiYgaWR4IDwgQ09MT1JTLmxlbmd0aClcclxuICAgICAgICByZXR1cm4gQ09MT1JTW2lkeF07XHJcbiAgICByZXR1cm4gQ09MT1JTW19ybmRDb2xvcisrXTtcclxufTtcclxuXHJcbmNvbnN0IE1BR0lDX0NPTE9SUyA9ICgoKSA9PiB7XHJcbiAgICBsZXQgcmV0ID0gW107XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IDUwOyB4KyspIHtcclxuICAgICAgICByZXQucHVzaChnZXRDb2xvcih4KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59KSgpO1xyXG5jb25zdCBNQUdJQ19DT0xPUlNfUkVWRVJTRSA9ICgoKSA9PiB7XHJcbiAgICByZXR1cm4gWy4uLk1BR0lDX0NPTE9SU10ucmV2ZXJzZSgpO1xyXG59KSgpO1xyXG5cclxuXHJcbmNsYXNzIFRpbGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHsgbnVtYmVyID0gMCwgYyA9IDAsIHIgPSAwIH0gPSB7fSkge1xyXG4gICAgICAgIHRoaXMubnVtYmVyID0gbnVtYmVyIHx8IGdldFJhbmRvbUludCgxLCAzKTtcclxuICAgICAgICAvLyBpbiBjb2wvcm93IGNvb3JkaW5hdGVzLCB0aGF0IGlzIGluIG91ciBvd24gaW50ZXJuYWwgdW5pdHNcclxuICAgICAgICB0aGlzLmMgPSBjO1xyXG4gICAgICAgIHRoaXMuciA9IHI7XHJcbiAgICAgICAgdGhpcy50cmFja2VkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjdHgsIHN3LCBzaCkge1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogcmFuZG9taXplIGNvbG9yIGFjY29yZGluZyB0byB0aGlzLm51bWJlclxyXG5cclxuICAgICAgICBsZXQgW3csIGhdID0gdGhpcy50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgIGxldCBbbCwgdF0gPSB0aGlzLmNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCk7XHJcblxyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAxO1xyXG4gICAgICAgIC8vIGN0eC5maWxsU3R5bGUgPSAodGhpcy5jICsgdGhpcy5yKSAlIDIgIT0gMCA/IFwiI0ZGNDUwMFwiIDogXCIjRkZBNTAwXCI7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IE1BR0lDX0NPTE9SU1t0aGlzLm51bWJlci0xXTtcclxuICAgICAgICBjdHguZmlsbFJlY3QobCwgdCwgdywgaCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRyYWNrZWQpIHtcclxuICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDQ7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IE1BR0lDX0NPTE9SU19SRVZFUlNFW3RoaXMubnVtYmVyLTFdO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlUmVjdChsLCB0LCB3LCBoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHdyaXRlIHRoZSBudW1iZXIgaW4gdGhlIGNlbnRlciBvZiB0aGUgdGlsZVxyXG4gICAgICAgIGxldCBbeCwgeV0gPSBbXHJcbiAgICAgICAgICAgIGwgKyBNYXRoLmNlaWwodyAvIDIuMCksIFxyXG4gICAgICAgICAgICB0ICsgTWF0aC5jZWlsKGggLyAyLjApXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgLy8gY3R4LmZpbGxTdHlsZSA9IE1BR0lDX0NPTE9SU19SRVZFUlNFW3RoaXMubnVtYmVyXTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgIGN0eC5mb250ID0gXCIzMnB4IGNvdXJpZXJcIjtcclxuICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcclxuICAgICAgICBjdHguZmlsbFRleHQodGhpcy5udW1iZXIsIHgsIHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCkge1xyXG4gICAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudCB0aWxlIHBvc2l0aW9uIGluIHBpeGVsXHJcbiAgICAgICAgbGV0IFt0dywgdGhdID0gdGhpcy50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGNhbGMgdGhlIHRvcCBhbmQgbGVmdCBjb29yZGluYXRlcyBpbiBwaXhlbCAodG9wLWxlZnQgaXMgMCwgMCBpbiBvdXIgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICAgICAgICAvLyBhbmQgYm90dG9tLXJpZ2h0IGlzIG91ciBzY3JlZW5faGVpZ2h0LXNjcmVlbl93aWR0aClcclxuICAgICAgICAvLyB0aGlzIGRlcGVuZHMgb24gdGhlIHRpbGVzIHBvc2l0aW9uIChpbiBjb2wvcm93IGNvb3JkcylcclxuICAgICAgICBsZXQgW2wsIHRdID0gW1xyXG4gICAgICAgICAgICB0aGlzLmMgKiB0dyxcclxuICAgICAgICAgICAgdGhpcy5yICogdGhcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICByZXR1cm4gW2wsIHRdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aWxlRGltZW5zaW9ucyhzdywgc2gpIHtcclxuICAgICAgICAvLyBjYWxjIHRpbGUgd2lkdGggYW5kIGhlaWdodCBpbiBwaXhlbHMgZm9yIG9uZSB0aWxlXHJcbiAgICAgICAgLy8gREVQRU5ESU5HIG9uIHRoZSBjdXJyZW50IHNjcmVlbiBvciBib2FyZCBkaW1lbnNpb24hXHJcbiAgICAgICAgLy8gc3c6IHNjcmVlbiBvciBib2FyZCB3aWR0aCBpbiBwaXhlbFxyXG4gICAgICAgIC8vIHNoOiBzY3JlZW4gb3IgYm9hcmQgaGVpZ2h0IGluIHBpeGVsXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IFt0dywgdGhdID0gW01hdGguY2VpbChzdyAvIEJPQVJEX1dJRFRIKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jZWlsKHNoIC8gQk9BUkRfSEVJR0hUKV07XHJcbiAgICAgICAgcmV0dXJuIFt0dywgdGhdO1xyXG4gICAgfVxyXG59IC8vIGNsYXNzIFRpbGVcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgICAgICBsZXQgdGlsZXMgPSAoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdGlsZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY291bnRlciA9IDA7IGNvdW50ZXIgPCBCT0FSRF9USUxFU19DT1VOVDsgY291bnRlcisrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBsZXQgW2NvbHVtbnMsIHJvd3NdID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBhcnNlRmxvYXQoQk9BUkRfVElMRVNfQ09VTlQgLyBCT0FSRF9XSURUSCksXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcGFyc2VGbG9hdChCT0FSRF9USUxFU19DT1VOVCAvIEJPQVJEX0hFSUdIVClcclxuICAgICAgICAgICAgICAgIC8vIF07XHJcbiAgICAgICAgICAgICAgICBsZXQgW2NvbHVtbiwgcm93XSA9IFtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChjb3VudGVyICUgQk9BUkRfV0lEVEgsIDEwKSwgICAgICAgICAgICAgIC8vIHBvc2l0aW9uIGluIGNvbHVtblxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KE1hdGguZmxvb3IoY291bnRlciAvIEJPQVJEX0hFSUdIVCksIDEwKSwgLy8gcG9zaXRpb24gaW4gcm93XHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0aWxlID0gbmV3IFRpbGUoeyBudW1iZXI6IGdldFJhbmRvbUludCgxLCAzKSwgYzogY29sdW1uLCByOiByb3cgfSk7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aWxlcztcclxuICAgICAgICB9KSgpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSB0aWxlcztcclxuICAgIFxyXG4gICAgICAgIGxldCBib2FyZEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkXCIpO1xyXG4gICAgICAgIGxldCBjb250ZXh0ID0gYm9hcmRFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHggPSBjb250ZXh0O1xyXG4gICAgICAgIHRoaXMuYm9hcmRFbGVtZW50ID0gYm9hcmRFbGVtZW50O1xyXG5cclxuICAgICAgICBsZXQgcmVzaXplID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBbd3csIHdoXSA9IFskKHdpbmRvdykud2lkdGgoKSwgJCh3aW5kb3cpLmhlaWdodCgpXTtcclxuICAgICAgICAgICAgbGV0IG1hcmdpbiA9IDIwMDtcclxuICAgICAgICAgICAgbGV0ICRib2FyZCA9ICQoXCIjYm9hcmRcIik7XHJcbiAgICAgICAgICAgICRib2FyZC5oZWlnaHQoYCR7d2gtbWFyZ2lufXB4YCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgPSB3aC1tYXJnaW47XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmNhbnZhcy53aWR0aCA9ICRib2FyZC53aWR0aCgpOyAvLyB0aGlzIHNob3VsZCB0YWtlIG1hcmdpbnMgYW5kIENTUyBpbnRvIGFjY291bnRcclxuICAgICAgICAgICAgLy8gdGhpcy5kcmF3KCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgcmVzaXplKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZ2V0TW91c2VDb29yZGluYXRlcyA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQgPSBldiB8fCB3aW5kb3cuZXZlbnQ7IC8vIElFLWlzbVxyXG4gICAgICAgICAgICAvLyBJZiBwYWdlWC9ZIGFyZW4ndCBhdmFpbGFibGUgYW5kIGNsaWVudFgvWSBhcmUsXHJcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBwYWdlWC9ZIC0gbG9naWMgdGFrZW4gZnJvbSBqUXVlcnkuXHJcbiAgICAgICAgICAgIC8vIChUaGlzIGlzIHRvIHN1cHBvcnQgb2xkIElFKVxyXG4gICAgICAgICAgICBpZiAoZXZlbnQucGFnZVggPT0gbnVsbCAmJiBldmVudC5jbGllbnRYICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBldmVudERvYyA9IChldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0Lm93bmVyRG9jdW1lbnQpIHx8IGRvY3VtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGRvYyA9IGV2ZW50RG9jLmRvY3VtZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gZXZlbnREb2MuYm9keTtcclxuXHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWdlWCA9IGV2ZW50LmNsaWVudFggK1xyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5zY3JvbGxMZWZ0IHx8IGJvZHkgJiYgYm9keS5zY3JvbGxMZWZ0IHx8IDApIC1cclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2MuY2xpZW50TGVmdCB8fCBib2R5ICYmIGJvZHkuY2xpZW50TGVmdCB8fCAwKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhZ2VZID0gZXZlbnQuY2xpZW50WSArXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLnNjcm9sbFRvcCAgfHwgYm9keSAmJiBib2R5LnNjcm9sbFRvcCAgfHwgMCkgLVxyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5jbGllbnRUb3AgIHx8IGJvZHkgJiYgYm9keS5jbGllbnRUb3AgIHx8IDAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHBhcmVudE9mZnNldCA9ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5vZmZzZXQoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBtb3VzZVBvcyA9IHtcclxuICAgICAgICAgICAgICAgIHg6IGV2ZW50LnBhZ2VYIC0gcGFyZW50T2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICB5OiBldmVudC5wYWdlWSAtIHBhcmVudE9mZnNldC50b3BcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwibW91c2UgbW92ZWRcIiwgbW91c2VQb3MueCwgbW91c2VQb3MueSk7XHJcbiAgICAgICAgICAgIHJldHVybiBtb3VzZVBvcztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgbW91c2VUcmFja2VyID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBtb3VzZVBvcyA9IGdldE1vdXNlQ29vcmRpbmF0ZXMoZXYpLFxyXG4gICAgICAgICAgICAgICAgZGltcyA9IHRoaXMuZ2V0RGltcygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aWxlLnRyYWNrZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB0aGUgbW91c2VQb3MgaXMgaW4gcGl4ZWwgY29vcmRzXHJcbiAgICAgICAgICAgICAgICBsZXQgW3N3LCBzaF0gPSBkaW1zO1xyXG4gICAgICAgICAgICAgICAgbGV0IFt0dywgdGhdID0gdGlsZS50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgICAgICAgICAgbGV0IFt0bCwgdHRdID0gdGlsZS5jYW52YXNDb29yZGluYXRlcyhzdywgc2gpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtb3VzZVBvcy54ID49IHRsICYmIG1vdXNlUG9zLnggPD0gKHRsICsgdHcpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VQb3MueSA+PSB0dCAmJiBtb3VzZVBvcy55IDw9ICh0dCArIHRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbGUudHJhY2tlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQoXCIjYm9hcmRcIikub24oXCJtb3VzZW1vdmVcIiwgbW91c2VUcmFja2VyKTtcclxuXHJcbiAgICAgICAgbGV0IG1vdXNlQ2xpY2sgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0gZ2V0TW91c2VDb29yZGluYXRlcyhldiksXHJcbiAgICAgICAgICAgICAgICBkaW1zID0gdGhpcy5nZXREaW1zKCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBoZXJlXCIsIG1vdXNlUG9zKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjbGlja2VkT25UaWxlcyA9IHRoaXMuYm9hcmQuZmlsdGVyKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGlsZS50cmFja2VkOyAvLyB3ZSBhcmUgY2hlYXRpbmcgaGVyZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlVGlsZUNsaWNrZWQoY2xpY2tlZE9uVGlsZXMubGVuZ3RoID4gMCA/IGNsaWNrZWRPblRpbGVzWzBdIDogbnVsbCk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgJChcIiNib2FyZFwiKS5vbihcImNsaWNrXCIsIG1vdXNlQ2xpY2spO1xyXG5cclxuICAgICAgICByZXNpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVUaWxlQ2xpY2tlZChjbGlja2VkT25UaWxlKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJoYW5kbGVUaWxlQ2xpY2tlZFwiLCBjbGlja2VkT25UaWxlKTtcclxuICAgICAgICBpZiAobnVsbCA9PT0gY2xpY2tlZE9uVGlsZSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogY2hlY2sgaWYgdGlsZSBoYXMgbmVpZ2hib3VycyB3aXRoIHRoZSBzYW1lIG51bWJlclxyXG4gICAgICAgIC8vIGlmIHllcywgaW5jcmVhc2UgY3VycmVudCB0aWxlJ3MgbnVtYmVyIGFuZCBjb2xsYXBzZSBhbGwgY29ubmVjdGVkXHJcbiAgICAgICAgLy8gbmVpZ2hib3VycyB3aXRoIHRoZSBzYW1lIG51bWJlciBvbnRvIHRoZSB0aWxlIChhbmltYXRlIHRoaXMgYXMgd2VsbCkuXHJcbiAgICAgICAgLy8gVGhlbiBsZXQgZ3Jhdml0eSBkcm9wIGRvd24gYWxsIHRpbGVzIHRoYXQgYXJlIGhhbmdpbmcgaW4gdGhlIGFpci5cclxuICAgICAgICAvLyBBZnRlciB0aGF0IGFkZCBmcmVzaCB0aWxlcyB0byB0aGUgYm9hcmQgdW50aWwgYWxsIGVtcHR5IHNwYWNlcyBhcmVcclxuICAgICAgICAvLyBmaWxsZWQgdXAgYWdhaW4gLSBsZXQgdGhlc2UgZHJvcCBmcm9tIHRoZSB0b3AgYXMgd2VsbC5cclxuICAgIH1cclxuXHJcbiAgICBwbGF5KCkge1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG5cclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucGxheS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXREaW1zKCkge1xyXG4gICAgICAgIHJldHVybiBbcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50V2lkdGgsIDEwKSwgcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50SGVpZ2h0LCAxMCldO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJHYW1lOjpkcmF3XCIpO1xyXG5cclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICAgICAgbGV0IFt3LCBoXSA9IHRoaXMuZ2V0RGltcygpO1xyXG5cclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogaW1wbGVtZW50IHRoaXMhXHJcbiAgICAgICAgLy8gaWYgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXJlIE5PVCBhIG11bHRpcGxlIG9mIGVpdGhlciBCT0FSRF9XSURUSCBvclxyXG4gICAgICAgIC8vIEJPQVJEX0hFSUdIVCB3ZSBuZWVkIHRvIHVzZSB0aGUgdmFsdWVzIHRoYXQgZml0IGFuZCBcIm1vdmVcIiB0aGUgdG9wIFxyXG4gICAgICAgIC8vIGFuZCBsZWZ0IG9mIHRoZSBib2FyZCBhIGJpdCBhbmQgaW50cm9kdWNlIGEgYmxhY2sgYm9yZGVyIHRoYXQgZmlsbHNcclxuICAgICAgICAvLyB1cCB0aGUgZXh0cmFub3VzIFwic3BhY2UhXHJcbiAgICAgICAgLy8gQWxzbywgbW92ZSB0aGUgYm9hcmQgYXJlYSB0byB0aGUgY2VudGVyIGlmIHRoZXJlIGlzIG1vcmUgY2FudmFzIHNwYWNlXHJcbiAgICAgICAgLy8gdGhhbiBuZWVkZWQgdG8gZGlzcGxheSB0aGUgYm9hcmQuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZHJhdyBpbmRpdmlkdWFsIHRpbGVzXHJcbiAgICAgICAgdGhpcy5ib2FyZC5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgdGlsZS5kcmF3KGN0eCwgdywgaCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59XHJcbiIsIi8qXHJcbiAqICBVdGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuIFxyXG5sZXQgZ2V0UmFuZG9tSW50ID0gKG1pbiwgbWF4ID0gZmFsc2UpID0+IHtcclxuICAgIGlmIChtYXggPT09IGZhbHNlKSB7XHJcbiAgICAgICAgbWF4ID0gbWluO1xyXG4gICAgICAgIG1pbiA9IDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFyc2VJbnQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbiwgMTApO1xyXG59O1xyXG5cclxuZXhwb3J0IHsgZ2V0UmFuZG9tSW50IH07XHJcbiJdfQ==
