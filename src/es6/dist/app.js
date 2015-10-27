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
    TODO(dkg): use the following techniques
        - generators and yield
        - Symbols
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
    // TODO(dkg): eliminate colors that are too close to each other and/or duplicates
    var inner = function inner() {
        var rgb = [];
        for (var i = 0; i < 3; i++) {
            var v = parseInt(Math.floor(Math.random() * 255), 10).toString(16);
            if (v.length <= 1) {
                v = '0' + v;
            }
            rgb.push(v);
        }
        // return 'rgb('+ rgb.join(',') +')';
        return '#' + rgb.join("");
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

var MOVE_STEPS_IN_FRAMES = 30;

// console.log(MAGIC_COLORS);

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
        this.moveTo = false;
        this.stepsMoved = 0;
        this.destroy = false;
        this.tracked = false;
    }

    // class Tile

    // called once per frame - only once per frame!

    _createClass(Tile, [{
        key: 'draw',
        value: function draw(ctx, sw, sh) {
            // TODO(dkg): randomize color according to this.number
            // TODO(dkg): implement tile destruction and adding new tiles from above
            if (this.destroy === true) {
                return;
            }

            var _tileDimensions = this.tileDimensions(sw, sh);

            var _tileDimensions2 = _slicedToArray(_tileDimensions, 2);

            var w = _tileDimensions2[0];
            var h = _tileDimensions2[1];

            // these are the original pixel coords - they need to be adjusted
            // when we have to collapse
            var l = -1;
            var t = -1;

            if (this.moveTo !== false) {
                this.stepsMoved++;
                if (this.stepsMoved <= MOVE_STEPS_IN_FRAMES) {
                    // TODO(dkg): rethink this approach - it is not working at all right now.
                    // We start at c0, r0 and want to go to cN, rM
                    // with (cN != c0 and rM != r0) in a constant
                    // number of steps (MOVE_STEPS_IN_FRAMES).

                    var _canvasCoordinates = this.canvasCoordinates(sw, sh);

                    var _canvasCoordinates2 = _slicedToArray(_canvasCoordinates, 2);

                    var _l = _canvasCoordinates2[0];
                    var _t = _canvasCoordinates2[1];

                    var _moveTo$canvasCoordinates = this.moveTo.canvasCoordinates(sw, sh);

                    var _moveTo$canvasCoordinates2 = _slicedToArray(_moveTo$canvasCoordinates, 2);

                    var ml = _moveTo$canvasCoordinates2[0];
                    var mt = _moveTo$canvasCoordinates2[1];

                    // distance between start tile and end tile in pixel
                    var dl = ml - _l;
                    var dt = mt - _t;
                    var deltaWidthInPixel = dl / MOVE_STEPS_IN_FRAMES;
                    var deltaHeightInPixel = dt / MOVE_STEPS_IN_FRAMES;
                    var totalDWIP = deltaWidthInPixel * this.stepsMoved;
                    var totalDHIP = deltaHeightInPixel * this.stepsMoved;
                    var targetLeft = _l + totalDWIP;
                    var targetTop = _t + totalDHIP;
                    _l = Math.ceil(targetLeft);
                    _t = Math.ceil(targetTop);
                } else {
                    var _ref2 = [this.moveTo.c, this.moveTo.r];
                    this.c = _ref2[0];
                    this.r = _ref2[1];

                    var _moveTo$canvasCoordinates3 = this.moveTo.canvasCoordinates(sw, sh);

                    var _moveTo$canvasCoordinates32 = _slicedToArray(_moveTo$canvasCoordinates3, 2);

                    l = _moveTo$canvasCoordinates32[0];
                    t = _moveTo$canvasCoordinates32[1];

                    this.stepsMoved = 0;
                    this.moveTo = false;
                    this.destroy = true;
                }
            } else {
                var _canvasCoordinates3 = this.canvasCoordinates(sw, sh);

                var _canvasCoordinates32 = _slicedToArray(_canvasCoordinates3, 2);

                l = _canvasCoordinates32[0];
                t = _canvasCoordinates32[1];
            }

            var fillColor = MAGIC_COLORS[this.number - 1];
            var antiColor = (0, _utilsEs6.isDarkColor)(fillColor) ? "lightgray" : "black";

            ctx.lineWidth = 1;
            // ctx.fillStyle = (this.c + this.r) % 2 != 0 ? "#FF4500" : "#FFA500";
            ctx.fillStyle = fillColor;
            ctx.fillRect(l, t, w, h);

            if (this.tracked) {
                ctx.lineWidth = 4;
                // ctx.strokeStyle = MAGIC_COLORS_REVERSE[this.number-1];
                ctx.strokeStyle = antiColor;
                ctx.strokeRect(l, t, w, h);
            }

            // write the number in the center of the tile
            var x = l + Math.ceil(w / 2.0);
            var y = t + Math.ceil(h / 2.0);

            // ctx.fillStyle = MAGIC_COLORS_REVERSE[this.number];
            ctx.fillStyle = antiColor;
            ctx.font = "32px courier";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.number, x, y);
        }
    }, {
        key: 'animateCollapseTo',
        value: function animateCollapseTo(targetTile) {
            this.moveTo = targetTile;
            this.stepsMoved = 0;
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
            // In case we are moving/collapsing onto another tile, we will need
            // to move once per frame into a certain direction.

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

        this.drawing = false;

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
            ev.preventDefault();

            // if (this.drawing !== true) {
            // console.log("Ignored mouse click because I was drawing.");
            // return;
            // }

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

    // class Game

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

            var connectedTiles = this.gatherConnectedTiles(clickedOnTile);
            connectedTiles.forEach(function (tile) {
                // animate to collapse onto clicked tile
                // remove tiles after animation
                // count and add points
                // check if game over
                tile.animateCollapseTo(clickedOnTile);
            });
        }
    }, {
        key: 'play',
        value: function play() {
            this.draw();
            // TODO(dkg): remove destroyed tiles and add new tiles from above the board
            //            with gravity pulling them down etc.
            //            only let the player continue to play after all animations are done
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
            this.drawing = true;

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

            // draw individual tiles - only the tracked one should be drawn over
            // all other tiles last, because otherwise the border outline is
            // overdrawn by neighbouring tiles
            var delayedDisplay = [];
            this.board.forEach(function (tile) {
                if (tile.tracked) {
                    delayedDisplay.push(tile);
                } else {
                    tile.draw(ctx, w, h);
                }
            });
            delayedDisplay.forEach(function (tile) {
                tile.draw(ctx, w, h);
            });

            this.drawing = false;
        }

        // returns the neighbouring tiles that have the same number as the provided tile
    }, {
        key: 'findNeighboursForTile',
        value: function findNeighboursForTile(tile) {
            var neighbours = [];

            var left = tile.c > 0 ? this.getTileAt(tile.c - 1, tile.r) : null;
            var top = tile.r > 0 ? this.getTileAt(tile.c, tile.r - 1) : null;
            var right = tile.c < BOARD_WIDTH - 1 ? this.getTileAt(tile.c + 1, tile.r) : null;
            var bottom = tile.r < BOARD_HEIGHT - 1 ? this.getTileAt(tile.c, tile.r + 1) : null;

            if (null != left && left.number === tile.number) neighbours.push(left);
            if (null != top && top.number === tile.number) neighbours.push(top);
            if (null != right && right.number === tile.number) neighbours.push(right);
            if (null != bottom && bottom.number === tile.number) neighbours.push(bottom);

            return neighbours;
        }
    }, {
        key: 'getTileAt',
        value: function getTileAt(column, row) {
            var tile = this.board.find(function (t) {
                return t.c === column && t.r === row;
            });
            return !!tile ? tile : null;
        }

        // Returns a list of all tiles that share the same number as the one provided
        // and that are continously connected throughout each other.
        // Important: board borders are cut off points!
    }, {
        key: 'gatherConnectedTiles',
        value: function gatherConnectedTiles(tile) {
            var _this2 = this;

            // A list of array indices that are connected to the tile
            // and furthermore to other tiles with the same value/number.
            var connected = [];

            // Searches through all neighbours to find all connected tiles.
            var crawl = (function (rootTile, crawled, ignoreRoot) {
                if (rootTile === null) {
                    console.warn("rootTile not set");
                    return null;
                }

                var num = rootTile.number;
                crawled.push(rootTile);

                var neighbours = _this2.findNeighboursForTile(rootTile),
                    counted = neighbours.length;

                for (var i = 0; i < counted; i++) {
                    var t = neighbours[i],
                        idxOf = crawled.indexOf(t);
                    if (idxOf === -1) {
                        crawl(t, crawled);
                    }
                }
            }).bind(this);

            crawl(tile, connected, true);
            // we don't want to have our initial tile in the result set
            return connected.filter(function (t) {
                return !(t.r === tile.r && t.c === tile.c);
            });
        }
    }]);

    return Game;
})();

exports['default'] = Game;
module.exports = exports['default'];
// This is pixel wise, not column/row wise.
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

// http://stackoverflow.com/a/12043228/193165
function isDarkColor(color) {
    var c = color.length === 6 ? color : color.substring(1); // strip #
    var rgb = parseInt(c, 16); // convert rrggbb to decimal
    var r = rgb >> 16 & 0xff; // extract red
    var g = rgb >> 8 & 0xff; // extract green
    var b = rgb >> 0 & 0xff; // extract blue

    // use a standard formula to convert the resulting RGB values into their perceived brightness
    // https://en.wikipedia.org/wiki/Rec._709#Luma_coefficients
    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    // console.log("luma for color:", color, luma);

    return luma < 80; // too dark if luma is smaller than N
}

exports.getRandomInt = getRandomInt;
exports.isDarkColor = isDarkColor;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiQzovVXNlcnMvZGtnL1Byb2pla3RlL2dhbWVzL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O3VCQ09pQixZQUFZOzs7O0FBSjdCLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQTs7QUFFdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFJckIsSUFBSSxJQUFJLEdBQUcsMEJBQVUsQ0FBQztBQUN0QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3QkNIOEIsYUFBYTs7Ozs7QUFLdkQsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN4QixJQUFNLGlCQUFpQixHQUFHLFdBQVcsR0FBRyxZQUFZLENBQUM7O0FBRXJELElBQU0sTUFBTSxHQUFHLENBQUMsWUFBTTs7QUFFbEIsUUFBSSxLQUFLLEdBQUcsU0FBUixLQUFLLEdBQVM7QUFDZCxZQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDYixhQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hCLGdCQUFJLENBQUMsR0FBRyxBQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckUsZ0JB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Q0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hELFFBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDMUIsUUFBSSxDQUFDLEdBQUcsQUFBQyxHQUFHLElBQUksRUFBRSxHQUFJLElBQUksQ0FBQztBQUMzQixRQUFJLENBQUMsR0FBRyxBQUFDLEdBQUcsSUFBSyxDQUFDLEdBQUksSUFBSSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxHQUFHLEFBQUMsR0FBRyxJQUFLLENBQUMsR0FBSSxJQUFJLENBQUM7Ozs7QUFJM0IsUUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7Ozs7QUFJaEQsV0FBTyxJQUFJLEdBQUcsRUFBRSxDQUFDO0NBQ3BCOztRQUdRLFlBQVksR0FBWixZQUFZO1FBQUUsV0FBVyxHQUFYLFdBQVciLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcclxuICAgIEVTNiBjb2RlIGVudHJ5IHBvaW50XHJcbiovXHJcbmNvbnN0IFZFUlNJT04gPSBcIjAuMC4xXCJcclxuXHJcbmNvbnNvbGUubG9nKFZFUlNJT04pO1xyXG5cclxuaW1wb3J0IEdhbWUgZnJvbSAnLi9nYW1lLmVzNic7XHJcblxyXG5sZXQgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbmdhbWUucGxheSgpO1xyXG4iLCIvKlxyXG4gICAgVGhlIGdhbWUgY29kZSBhbmQgbG9naWMsIHdpdGggVUkgaGFuZGxpbmcuXHJcbiAgICBUT0RPKGRrZyk6IHVzZSB0aGUgZm9sbG93aW5nIHRlY2huaXF1ZXNcclxuICAgICAgICAtIGdlbmVyYXRvcnMgYW5kIHlpZWxkXHJcbiAgICAgICAgLSBTeW1ib2xzXHJcbiovXHJcblxyXG5pbXBvcnQgeyBnZXRSYW5kb21JbnQsIGlzRGFya0NvbG9yIH0gZnJvbSAnLi91dGlscy5lczYnO1xyXG5cclxuLy8gdGhlc2UgYXJlIG5vdCBpbiBwaXhlbCwgYnV0IHJhdGhlciBvdXIgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgdW5pdHNcclxuLy8gdGhpcyBtZWFucyBOID0gTiBudW1iZXIgb2YgaXRlbXMsIGUuZy4gMTAgPSAxMCBpdGVtcywgbm90IDEwIHBpeGVsc1xyXG4vLyB0aGUgZHJhdygpIGNhbGwgd2lsbCBjb252ZXJ0IHRob3NlIGludG8gcHJvcGVyIHBpeGVsc1xyXG5jb25zdCBCT0FSRF9XSURUSCA9IDEwO1xyXG5jb25zdCBCT0FSRF9IRUlHSFQgPSAxMDtcclxuY29uc3QgQk9BUkRfVElMRVNfQ09VTlQgPSBCT0FSRF9XSURUSCAqIEJPQVJEX0hFSUdIVDtcclxuXHJcbmNvbnN0IENPTE9SUyA9ICgoKSA9PiB7XHJcbiAgICAvLyBUT0RPKGRrZyk6IGVsaW1pbmF0ZSBjb2xvcnMgdGhhdCBhcmUgdG9vIGNsb3NlIHRvIGVhY2ggb3RoZXIgYW5kL29yIGR1cGxpY2F0ZXNcclxuICAgIGxldCBpbm5lciA9ICgpID0+IHtcclxuICAgICAgICBsZXQgcmdiID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHYgPSAocGFyc2VJbnQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU1KSwgMTApKS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICAgIGlmICh2Lmxlbmd0aCA8PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB2ID0gYDAke3Z9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZ2IucHVzaCh2KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmV0dXJuICdyZ2IoJysgcmdiLmpvaW4oJywnKSArJyknO1xyXG4gICAgICAgIHJldHVybiAnIycgKyByZ2Iuam9pbihcIlwiKTtcclxuICAgIH1cclxuICAgIGxldCByZXQgPSBbXTtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgMTAwMDsgeCsrKSB7XHJcbiAgICAgICAgcmV0LnB1c2goaW5uZXIoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59KSgpO1xyXG5cclxubGV0IF9ybmRDb2xvciA9IDA7XHJcbmxldCBnZXRDb2xvciA9IChpZHggPSAtMSkgPT4ge1xyXG4gICAgaWYgKF9ybmRDb2xvciA+PSBDT0xPUlMubGVuZ3RoKVxyXG4gICAgICAgIF9ybmRDb2xvciA9IDA7XHJcbiAgICBpZiAoaWR4ID4gLTEgJiYgaWR4IDwgQ09MT1JTLmxlbmd0aClcclxuICAgICAgICByZXR1cm4gQ09MT1JTW2lkeF07XHJcbiAgICByZXR1cm4gQ09MT1JTW19ybmRDb2xvcisrXTtcclxufTtcclxuXHJcbmNvbnN0IE1BR0lDX0NPTE9SUyA9ICgoKSA9PiB7XHJcbiAgICBsZXQgcmV0ID0gW107XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IDUwOyB4KyspIHtcclxuICAgICAgICByZXQucHVzaChnZXRDb2xvcih4KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59KSgpO1xyXG5jb25zdCBNQUdJQ19DT0xPUlNfUkVWRVJTRSA9ICgoKSA9PiB7XHJcbiAgICByZXR1cm4gWy4uLk1BR0lDX0NPTE9SU10ucmV2ZXJzZSgpO1xyXG59KSgpO1xyXG5cclxuY29uc3QgTU9WRV9TVEVQU19JTl9GUkFNRVMgPSAzMDtcclxuXHJcbi8vIGNvbnNvbGUubG9nKE1BR0lDX0NPTE9SUyk7XHJcblxyXG5jbGFzcyBUaWxlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih7IG51bWJlciA9IDAsIGMgPSAwLCByID0gMCB9ID0ge30pIHtcclxuICAgICAgICB0aGlzLm51bWJlciA9IG51bWJlciB8fCBnZXRSYW5kb21JbnQoMSwgMyk7XHJcbiAgICAgICAgLy8gaW4gY29sL3JvdyBjb29yZGluYXRlcywgdGhhdCBpcyBpbiBvdXIgb3duIGludGVybmFsIHVuaXRzXHJcbiAgICAgICAgdGhpcy5jID0gYztcclxuICAgICAgICB0aGlzLnIgPSByO1xyXG4gICAgICAgIHRoaXMubW92ZVRvID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zdGVwc01vdmVkID0gMDtcclxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnRyYWNrZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYWxsZWQgb25jZSBwZXIgZnJhbWUgLSBvbmx5IG9uY2UgcGVyIGZyYW1lIVxyXG4gICAgZHJhdyhjdHgsIHN3LCBzaCkge1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogcmFuZG9taXplIGNvbG9yIGFjY29yZGluZyB0byB0aGlzLm51bWJlclxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogaW1wbGVtZW50IHRpbGUgZGVzdHJ1Y3Rpb24gYW5kIGFkZGluZyBuZXcgdGlsZXMgZnJvbSBhYm92ZVxyXG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3kgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IFt3LCBoXSA9IHRoaXMudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICAvLyB0aGVzZSBhcmUgdGhlIG9yaWdpbmFsIHBpeGVsIGNvb3JkcyAtIHRoZXkgbmVlZCB0byBiZSBhZGp1c3RlZFxyXG4gICAgICAgIC8vIHdoZW4gd2UgaGF2ZSB0byBjb2xsYXBzZVxyXG4gICAgICAgIGxldCBbbCwgdF0gPSBbLTEsIC0xXTsgXHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubW92ZVRvICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLnN0ZXBzTW92ZWQrK1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdGVwc01vdmVkIDw9IE1PVkVfU1RFUFNfSU5fRlJBTUVTKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPKGRrZyk6IHJldGhpbmsgdGhpcyBhcHByb2FjaCAtIGl0IGlzIG5vdCB3b3JraW5nIGF0IGFsbCByaWdodCBub3cuXHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzdGFydCBhdCBjMCwgcjAgYW5kIHdhbnQgdG8gZ28gdG8gY04sIHJNXHJcbiAgICAgICAgICAgICAgICAvLyB3aXRoIChjTiAhPSBjMCBhbmQgck0gIT0gcjApIGluIGEgY29uc3RhbnRcclxuICAgICAgICAgICAgICAgIC8vIG51bWJlciBvZiBzdGVwcyAoTU9WRV9TVEVQU19JTl9GUkFNRVMpLlxyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBwaXhlbCB3aXNlLCBub3QgY29sdW1uL3JvdyB3aXNlLlxyXG4gICAgICAgICAgICAgICAgbGV0IFtsLCB0XSA9IHRoaXMuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuICAgICAgICAgICAgICAgIGxldCBbbWwsIG10XSA9IHRoaXMubW92ZVRvLmNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCk7IFxyXG4gICAgICAgICAgICAgICAgLy8gZGlzdGFuY2UgYmV0d2VlbiBzdGFydCB0aWxlIGFuZCBlbmQgdGlsZSBpbiBwaXhlbFxyXG4gICAgICAgICAgICAgICAgbGV0IFtkbCwgZHRdID0gW21sIC0gbCwgbXQgLSB0XTtcclxuICAgICAgICAgICAgICAgIGxldCBbZGVsdGFXaWR0aEluUGl4ZWwsIGRlbHRhSGVpZ2h0SW5QaXhlbF0gPSBbZGwgLyBNT1ZFX1NURVBTX0lOX0ZSQU1FUywgZHQgLyBNT1ZFX1NURVBTX0lOX0ZSQU1FU107XHJcbiAgICAgICAgICAgICAgICBsZXQgW3RvdGFsRFdJUCwgdG90YWxESElQXSA9IFtkZWx0YVdpZHRoSW5QaXhlbCAqIHRoaXMuc3RlcHNNb3ZlZCwgZGVsdGFIZWlnaHRJblBpeGVsICogdGhpcy5zdGVwc01vdmVkXTtcclxuICAgICAgICAgICAgICAgIGxldCBbdGFyZ2V0TGVmdCwgdGFyZ2V0VG9wXSA9IFtsICsgdG90YWxEV0lQLCB0ICsgdG90YWxESElQXTtcclxuICAgICAgICAgICAgICAgIFtsLCB0XSA9IFtNYXRoLmNlaWwodGFyZ2V0TGVmdCksIE1hdGguY2VpbCh0YXJnZXRUb3ApXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIFt0aGlzLmMsIHRoaXMucl0gPSBbdGhpcy5tb3ZlVG8uYywgdGhpcy5tb3ZlVG8ucl07XHJcbiAgICAgICAgICAgICAgICBbbCwgdF0gPSB0aGlzLm1vdmVUby5jYW52YXNDb29yZGluYXRlcyhzdywgc2gpOyBcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RlcHNNb3ZlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVUbyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIFtsLCB0XSA9IHRoaXMuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmaWxsQ29sb3IgPSBNQUdJQ19DT0xPUlNbdGhpcy5udW1iZXItMV07XHJcbiAgICAgICAgbGV0IGFudGlDb2xvciA9IGlzRGFya0NvbG9yKGZpbGxDb2xvcikgPyBcImxpZ2h0Z3JheVwiIDogXCJibGFja1wiO1xyXG5cclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMTtcclxuICAgICAgICAvLyBjdHguZmlsbFN0eWxlID0gKHRoaXMuYyArIHRoaXMucikgJSAyICE9IDAgPyBcIiNGRjQ1MDBcIiA6IFwiI0ZGQTUwMFwiO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KGwsIHQsIHcsIGgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy50cmFja2VkKSB7XHJcbiAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSA0O1xyXG4gICAgICAgICAgICAvLyBjdHguc3Ryb2tlU3R5bGUgPSBNQUdJQ19DT0xPUlNfUkVWRVJTRVt0aGlzLm51bWJlci0xXTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gYW50aUNvbG9yO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlUmVjdChsLCB0LCB3LCBoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHdyaXRlIHRoZSBudW1iZXIgaW4gdGhlIGNlbnRlciBvZiB0aGUgdGlsZVxyXG4gICAgICAgIGxldCBbeCwgeV0gPSBbXHJcbiAgICAgICAgICAgIGwgKyBNYXRoLmNlaWwodyAvIDIuMCksIFxyXG4gICAgICAgICAgICB0ICsgTWF0aC5jZWlsKGggLyAyLjApXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgLy8gY3R4LmZpbGxTdHlsZSA9IE1BR0lDX0NPTE9SU19SRVZFUlNFW3RoaXMubnVtYmVyXTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gYW50aUNvbG9yO1xyXG4gICAgICAgIGN0eC5mb250ID0gXCIzMnB4IGNvdXJpZXJcIjtcclxuICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcclxuICAgICAgICBjdHguZmlsbFRleHQodGhpcy5udW1iZXIsIHgsIHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGFuaW1hdGVDb2xsYXBzZVRvKHRhcmdldFRpbGUpIHtcclxuICAgICAgICB0aGlzLm1vdmVUbyA9IHRhcmdldFRpbGU7XHJcbiAgICAgICAgdGhpcy5zdGVwc01vdmVkID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBjYW52YXNDb29yZGluYXRlcyhzdywgc2gpIHtcclxuICAgICAgICAvLyByZXR1cm4gdGhlIGN1cnJlbnQgdGlsZSBwb3NpdGlvbiBpbiBwaXhlbFxyXG4gICAgICAgIGxldCBbdHcsIHRoXSA9IHRoaXMudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBjYWxjIHRoZSB0b3AgYW5kIGxlZnQgY29vcmRpbmF0ZXMgaW4gcGl4ZWwgKHRvcC1sZWZ0IGlzIDAsIDAgaW4gb3VyIGNvb3JkaW5hdGUgc3lzdGVtXHJcbiAgICAgICAgLy8gYW5kIGJvdHRvbS1yaWdodCBpcyBvdXIgc2NyZWVuX2hlaWdodC1zY3JlZW5fd2lkdGgpXHJcbiAgICAgICAgLy8gdGhpcyBkZXBlbmRzIG9uIHRoZSB0aWxlcyBwb3NpdGlvbiAoaW4gY29sL3JvdyBjb29yZHMpXHJcbiAgICAgICAgLy8gSW4gY2FzZSB3ZSBhcmUgbW92aW5nL2NvbGxhcHNpbmcgb250byBhbm90aGVyIHRpbGUsIHdlIHdpbGwgbmVlZFxyXG4gICAgICAgIC8vIHRvIG1vdmUgb25jZSBwZXIgZnJhbWUgaW50byBhIGNlcnRhaW4gZGlyZWN0aW9uLlxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBbbCwgdF0gPSBbXHJcbiAgICAgICAgICAgIHRoaXMuYyAqIHR3LFxyXG4gICAgICAgICAgICB0aGlzLnIgKiB0aFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHJldHVybiBbbCwgdF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRpbGVEaW1lbnNpb25zKHN3LCBzaCkge1xyXG4gICAgICAgIC8vIGNhbGMgdGlsZSB3aWR0aCBhbmQgaGVpZ2h0IGluIHBpeGVscyBmb3Igb25lIHRpbGVcclxuICAgICAgICAvLyBERVBFTkRJTkcgb24gdGhlIGN1cnJlbnQgc2NyZWVuIG9yIGJvYXJkIGRpbWVuc2lvbiFcclxuICAgICAgICAvLyBzdzogc2NyZWVuIG9yIGJvYXJkIHdpZHRoIGluIHBpeGVsXHJcbiAgICAgICAgLy8gc2g6IHNjcmVlbiBvciBib2FyZCBoZWlnaHQgaW4gcGl4ZWxcclxuICAgICAgICBcclxuICAgICAgICBsZXQgW3R3LCB0aF0gPSBbTWF0aC5jZWlsKHN3IC8gQk9BUkRfV0lEVEgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNlaWwoc2ggLyBCT0FSRF9IRUlHSFQpXTtcclxuICAgICAgICByZXR1cm4gW3R3LCB0aF07XHJcbiAgICB9XHJcbn0gLy8gY2xhc3MgVGlsZVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgICAgIGxldCB0aWxlcyA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0aWxlcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb3VudGVyID0gMDsgY291bnRlciA8IEJPQVJEX1RJTEVTX0NPVU5UOyBjb3VudGVyKyspIHtcclxuICAgICAgICAgICAgICAgIC8vIGxldCBbY29sdW1ucywgcm93c10gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcGFyc2VGbG9hdChCT0FSRF9USUxFU19DT1VOVCAvIEJPQVJEX1dJRFRIKSxcclxuICAgICAgICAgICAgICAgICAgICAvLyBwYXJzZUZsb2F0KEJPQVJEX1RJTEVTX0NPVU5UIC8gQk9BUkRfSEVJR0hUKVxyXG4gICAgICAgICAgICAgICAgLy8gXTtcclxuICAgICAgICAgICAgICAgIGxldCBbY29sdW1uLCByb3ddID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGNvdW50ZXIgJSBCT0FSRF9XSURUSCwgMTApLCAgICAgICAgICAgICAgLy8gcG9zaXRpb24gaW4gY29sdW1uXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoTWF0aC5mbG9vcihjb3VudGVyIC8gQk9BUkRfSEVJR0hUKSwgMTApLCAvLyBwb3NpdGlvbiBpbiByb3dcclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGUgPSBuZXcgVGlsZSh7IG51bWJlcjogZ2V0UmFuZG9tSW50KDEsIDMpLCBjOiBjb2x1bW4sIHI6IHJvdyB9KTtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRpbGVzO1xyXG4gICAgICAgIH0pKCk7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IHRpbGVzO1xyXG4gICAgXHJcbiAgICAgICAgbGV0IGJvYXJkRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmRcIik7XHJcbiAgICAgICAgbGV0IGNvbnRleHQgPSBib2FyZEVsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eCA9IGNvbnRleHQ7XHJcbiAgICAgICAgdGhpcy5ib2FyZEVsZW1lbnQgPSBib2FyZEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgcmVzaXplID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBbd3csIHdoXSA9IFskKHdpbmRvdykud2lkdGgoKSwgJCh3aW5kb3cpLmhlaWdodCgpXTtcclxuICAgICAgICAgICAgbGV0IG1hcmdpbiA9IDIwMDtcclxuICAgICAgICAgICAgbGV0ICRib2FyZCA9ICQoXCIjYm9hcmRcIik7XHJcbiAgICAgICAgICAgICRib2FyZC5oZWlnaHQoYCR7d2gtbWFyZ2lufXB4YCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgPSB3aC1tYXJnaW47XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmNhbnZhcy53aWR0aCA9ICRib2FyZC53aWR0aCgpOyAvLyB0aGlzIHNob3VsZCB0YWtlIG1hcmdpbnMgYW5kIENTUyBpbnRvIGFjY291bnRcclxuICAgICAgICAgICAgLy8gdGhpcy5kcmF3KCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgcmVzaXplKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZ2V0TW91c2VDb29yZGluYXRlcyA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQgPSBldiB8fCB3aW5kb3cuZXZlbnQ7IC8vIElFLWlzbVxyXG4gICAgICAgICAgICAvLyBJZiBwYWdlWC9ZIGFyZW4ndCBhdmFpbGFibGUgYW5kIGNsaWVudFgvWSBhcmUsXHJcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBwYWdlWC9ZIC0gbG9naWMgdGFrZW4gZnJvbSBqUXVlcnkuXHJcbiAgICAgICAgICAgIC8vIChUaGlzIGlzIHRvIHN1cHBvcnQgb2xkIElFKVxyXG4gICAgICAgICAgICBpZiAoZXZlbnQucGFnZVggPT0gbnVsbCAmJiBldmVudC5jbGllbnRYICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBldmVudERvYyA9IChldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0Lm93bmVyRG9jdW1lbnQpIHx8IGRvY3VtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGRvYyA9IGV2ZW50RG9jLmRvY3VtZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gZXZlbnREb2MuYm9keTtcclxuXHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWdlWCA9IGV2ZW50LmNsaWVudFggK1xyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5zY3JvbGxMZWZ0IHx8IGJvZHkgJiYgYm9keS5zY3JvbGxMZWZ0IHx8IDApIC1cclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2MuY2xpZW50TGVmdCB8fCBib2R5ICYmIGJvZHkuY2xpZW50TGVmdCB8fCAwKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhZ2VZID0gZXZlbnQuY2xpZW50WSArXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLnNjcm9sbFRvcCAgfHwgYm9keSAmJiBib2R5LnNjcm9sbFRvcCAgfHwgMCkgLVxyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5jbGllbnRUb3AgIHx8IGJvZHkgJiYgYm9keS5jbGllbnRUb3AgIHx8IDAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHBhcmVudE9mZnNldCA9ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5vZmZzZXQoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBtb3VzZVBvcyA9IHtcclxuICAgICAgICAgICAgICAgIHg6IGV2ZW50LnBhZ2VYIC0gcGFyZW50T2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICB5OiBldmVudC5wYWdlWSAtIHBhcmVudE9mZnNldC50b3BcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwibW91c2UgbW92ZWRcIiwgbW91c2VQb3MueCwgbW91c2VQb3MueSk7XHJcbiAgICAgICAgICAgIHJldHVybiBtb3VzZVBvcztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgbW91c2VUcmFja2VyID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBtb3VzZVBvcyA9IGdldE1vdXNlQ29vcmRpbmF0ZXMoZXYpLFxyXG4gICAgICAgICAgICAgICAgZGltcyA9IHRoaXMuZ2V0RGltcygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aWxlLnRyYWNrZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB0aGUgbW91c2VQb3MgaXMgaW4gcGl4ZWwgY29vcmRzXHJcbiAgICAgICAgICAgICAgICBsZXQgW3N3LCBzaF0gPSBkaW1zO1xyXG4gICAgICAgICAgICAgICAgbGV0IFt0dywgdGhdID0gdGlsZS50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgICAgICAgICAgbGV0IFt0bCwgdHRdID0gdGlsZS5jYW52YXNDb29yZGluYXRlcyhzdywgc2gpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtb3VzZVBvcy54ID49IHRsICYmIG1vdXNlUG9zLnggPD0gKHRsICsgdHcpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VQb3MueSA+PSB0dCAmJiBtb3VzZVBvcy55IDw9ICh0dCArIHRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbGUudHJhY2tlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQoXCIjYm9hcmRcIikub24oXCJtb3VzZW1vdmVcIiwgbW91c2VUcmFja2VyKTtcclxuXHJcbiAgICAgICAgbGV0IG1vdXNlQ2xpY2sgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmICh0aGlzLmRyYXdpbmcgIT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiSWdub3JlZCBtb3VzZSBjbGljayBiZWNhdXNlIEkgd2FzIGRyYXdpbmcuXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbW91c2VQb3MgPSBnZXRNb3VzZUNvb3JkaW5hdGVzKGV2KSxcclxuICAgICAgICAgICAgICAgIGRpbXMgPSB0aGlzLmdldERpbXMoKTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJjbGlja2VkIGhlcmVcIiwgbW91c2VQb3MpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNsaWNrZWRPblRpbGVzID0gdGhpcy5ib2FyZC5maWx0ZXIoKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aWxlLnRyYWNrZWQ7IC8vIHdlIGFyZSBjaGVhdGluZyBoZXJlXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVUaWxlQ2xpY2tlZChjbGlja2VkT25UaWxlcy5sZW5ndGggPiAwID8gY2xpY2tlZE9uVGlsZXNbMF0gOiBudWxsKTtcclxuXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAkKFwiI2JvYXJkXCIpLm9uKFwiY2xpY2tcIiwgbW91c2VDbGljayk7XHJcblxyXG4gICAgICAgIHJlc2l6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZVRpbGVDbGlja2VkKGNsaWNrZWRPblRpbGUpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImhhbmRsZVRpbGVDbGlja2VkXCIsIGNsaWNrZWRPblRpbGUpO1xyXG4gICAgICAgIGlmIChudWxsID09PSBjbGlja2VkT25UaWxlKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogY2hlY2sgaWYgdGlsZSBoYXMgbmVpZ2hib3VycyB3aXRoIHRoZSBzYW1lIG51bWJlclxyXG4gICAgICAgIC8vIGlmIHllcywgaW5jcmVhc2UgY3VycmVudCB0aWxlJ3MgbnVtYmVyIGFuZCBjb2xsYXBzZSBhbGwgY29ubmVjdGVkXHJcbiAgICAgICAgLy8gbmVpZ2hib3VycyB3aXRoIHRoZSBzYW1lIG51bWJlciBvbnRvIHRoZSB0aWxlIChhbmltYXRlIHRoaXMgYXMgd2VsbCkuXHJcbiAgICAgICAgLy8gVGhlbiBsZXQgZ3Jhdml0eSBkcm9wIGRvd24gYWxsIHRpbGVzIHRoYXQgYXJlIGhhbmdpbmcgaW4gdGhlIGFpci5cclxuICAgICAgICAvLyBBZnRlciB0aGF0IGFkZCBmcmVzaCB0aWxlcyB0byB0aGUgYm9hcmQgdW50aWwgYWxsIGVtcHR5IHNwYWNlcyBhcmVcclxuICAgICAgICAvLyBmaWxsZWQgdXAgYWdhaW4gLSBsZXQgdGhlc2UgZHJvcCBmcm9tIHRoZSB0b3AgYXMgd2VsbC5cclxuXHJcbiAgICAgICAgbGV0IGNvbm5lY3RlZFRpbGVzID0gdGhpcy5nYXRoZXJDb25uZWN0ZWRUaWxlcyhjbGlja2VkT25UaWxlKTtcclxuICAgICAgICBjb25uZWN0ZWRUaWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGFuaW1hdGUgdG8gY29sbGFwc2Ugb250byBjbGlja2VkIHRpbGVcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIHRpbGVzIGFmdGVyIGFuaW1hdGlvblxyXG4gICAgICAgICAgICAvLyBjb3VudCBhbmQgYWRkIHBvaW50c1xyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBnYW1lIG92ZXJcclxuICAgICAgICAgICAgdGlsZS5hbmltYXRlQ29sbGFwc2VUbyhjbGlja2VkT25UaWxlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5KCkge1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogcmVtb3ZlIGRlc3Ryb3llZCB0aWxlcyBhbmQgYWRkIG5ldyB0aWxlcyBmcm9tIGFib3ZlIHRoZSBib2FyZFxyXG4gICAgICAgIC8vICAgICAgICAgICAgd2l0aCBncmF2aXR5IHB1bGxpbmcgdGhlbSBkb3duIGV0Yy5cclxuICAgICAgICAvLyAgICAgICAgICAgIG9ubHkgbGV0IHRoZSBwbGF5ZXIgY29udGludWUgdG8gcGxheSBhZnRlciBhbGwgYW5pbWF0aW9ucyBhcmUgZG9uZVxyXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5wbGF5LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldERpbXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtwYXJzZUludCh0aGlzLmJvYXJkRWxlbWVudC5jbGllbnRXaWR0aCwgMTApLCBwYXJzZUludCh0aGlzLmJvYXJkRWxlbWVudC5jbGllbnRIZWlnaHQsIDEwKV07XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkdhbWU6OmRyYXdcIik7XHJcbiAgICAgICAgdGhpcy5kcmF3aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuY3R4O1xyXG4gICAgICAgIGxldCBbdywgaF0gPSB0aGlzLmdldERpbXMoKTtcclxuXHJcbiAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3LCBoKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCB3LCBoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBUT0RPKGRrZyk6IGltcGxlbWVudCB0aGlzIVxyXG4gICAgICAgIC8vIGlmIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBOT1QgYSBtdWx0aXBsZSBvZiBlaXRoZXIgQk9BUkRfV0lEVEggb3JcclxuICAgICAgICAvLyBCT0FSRF9IRUlHSFQgd2UgbmVlZCB0byB1c2UgdGhlIHZhbHVlcyB0aGF0IGZpdCBhbmQgXCJtb3ZlXCIgdGhlIHRvcCBcclxuICAgICAgICAvLyBhbmQgbGVmdCBvZiB0aGUgYm9hcmQgYSBiaXQgYW5kIGludHJvZHVjZSBhIGJsYWNrIGJvcmRlciB0aGF0IGZpbGxzXHJcbiAgICAgICAgLy8gdXAgdGhlIGV4dHJhbm91cyBcInNwYWNlIVxyXG4gICAgICAgIC8vIEFsc28sIG1vdmUgdGhlIGJvYXJkIGFyZWEgdG8gdGhlIGNlbnRlciBpZiB0aGVyZSBpcyBtb3JlIGNhbnZhcyBzcGFjZVxyXG4gICAgICAgIC8vIHRoYW4gbmVlZGVkIHRvIGRpc3BsYXkgdGhlIGJvYXJkLlxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGRyYXcgaW5kaXZpZHVhbCB0aWxlcyAtIG9ubHkgdGhlIHRyYWNrZWQgb25lIHNob3VsZCBiZSBkcmF3biBvdmVyXHJcbiAgICAgICAgLy8gYWxsIG90aGVyIHRpbGVzIGxhc3QsIGJlY2F1c2Ugb3RoZXJ3aXNlIHRoZSBib3JkZXIgb3V0bGluZSBpc1xyXG4gICAgICAgIC8vIG92ZXJkcmF3biBieSBuZWlnaGJvdXJpbmcgdGlsZXNcclxuICAgICAgICBsZXQgZGVsYXllZERpc3BsYXkgPSBbXTtcclxuICAgICAgICB0aGlzLmJvYXJkLmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRpbGUudHJhY2tlZCkge1xyXG4gICAgICAgICAgICAgICAgZGVsYXllZERpc3BsYXkucHVzaCh0aWxlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRpbGUuZHJhdyhjdHgsIHcsIGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVsYXllZERpc3BsYXkuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICB0aWxlLmRyYXcoY3R4LCB3LCBoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3aW5nID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmV0dXJucyB0aGUgbmVpZ2hib3VyaW5nIHRpbGVzIHRoYXQgaGF2ZSB0aGUgc2FtZSBudW1iZXIgYXMgdGhlIHByb3ZpZGVkIHRpbGVcclxuICAgIGZpbmROZWlnaGJvdXJzRm9yVGlsZSh0aWxlKSB7XHJcbiAgICAgICAgbGV0IG5laWdoYm91cnMgPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IGxlZnQgPSB0aWxlLmMgPiAwID8gdGhpcy5nZXRUaWxlQXQodGlsZS5jIC0gMSwgdGlsZS5yKSA6IG51bGw7XHJcbiAgICAgICAgbGV0IHRvcCA9IHRpbGUuciA+IDAgPyB0aGlzLmdldFRpbGVBdCh0aWxlLmMsIHRpbGUuciAtIDEpIDogbnVsbDtcclxuICAgICAgICBsZXQgcmlnaHQgPSB0aWxlLmMgPCBCT0FSRF9XSURUSC0xID8gdGhpcy5nZXRUaWxlQXQodGlsZS5jICsgMSwgdGlsZS5yKSA6IG51bGw7XHJcbiAgICAgICAgbGV0IGJvdHRvbSA9IHRpbGUuciA8IEJPQVJEX0hFSUdIVC0xID8gdGhpcy5nZXRUaWxlQXQodGlsZS5jLCB0aWxlLnIgKyAxKSA6IG51bGw7XHJcblxyXG4gICAgICAgIGlmIChudWxsICE9IGxlZnQgJiYgbGVmdC5udW1iZXIgPT09IHRpbGUubnVtYmVyKSBuZWlnaGJvdXJzLnB1c2gobGVmdCk7XHJcbiAgICAgICAgaWYgKG51bGwgIT0gdG9wICYmIHRvcC5udW1iZXIgPT09IHRpbGUubnVtYmVyKSBuZWlnaGJvdXJzLnB1c2godG9wKTtcclxuICAgICAgICBpZiAobnVsbCAhPSByaWdodCAmJiByaWdodC5udW1iZXIgPT09IHRpbGUubnVtYmVyKSBuZWlnaGJvdXJzLnB1c2gocmlnaHQpO1xyXG4gICAgICAgIGlmIChudWxsICE9IGJvdHRvbSAmJiBib3R0b20ubnVtYmVyID09PSB0aWxlLm51bWJlcikgbmVpZ2hib3Vycy5wdXNoKGJvdHRvbSk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZWlnaGJvdXJzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFRpbGVBdChjb2x1bW4sIHJvdykge1xyXG4gICAgICAgIGxldCB0aWxlID0gdGhpcy5ib2FyZC5maW5kKCh0KSA9PiB0LmMgPT09IGNvbHVtbiAmJiB0LnIgPT09IHJvdyk7XHJcbiAgICAgICAgcmV0dXJuICEhdGlsZSA/IHRpbGUgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJldHVybnMgYSBsaXN0IG9mIGFsbCB0aWxlcyB0aGF0IHNoYXJlIHRoZSBzYW1lIG51bWJlciBhcyB0aGUgb25lIHByb3ZpZGVkXHJcbiAgICAvLyBhbmQgdGhhdCBhcmUgY29udGlub3VzbHkgY29ubmVjdGVkIHRocm91Z2hvdXQgZWFjaCBvdGhlci5cclxuICAgIC8vIEltcG9ydGFudDogYm9hcmQgYm9yZGVycyBhcmUgY3V0IG9mZiBwb2ludHMhXHJcbiAgICBnYXRoZXJDb25uZWN0ZWRUaWxlcyh0aWxlKSB7XHJcblxyXG4gICAgICAgIC8vIEEgbGlzdCBvZiBhcnJheSBpbmRpY2VzIHRoYXQgYXJlIGNvbm5lY3RlZCB0byB0aGUgdGlsZVxyXG4gICAgICAgIC8vIGFuZCBmdXJ0aGVybW9yZSB0byBvdGhlciB0aWxlcyB3aXRoIHRoZSBzYW1lIHZhbHVlL251bWJlci5cclxuICAgICAgICBsZXQgY29ubmVjdGVkID0gW107IFxyXG5cclxuICAgICAgICAvLyBTZWFyY2hlcyB0aHJvdWdoIGFsbCBuZWlnaGJvdXJzIHRvIGZpbmQgYWxsIGNvbm5lY3RlZCB0aWxlcy5cclxuICAgICAgICBsZXQgY3Jhd2wgPSAocm9vdFRpbGUsIGNyYXdsZWQsIGlnbm9yZVJvb3QpID0+IHtcclxuICAgICAgICAgICAgaWYgKHJvb3RUaWxlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJyb290VGlsZSBub3Qgc2V0XCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBudW0gPSByb290VGlsZS5udW1iZXI7XHJcbiAgICAgICAgICAgIGNyYXdsZWQucHVzaChyb290VGlsZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbmVpZ2hib3VycyA9IHRoaXMuZmluZE5laWdoYm91cnNGb3JUaWxlKHJvb3RUaWxlKSxcclxuICAgICAgICAgICAgICAgIGNvdW50ZWQgPSBuZWlnaGJvdXJzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRlZDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdCA9IG5laWdoYm91cnNbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgaWR4T2YgPSBjcmF3bGVkLmluZGV4T2YodCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaWR4T2YgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3Jhd2wodCwgY3Jhd2xlZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIGNyYXdsKHRpbGUsIGNvbm5lY3RlZCwgdHJ1ZSk7XHJcbiAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBoYXZlIG91ciBpbml0aWFsIHRpbGUgaW4gdGhlIHJlc3VsdCBzZXRcclxuICAgICAgICByZXR1cm4gY29ubmVjdGVkLmZpbHRlcigodCkgPT4gISh0LnIgPT09IHRpbGUuciAmJiB0LmMgPT09IHRpbGUuYykpO1xyXG4gICAgfVxyXG4gICAgXHJcbn0gLy8gY2xhc3MgR2FtZVxyXG4iLCIvKlxyXG4gKiAgVXRpbGl0eSBmdW5jdGlvbnNcclxuICovXHJcbiBcclxubGV0IGdldFJhbmRvbUludCA9IChtaW4sIG1heCA9IGZhbHNlKSA9PiB7XHJcbiAgICBpZiAobWF4ID09PSBmYWxzZSkge1xyXG4gICAgICAgIG1heCA9IG1pbjtcclxuICAgICAgICBtaW4gPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhcnNlSW50KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW4sIDEwKTtcclxufTtcclxuXHJcbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzEyMDQzMjI4LzE5MzE2NVxyXG5mdW5jdGlvbiBpc0RhcmtDb2xvcihjb2xvcikge1xyXG4gICAgdmFyIGMgPSBjb2xvci5sZW5ndGggPT09IDYgPyBjb2xvciA6IGNvbG9yLnN1YnN0cmluZygxKTsgLy8gc3RyaXAgI1xyXG4gICAgdmFyIHJnYiA9IHBhcnNlSW50KGMsIDE2KTsgICAvLyBjb252ZXJ0IHJyZ2diYiB0byBkZWNpbWFsXHJcbiAgICB2YXIgciA9IChyZ2IgPj4gMTYpICYgMHhmZjsgIC8vIGV4dHJhY3QgcmVkXHJcbiAgICB2YXIgZyA9IChyZ2IgPj4gIDgpICYgMHhmZjsgIC8vIGV4dHJhY3QgZ3JlZW5cclxuICAgIHZhciBiID0gKHJnYiA+PiAgMCkgJiAweGZmOyAgLy8gZXh0cmFjdCBibHVlXHJcblxyXG4gICAgLy8gdXNlIGEgc3RhbmRhcmQgZm9ybXVsYSB0byBjb252ZXJ0IHRoZSByZXN1bHRpbmcgUkdCIHZhbHVlcyBpbnRvIHRoZWlyIHBlcmNlaXZlZCBicmlnaHRuZXNzXHJcbiAgICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9SZWMuXzcwOSNMdW1hX2NvZWZmaWNpZW50c1xyXG4gICAgdmFyIGx1bWEgPSAwLjIxMjYgKiByICsgMC43MTUyICogZyArIDAuMDcyMiAqIGI7IC8vIHBlciBJVFUtUiBCVC43MDlcclxuXHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImx1bWEgZm9yIGNvbG9yOlwiLCBjb2xvciwgbHVtYSk7XHJcblxyXG4gICAgcmV0dXJuIGx1bWEgPCA4MDsgLy8gdG9vIGRhcmsgaWYgbHVtYSBpcyBzbWFsbGVyIHRoYW4gTlxyXG59XHJcblxyXG5cclxuZXhwb3J0IHsgZ2V0UmFuZG9tSW50LCBpc0RhcmtDb2xvciB9O1xyXG4iXX0=
