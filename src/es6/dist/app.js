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

var MOVE_STEPS_IN_FRAMES = 30; // or in 0.5 seconds, assuming 60 frames/sec

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
        this.currentPosition = false;
        this.velocity = 4; // random number, hidden xkcd reference
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
            //            Would be cool if the tile would explode in huge explosion
            //            but only if the number is 9 and it would become a 10.
            if (this.destroy === true) {
                return;
            }

            var _tileDimensions = this.tileDimensions(sw, sh);

            var _tileDimensions2 = _slicedToArray(_tileDimensions, 2);

            var w = _tileDimensions2[0];
            var h = _tileDimensions2[1];

            // these are the original pixel coords - they need to be adjusted
            // when we have to collapse

            var _canvasCoordinates = this.canvasCoordinates(sw, sh);

            var _canvasCoordinates2 = _slicedToArray(_canvasCoordinates, 2);

            var l = _canvasCoordinates2[0];
            var t = _canvasCoordinates2[1];

            if (this.moveTo !== false) {
                // TODO(dkg): Check if we are already in the correct spot and
                //            if we are, just mark us as destroyed.

                //    stepsMoved is important, as we want to keep track how far
                //    we are into the animation cycle for this move, even when the
                //    user changes the size of the window and therefore the canvas dimensions
                var step = ++this.stepsMoved;

                // Here is the general animation idea:
                // -  the velocity should probably adjusted so that all tiles
                //    arrive at the same time regardless of distance
                // -  each frame, move the source closer to the target
                // -  the number of steps for each frame shall be calculated
                //    as follows: magic
                //
                //    general rule: the whole animation for the move should
                //                  not take longer than N milliseconds (or M frames)
                //    we need the fraction of how far we are in the right directions
                //    from there we can calc the pixel position

                var dr = this.r - this.moveTo.r;
                var dc = this.c - this.moveTo.c;

                var _moveTo$canvasCoordinates = this.moveTo.canvasCoordinates(sw, sh);

                var _moveTo$canvasCoordinates2 = _slicedToArray(_moveTo$canvasCoordinates, 2);

                var tl = _moveTo$canvasCoordinates2[0];
                var tt = _moveTo$canvasCoordinates2[1];
                // hmm, this seems inefficient if we
                // do this for every time for each tile
                // that needs to move to this position.
                // maybe we could pull this into the
                // calling function instead and pass
                // it through?
                // TODO(dkg): this commented version has the right idea
                //            the pieces move into the right direction, however
                //            they move too far too fast so I think the
                //            actual distance calculation is off by quite a bit - fix that
                // let fraction = (step / MOVE_STEPS_IN_FRAMES);
                // console.log("fraction", fraction);

                // let [fl, ft] = [ dc > 0 ? -fraction * l : fraction * l, dr > 0 ? -fraction * t : fraction * t ];
                // [l, t] = [ dc == 0 ? l : l + fl, dr == 0 ? t : t + ft];
                var fraction = step / MOVE_STEPS_IN_FRAMES;

                // this code is not working
                var fl = fraction * dc;
                var ft = fraction * dr;

                // this code is working
                var _ref2 = [tl - fl * l, tt - ft * t];
                l = _ref2[0];
                t = _ref2[1];
                if (step >= MOVE_STEPS_IN_FRAMES) {
                    this.destroy = true;
                    this.stepsMoved = 0;
                    this.moveTo = false;
                }
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
            // TODO(dkg): for debugging purposes display a overlay or
            //            different border color for all connected tiles
            //            as a whole, not for each individual one
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiQzovVXNlcnMvZGtnL1Byb2pla3RlL2dhbWVzL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O3VCQ09pQixZQUFZOzs7O0FBSjdCLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQTs7QUFFdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFJckIsSUFBSSxJQUFJLEdBQUcsMEJBQVUsQ0FBQztBQUN0QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3QkNIOEIsYUFBYTs7Ozs7QUFLdkQsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN4QixJQUFNLGlCQUFpQixHQUFHLFdBQVcsR0FBRyxZQUFZLENBQUM7O0FBRXJELElBQU0sTUFBTSxHQUFHLENBQUMsWUFBTTs7QUFFbEIsUUFBSSxLQUFLLEdBQUcsU0FBUixLQUFLLEdBQVM7QUFDZCxZQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDYixhQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hCLGdCQUFJLENBQUMsR0FBRyxBQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckUsZ0JB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QUFDLEdBQUksSUFBSSxDQUFDOzs7O0FBSTNCLFFBQUksSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDOzs7O0FBSWhELFdBQU8sSUFBSSxHQUFHLEVBQUUsQ0FBQztDQUNwQjs7UUFHUSxZQUFZLEdBQVosWUFBWTtRQUFFLFdBQVcsR0FBWCxXQUFXIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXHJcbiAgICBFUzYgY29kZSBlbnRyeSBwb2ludFxyXG4qL1xyXG5jb25zdCBWRVJTSU9OID0gXCIwLjAuMVwiXHJcblxyXG5jb25zb2xlLmxvZyhWRVJTSU9OKTtcclxuXHJcbmltcG9ydCBHYW1lIGZyb20gJy4vZ2FtZS5lczYnO1xyXG5cclxubGV0IGdhbWUgPSBuZXcgR2FtZSgpO1xyXG5nYW1lLnBsYXkoKTtcclxuIiwiLypcclxuICAgIFRoZSBnYW1lIGNvZGUgYW5kIGxvZ2ljLCB3aXRoIFVJIGhhbmRsaW5nLlxyXG4gICAgVE9ETyhka2cpOiB1c2UgdGhlIGZvbGxvd2luZyB0ZWNobmlxdWVzXHJcbiAgICAgICAgLSBnZW5lcmF0b3JzIGFuZCB5aWVsZFxyXG4gICAgICAgIC0gU3ltYm9sc1xyXG4qL1xyXG5cclxuaW1wb3J0IHsgZ2V0UmFuZG9tSW50LCBpc0RhcmtDb2xvciB9IGZyb20gJy4vdXRpbHMuZXM2JztcclxuXHJcbi8vIHRoZXNlIGFyZSBub3QgaW4gcGl4ZWwsIGJ1dCByYXRoZXIgb3VyIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHVuaXRzXHJcbi8vIHRoaXMgbWVhbnMgTiA9IE4gbnVtYmVyIG9mIGl0ZW1zLCBlLmcuIDEwID0gMTAgaXRlbXMsIG5vdCAxMCBwaXhlbHNcclxuLy8gdGhlIGRyYXcoKSBjYWxsIHdpbGwgY29udmVydCB0aG9zZSBpbnRvIHByb3BlciBwaXhlbHNcclxuY29uc3QgQk9BUkRfV0lEVEggPSAxMDtcclxuY29uc3QgQk9BUkRfSEVJR0hUID0gMTA7XHJcbmNvbnN0IEJPQVJEX1RJTEVTX0NPVU5UID0gQk9BUkRfV0lEVEggKiBCT0FSRF9IRUlHSFQ7XHJcblxyXG5jb25zdCBDT0xPUlMgPSAoKCkgPT4ge1xyXG4gICAgLy8gVE9ETyhka2cpOiBlbGltaW5hdGUgY29sb3JzIHRoYXQgYXJlIHRvbyBjbG9zZSB0byBlYWNoIG90aGVyIGFuZC9vciBkdXBsaWNhdGVzXHJcbiAgICBsZXQgaW5uZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgbGV0IHJnYiA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB2ID0gKHBhcnNlSW50KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NSksIDEwKSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgICAgICBpZiAodi5sZW5ndGggPD0gMSkge1xyXG4gICAgICAgICAgICAgICAgdiA9IGAwJHt2fWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmdiLnB1c2godik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJldHVybiAncmdiKCcrIHJnYi5qb2luKCcsJykgKycpJztcclxuICAgICAgICByZXR1cm4gJyMnICsgcmdiLmpvaW4oXCJcIik7XHJcbiAgICB9XHJcbiAgICBsZXQgcmV0ID0gW107XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IDEwMDA7IHgrKykge1xyXG4gICAgICAgIHJldC5wdXNoKGlubmVyKCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJldDtcclxufSkoKTtcclxuXHJcbmxldCBfcm5kQ29sb3IgPSAwO1xyXG5sZXQgZ2V0Q29sb3IgPSAoaWR4ID0gLTEpID0+IHtcclxuICAgIGlmIChfcm5kQ29sb3IgPj0gQ09MT1JTLmxlbmd0aClcclxuICAgICAgICBfcm5kQ29sb3IgPSAwO1xyXG4gICAgaWYgKGlkeCA+IC0xICYmIGlkeCA8IENPTE9SUy5sZW5ndGgpXHJcbiAgICAgICAgcmV0dXJuIENPTE9SU1tpZHhdO1xyXG4gICAgcmV0dXJuIENPTE9SU1tfcm5kQ29sb3IrK107XHJcbn07XHJcblxyXG5jb25zdCBNQUdJQ19DT0xPUlMgPSAoKCkgPT4ge1xyXG4gICAgbGV0IHJldCA9IFtdO1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCA1MDsgeCsrKSB7XHJcbiAgICAgICAgcmV0LnB1c2goZ2V0Q29sb3IoeCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJldDtcclxufSkoKTtcclxuY29uc3QgTUFHSUNfQ09MT1JTX1JFVkVSU0UgPSAoKCkgPT4ge1xyXG4gICAgcmV0dXJuIFsuLi5NQUdJQ19DT0xPUlNdLnJldmVyc2UoKTtcclxufSkoKTtcclxuXHJcbmNvbnN0IE1PVkVfU1RFUFNfSU5fRlJBTUVTID0gMzA7ICAvLyBvciBpbiAwLjUgc2Vjb25kcywgYXNzdW1pbmcgNjAgZnJhbWVzL3NlY1xyXG5cclxuLy8gY29uc29sZS5sb2coTUFHSUNfQ09MT1JTKTtcclxuXHJcbmNsYXNzIFRpbGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHsgbnVtYmVyID0gMCwgYyA9IDAsIHIgPSAwIH0gPSB7fSkge1xyXG4gICAgICAgIHRoaXMubnVtYmVyID0gbnVtYmVyIHx8IGdldFJhbmRvbUludCgxLCAzKTtcclxuICAgICAgICAvLyBpbiBjb2wvcm93IGNvb3JkaW5hdGVzLCB0aGF0IGlzIGluIG91ciBvd24gaW50ZXJuYWwgdW5pdHNcclxuICAgICAgICB0aGlzLmMgPSBjO1xyXG4gICAgICAgIHRoaXMuciA9IHI7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQb3NpdGlvbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSA0OyAvLyByYW5kb20gbnVtYmVyLCBoaWRkZW4geGtjZCByZWZlcmVuY2VcclxuICAgICAgICB0aGlzLnN0ZXBzTW92ZWQgPSAwO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudHJhY2tlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNhbGxlZCBvbmNlIHBlciBmcmFtZSAtIG9ubHkgb25jZSBwZXIgZnJhbWUhXHJcbiAgICBkcmF3KGN0eCwgc3csIHNoKSB7XHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiByYW5kb21pemUgY29sb3IgYWNjb3JkaW5nIHRvIHRoaXMubnVtYmVyXHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBpbXBsZW1lbnQgdGlsZSBkZXN0cnVjdGlvbiBhbmQgYWRkaW5nIG5ldyB0aWxlcyBmcm9tIGFib3ZlXHJcbiAgICAgICAgLy8gICAgICAgICAgICBXb3VsZCBiZSBjb29sIGlmIHRoZSB0aWxlIHdvdWxkIGV4cGxvZGUgaW4gaHVnZSBleHBsb3Npb25cclxuICAgICAgICAvLyAgICAgICAgICAgIGJ1dCBvbmx5IGlmIHRoZSBudW1iZXIgaXMgOSBhbmQgaXQgd291bGQgYmVjb21lIGEgMTAuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgW3csIGhdID0gdGhpcy50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgIC8vIHRoZXNlIGFyZSB0aGUgb3JpZ2luYWwgcGl4ZWwgY29vcmRzIC0gdGhleSBuZWVkIHRvIGJlIGFkanVzdGVkXHJcbiAgICAgICAgLy8gd2hlbiB3ZSBoYXZlIHRvIGNvbGxhcHNlXHJcbiAgICAgICAgbGV0IFtsLCB0XSA9IHRoaXMuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5tb3ZlVG8gIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE8oZGtnKTogQ2hlY2sgaWYgd2UgYXJlIGFscmVhZHkgaW4gdGhlIGNvcnJlY3Qgc3BvdCBhbmRcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICBpZiB3ZSBhcmUsIGp1c3QgbWFyayB1cyBhcyBkZXN0cm95ZWQuXHJcblxyXG4gICAgICAgICAgICAvLyAgICBzdGVwc01vdmVkIGlzIGltcG9ydGFudCwgYXMgd2Ugd2FudCB0byBrZWVwIHRyYWNrIGhvdyBmYXJcclxuICAgICAgICAgICAgLy8gICAgd2UgYXJlIGludG8gdGhlIGFuaW1hdGlvbiBjeWNsZSBmb3IgdGhpcyBtb3ZlLCBldmVuIHdoZW4gdGhlIFxyXG4gICAgICAgICAgICAvLyAgICB1c2VyIGNoYW5nZXMgdGhlIHNpemUgb2YgdGhlIHdpbmRvdyBhbmQgdGhlcmVmb3JlIHRoZSBjYW52YXMgZGltZW5zaW9uc1xyXG4gICAgICAgICAgICBsZXQgc3RlcCA9ICsrdGhpcy5zdGVwc01vdmVkO1xyXG5cclxuICAgICAgICAgICAgLy8gSGVyZSBpcyB0aGUgZ2VuZXJhbCBhbmltYXRpb24gaWRlYTpcclxuICAgICAgICAgICAgLy8gLSAgdGhlIHZlbG9jaXR5IHNob3VsZCBwcm9iYWJseSBhZGp1c3RlZCBzbyB0aGF0IGFsbCB0aWxlc1xyXG4gICAgICAgICAgICAvLyAgICBhcnJpdmUgYXQgdGhlIHNhbWUgdGltZSByZWdhcmRsZXNzIG9mIGRpc3RhbmNlXHJcbiAgICAgICAgICAgIC8vIC0gIGVhY2ggZnJhbWUsIG1vdmUgdGhlIHNvdXJjZSBjbG9zZXIgdG8gdGhlIHRhcmdldFxyXG4gICAgICAgICAgICAvLyAtICB0aGUgbnVtYmVyIG9mIHN0ZXBzIGZvciBlYWNoIGZyYW1lIHNoYWxsIGJlIGNhbGN1bGF0ZWRcclxuICAgICAgICAgICAgLy8gICAgYXMgZm9sbG93czogbWFnaWNcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gICAgZ2VuZXJhbCBydWxlOiB0aGUgd2hvbGUgYW5pbWF0aW9uIGZvciB0aGUgbW92ZSBzaG91bGRcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICBub3QgdGFrZSBsb25nZXIgdGhhbiBOIG1pbGxpc2Vjb25kcyAob3IgTSBmcmFtZXMpXHJcbiAgICAgICAgICAgIC8vICAgIHdlIG5lZWQgdGhlIGZyYWN0aW9uIG9mIGhvdyBmYXIgd2UgYXJlIGluIHRoZSByaWdodCBkaXJlY3Rpb25zXHJcbiAgICAgICAgICAgIC8vICAgIGZyb20gdGhlcmUgd2UgY2FuIGNhbGMgdGhlIHBpeGVsIHBvc2l0aW9uXHJcblxyXG4gICAgICAgICAgICBsZXQgW2RyLCBkY10gPSBbdGhpcy5yIC0gdGhpcy5tb3ZlVG8uciwgdGhpcy5jIC0gdGhpcy5tb3ZlVG8uY107XHJcbiAgICAgICAgICAgIGxldCBbdGwsIHR0XSA9IHRoaXMubW92ZVRvLmNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCk7IC8vIGhtbSwgdGhpcyBzZWVtcyBpbmVmZmljaWVudCBpZiB3ZSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZG8gdGhpcyBmb3IgZXZlcnkgdGltZSBmb3IgZWFjaCB0aWxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoYXQgbmVlZHMgdG8gbW92ZSB0byB0aGlzIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBtYXliZSB3ZSBjb3VsZCBwdWxsIHRoaXMgaW50byB0aGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsbGluZyBmdW5jdGlvbiBpbnN0ZWFkIGFuZCBwYXNzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0IHRocm91Z2g/XHJcbiAgICAgICAgICAgIC8vIFRPRE8oZGtnKTogdGhpcyBjb21tZW50ZWQgdmVyc2lvbiBoYXMgdGhlIHJpZ2h0IGlkZWFcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICB0aGUgcGllY2VzIG1vdmUgaW50byB0aGUgcmlnaHQgZGlyZWN0aW9uLCBob3dldmVyXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgdGhleSBtb3ZlIHRvbyBmYXIgdG9vIGZhc3Qgc28gSSB0aGluayB0aGUgXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgYWN0dWFsIGRpc3RhbmNlIGNhbGN1bGF0aW9uIGlzIG9mZiBieSBxdWl0ZSBhIGJpdCAtIGZpeCB0aGF0XHJcbiAgICAgICAgICAgIC8vIGxldCBmcmFjdGlvbiA9IChzdGVwIC8gTU9WRV9TVEVQU19JTl9GUkFNRVMpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImZyYWN0aW9uXCIsIGZyYWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGxldCBbZmwsIGZ0XSA9IFsgZGMgPiAwID8gLWZyYWN0aW9uICogbCA6IGZyYWN0aW9uICogbCwgZHIgPiAwID8gLWZyYWN0aW9uICogdCA6IGZyYWN0aW9uICogdCBdOyBcclxuICAgICAgICAgICAgLy8gW2wsIHRdID0gWyBkYyA9PSAwID8gbCA6IGwgKyBmbCwgZHIgPT0gMCA/IHQgOiB0ICsgZnRdO1xyXG4gICAgICAgICAgICBsZXQgZnJhY3Rpb24gPSAoc3RlcCAvIE1PVkVfU1RFUFNfSU5fRlJBTUVTKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoaXMgY29kZSBpcyBub3Qgd29ya2luZ1xyXG4gICAgICAgICAgICBsZXQgW2ZsLCBmdF0gPSBbIGZyYWN0aW9uICogZGMsIGZyYWN0aW9uICogZHIgXTsgXHJcblxyXG4gICAgICAgICAgICBbbCwgdF0gPSBbIHRsIC0gZmwgKiBsLCB0dCAtIGZ0ICogdCBdO1xyXG4gICAgICAgICAgICAvLyB0aGlzIGNvZGUgaXMgd29ya2luZ1xyXG4gICAgICAgICAgICBpZiAoc3RlcCA+PSBNT1ZFX1NURVBTX0lOX0ZSQU1FUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RlcHNNb3ZlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVUbyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgbGV0IGZpbGxDb2xvciA9IE1BR0lDX0NPTE9SU1t0aGlzLm51bWJlci0xXTtcclxuICAgICAgICBsZXQgYW50aUNvbG9yID0gaXNEYXJrQ29sb3IoZmlsbENvbG9yKSA/IFwibGlnaHRncmF5XCIgOiBcImJsYWNrXCI7XHJcblxyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAxO1xyXG4gICAgICAgIC8vIGN0eC5maWxsU3R5bGUgPSAodGhpcy5jICsgdGhpcy5yKSAlIDIgIT0gMCA/IFwiI0ZGNDUwMFwiIDogXCIjRkZBNTAwXCI7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvcjtcclxuICAgICAgICBjdHguZmlsbFJlY3QobCwgdCwgdywgaCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRyYWNrZWQpIHtcclxuICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDQ7XHJcbiAgICAgICAgICAgIC8vIGN0eC5zdHJva2VTdHlsZSA9IE1BR0lDX0NPTE9SU19SRVZFUlNFW3RoaXMubnVtYmVyLTFdO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBhbnRpQ29sb3I7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VSZWN0KGwsIHQsIHcsIGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gd3JpdGUgdGhlIG51bWJlciBpbiB0aGUgY2VudGVyIG9mIHRoZSB0aWxlXHJcbiAgICAgICAgbGV0IFt4LCB5XSA9IFtcclxuICAgICAgICAgICAgbCArIE1hdGguY2VpbCh3IC8gMi4wKSwgXHJcbiAgICAgICAgICAgIHQgKyBNYXRoLmNlaWwoaCAvIDIuMClcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICAvLyBjdHguZmlsbFN0eWxlID0gTUFHSUNfQ09MT1JTX1JFVkVSU0VbdGhpcy5udW1iZXJdO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBhbnRpQ29sb3I7XHJcbiAgICAgICAgY3R4LmZvbnQgPSBcIjMycHggY291cmllclwiO1xyXG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLm51bWJlciwgeCwgeSk7XHJcbiAgICB9XHJcblxyXG4gICAgYW5pbWF0ZUNvbGxhcHNlVG8odGFyZ2V0VGlsZSkge1xyXG4gICAgICAgIHRoaXMubW92ZVRvID0gdGFyZ2V0VGlsZTtcclxuICAgICAgICB0aGlzLnN0ZXBzTW92ZWQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCkge1xyXG4gICAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudCB0aWxlIHBvc2l0aW9uIGluIHBpeGVsXHJcbiAgICAgICAgbGV0IFt0dywgdGhdID0gdGhpcy50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGNhbGMgdGhlIHRvcCBhbmQgbGVmdCBjb29yZGluYXRlcyBpbiBwaXhlbCAodG9wLWxlZnQgaXMgMCwgMCBpbiBvdXIgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICAgICAgICAvLyBhbmQgYm90dG9tLXJpZ2h0IGlzIG91ciBzY3JlZW5faGVpZ2h0LXNjcmVlbl93aWR0aClcclxuICAgICAgICAvLyB0aGlzIGRlcGVuZHMgb24gdGhlIHRpbGVzIHBvc2l0aW9uIChpbiBjb2wvcm93IGNvb3JkcylcclxuICAgICAgICAvLyBJbiBjYXNlIHdlIGFyZSBtb3ZpbmcvY29sbGFwc2luZyBvbnRvIGFub3RoZXIgdGlsZSwgd2Ugd2lsbCBuZWVkXHJcbiAgICAgICAgLy8gdG8gbW92ZSBvbmNlIHBlciBmcmFtZSBpbnRvIGEgY2VydGFpbiBkaXJlY3Rpb24uXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IFtsLCB0XSA9IFtcclxuICAgICAgICAgICAgdGhpcy5jICogdHcsXHJcbiAgICAgICAgICAgIHRoaXMuciAqIHRoXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtsLCB0XTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGlsZURpbWVuc2lvbnMoc3csIHNoKSB7XHJcbiAgICAgICAgLy8gY2FsYyB0aWxlIHdpZHRoIGFuZCBoZWlnaHQgaW4gcGl4ZWxzIGZvciBvbmUgdGlsZVxyXG4gICAgICAgIC8vIERFUEVORElORyBvbiB0aGUgY3VycmVudCBzY3JlZW4gb3IgYm9hcmQgZGltZW5zaW9uIVxyXG4gICAgICAgIC8vIHN3OiBzY3JlZW4gb3IgYm9hcmQgd2lkdGggaW4gcGl4ZWxcclxuICAgICAgICAvLyBzaDogc2NyZWVuIG9yIGJvYXJkIGhlaWdodCBpbiBwaXhlbFxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBbdHcsIHRoXSA9IFtNYXRoLmNlaWwoc3cgLyBCT0FSRF9XSURUSCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY2VpbChzaCAvIEJPQVJEX0hFSUdIVCldO1xyXG4gICAgICAgIHJldHVybiBbdHcsIHRoXTtcclxuICAgIH1cclxufSAvLyBjbGFzcyBUaWxlXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAgICAgbGV0IHRpbGVzID0gKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRpbGVzID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvdW50ZXIgPSAwOyBjb3VudGVyIDwgQk9BUkRfVElMRVNfQ09VTlQ7IGNvdW50ZXIrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gbGV0IFtjb2x1bW5zLCByb3dzXSA9IFtcclxuICAgICAgICAgICAgICAgICAgICAvLyBwYXJzZUZsb2F0KEJPQVJEX1RJTEVTX0NPVU5UIC8gQk9BUkRfV0lEVEgpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBhcnNlRmxvYXQoQk9BUkRfVElMRVNfQ09VTlQgLyBCT0FSRF9IRUlHSFQpXHJcbiAgICAgICAgICAgICAgICAvLyBdO1xyXG4gICAgICAgICAgICAgICAgbGV0IFtjb2x1bW4sIHJvd10gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoY291bnRlciAlIEJPQVJEX1dJRFRILCAxMCksICAgICAgICAgICAgICAvLyBwb3NpdGlvbiBpbiBjb2x1bW5cclxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChNYXRoLmZsb29yKGNvdW50ZXIgLyBCT0FSRF9IRUlHSFQpLCAxMCksIC8vIHBvc2l0aW9uIGluIHJvd1xyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGlsZSA9IG5ldyBUaWxlKHsgbnVtYmVyOiBnZXRSYW5kb21JbnQoMSwgMyksIGM6IGNvbHVtbiwgcjogcm93IH0pO1xyXG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaCh0aWxlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGlsZXM7XHJcbiAgICAgICAgfSkoKTtcclxuICAgICAgICB0aGlzLmJvYXJkID0gdGlsZXM7XHJcbiAgICBcclxuICAgICAgICBsZXQgYm9hcmRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZFwiKTtcclxuICAgICAgICBsZXQgY29udGV4dCA9IGJvYXJkRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4ID0gY29udGV4dDtcclxuICAgICAgICB0aGlzLmJvYXJkRWxlbWVudCA9IGJvYXJkRWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCByZXNpemUgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IFt3dywgd2hdID0gWyQod2luZG93KS53aWR0aCgpLCAkKHdpbmRvdykuaGVpZ2h0KCldO1xyXG4gICAgICAgICAgICBsZXQgbWFyZ2luID0gMjAwO1xyXG4gICAgICAgICAgICBsZXQgJGJvYXJkID0gJChcIiNib2FyZFwiKTtcclxuICAgICAgICAgICAgJGJvYXJkLmhlaWdodChgJHt3aC1tYXJnaW59cHhgKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHdoLW1hcmdpbjtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gJGJvYXJkLndpZHRoKCk7IC8vIHRoaXMgc2hvdWxkIHRha2UgbWFyZ2lucyBhbmQgQ1NTIGludG8gYWNjb3VudFxyXG4gICAgICAgICAgICAvLyB0aGlzLmRyYXcoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCByZXNpemUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBnZXRNb3VzZUNvb3JkaW5hdGVzID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBldmVudCA9IGV2IHx8IHdpbmRvdy5ldmVudDsgLy8gSUUtaXNtXHJcbiAgICAgICAgICAgIC8vIElmIHBhZ2VYL1kgYXJlbid0IGF2YWlsYWJsZSBhbmQgY2xpZW50WC9ZIGFyZSxcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHBhZ2VYL1kgLSBsb2dpYyB0YWtlbiBmcm9tIGpRdWVyeS5cclxuICAgICAgICAgICAgLy8gKFRoaXMgaXMgdG8gc3VwcG9ydCBvbGQgSUUpXHJcbiAgICAgICAgICAgIGlmIChldmVudC5wYWdlWCA9PSBudWxsICYmIGV2ZW50LmNsaWVudFggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50RG9jID0gKGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQub3duZXJEb2N1bWVudCkgfHwgZG9jdW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jID0gZXZlbnREb2MuZG9jdW1lbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBldmVudERvYy5ib2R5O1xyXG5cclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhZ2VYID0gZXZlbnQuY2xpZW50WCArXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLnNjcm9sbExlZnQgfHwgYm9keSAmJiBib2R5LnNjcm9sbExlZnQgfHwgMCkgLVxyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5jbGllbnRMZWZ0IHx8IGJvZHkgJiYgYm9keS5jbGllbnRMZWZ0IHx8IDApO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFnZVkgPSBldmVudC5jbGllbnRZICtcclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2Muc2Nyb2xsVG9wICB8fCBib2R5ICYmIGJvZHkuc2Nyb2xsVG9wICB8fCAwKSAtXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLmNsaWVudFRvcCAgfHwgYm9keSAmJiBib2R5LmNsaWVudFRvcCAgfHwgMCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgcGFyZW50T2Zmc2V0ID0gJChldmVudC50YXJnZXQpLnBhcmVudCgpLm9mZnNldCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgeDogZXZlbnQucGFnZVggLSBwYXJlbnRPZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgIHk6IGV2ZW50LnBhZ2VZIC0gcGFyZW50T2Zmc2V0LnRvcFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJtb3VzZSBtb3ZlZFwiLCBtb3VzZVBvcy54LCBtb3VzZVBvcy55KTtcclxuICAgICAgICAgICAgcmV0dXJuIG1vdXNlUG9zO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBtb3VzZVRyYWNrZXIgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0gZ2V0TW91c2VDb29yZGluYXRlcyhldiksXHJcbiAgICAgICAgICAgICAgICBkaW1zID0gdGhpcy5nZXREaW1zKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRpbGUudHJhY2tlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHRoZSBtb3VzZVBvcyBpcyBpbiBwaXhlbCBjb29yZHNcclxuICAgICAgICAgICAgICAgIGxldCBbc3csIHNoXSA9IGRpbXM7XHJcbiAgICAgICAgICAgICAgICBsZXQgW3R3LCB0aF0gPSB0aWxlLnRpbGVEaW1lbnNpb25zKHN3LCBzaCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgW3RsLCB0dF0gPSB0aWxlLmNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlUG9zLnggPj0gdGwgJiYgbW91c2VQb3MueCA8PSAodGwgKyB0dykgJiZcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZVBvcy55ID49IHR0ICYmIG1vdXNlUG9zLnkgPD0gKHR0ICsgdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGlsZS50cmFja2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgJChcIiNib2FyZFwiKS5vbihcIm1vdXNlbW92ZVwiLCBtb3VzZVRyYWNrZXIpO1xyXG5cclxuICAgICAgICBsZXQgbW91c2VDbGljayA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgKHRoaXMuZHJhd2luZyAhPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJJZ25vcmVkIG1vdXNlIGNsaWNrIGJlY2F1c2UgSSB3YXMgZHJhd2luZy5cIik7XHJcbiAgICAgICAgICAgICAgICAvLyByZXR1cm47XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBtb3VzZVBvcyA9IGdldE1vdXNlQ29vcmRpbmF0ZXMoZXYpLFxyXG4gICAgICAgICAgICAgICAgZGltcyA9IHRoaXMuZ2V0RGltcygpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNsaWNrZWQgaGVyZVwiLCBtb3VzZVBvcyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY2xpY2tlZE9uVGlsZXMgPSB0aGlzLmJvYXJkLmZpbHRlcigodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbGUudHJhY2tlZDsgLy8gd2UgYXJlIGNoZWF0aW5nIGhlcmVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVRpbGVDbGlja2VkKGNsaWNrZWRPblRpbGVzLmxlbmd0aCA+IDAgPyBjbGlja2VkT25UaWxlc1swXSA6IG51bGwpO1xyXG5cclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQoXCIjYm9hcmRcIikub24oXCJjbGlja1wiLCBtb3VzZUNsaWNrKTtcclxuXHJcbiAgICAgICAgcmVzaXplKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVGlsZUNsaWNrZWQoY2xpY2tlZE9uVGlsZSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaGFuZGxlVGlsZUNsaWNrZWRcIiwgY2xpY2tlZE9uVGlsZSk7XHJcbiAgICAgICAgaWYgKG51bGwgPT09IGNsaWNrZWRPblRpbGUpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBjaGVjayBpZiB0aWxlIGhhcyBuZWlnaGJvdXJzIHdpdGggdGhlIHNhbWUgbnVtYmVyXHJcbiAgICAgICAgLy8gaWYgeWVzLCBpbmNyZWFzZSBjdXJyZW50IHRpbGUncyBudW1iZXIgYW5kIGNvbGxhcHNlIGFsbCBjb25uZWN0ZWRcclxuICAgICAgICAvLyBuZWlnaGJvdXJzIHdpdGggdGhlIHNhbWUgbnVtYmVyIG9udG8gdGhlIHRpbGUgKGFuaW1hdGUgdGhpcyBhcyB3ZWxsKS5cclxuICAgICAgICAvLyBUaGVuIGxldCBncmF2aXR5IGRyb3AgZG93biBhbGwgdGlsZXMgdGhhdCBhcmUgaGFuZ2luZyBpbiB0aGUgYWlyLlxyXG4gICAgICAgIC8vIEFmdGVyIHRoYXQgYWRkIGZyZXNoIHRpbGVzIHRvIHRoZSBib2FyZCB1bnRpbCBhbGwgZW1wdHkgc3BhY2VzIGFyZVxyXG4gICAgICAgIC8vIGZpbGxlZCB1cCBhZ2FpbiAtIGxldCB0aGVzZSBkcm9wIGZyb20gdGhlIHRvcCBhcyB3ZWxsLlxyXG5cclxuICAgICAgICBsZXQgY29ubmVjdGVkVGlsZXMgPSB0aGlzLmdhdGhlckNvbm5lY3RlZFRpbGVzKGNsaWNrZWRPblRpbGUpO1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogZm9yIGRlYnVnZ2luZyBwdXJwb3NlcyBkaXNwbGF5IGEgb3ZlcmxheSBvciBcclxuICAgICAgICAvLyAgICAgICAgICAgIGRpZmZlcmVudCBib3JkZXIgY29sb3IgZm9yIGFsbCBjb25uZWN0ZWQgdGlsZXNcclxuICAgICAgICAvLyAgICAgICAgICAgIGFzIGEgd2hvbGUsIG5vdCBmb3IgZWFjaCBpbmRpdmlkdWFsIG9uZVxyXG4gICAgICAgIGNvbm5lY3RlZFRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgLy8gYW5pbWF0ZSB0byBjb2xsYXBzZSBvbnRvIGNsaWNrZWQgdGlsZVxyXG4gICAgICAgICAgICAvLyByZW1vdmUgdGlsZXMgYWZ0ZXIgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgIC8vIGNvdW50IGFuZCBhZGQgcG9pbnRzXHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGdhbWUgb3ZlclxyXG4gICAgICAgICAgICB0aWxlLmFuaW1hdGVDb2xsYXBzZVRvKGNsaWNrZWRPblRpbGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXkoKSB7XHJcbiAgICAgICAgdGhpcy5kcmF3KCk7XHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiByZW1vdmUgZGVzdHJveWVkIHRpbGVzIGFuZCBhZGQgbmV3IHRpbGVzIGZyb20gYWJvdmUgdGhlIGJvYXJkXHJcbiAgICAgICAgLy8gICAgICAgICAgICB3aXRoIGdyYXZpdHkgcHVsbGluZyB0aGVtIGRvd24gZXRjLlxyXG4gICAgICAgIC8vICAgICAgICAgICAgb25seSBsZXQgdGhlIHBsYXllciBjb250aW51ZSB0byBwbGF5IGFmdGVyIGFsbCBhbmltYXRpb25zIGFyZSBkb25lXHJcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnBsYXkuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGltcygpIHtcclxuICAgICAgICByZXR1cm4gW3BhcnNlSW50KHRoaXMuYm9hcmRFbGVtZW50LmNsaWVudFdpZHRoLCAxMCksIHBhcnNlSW50KHRoaXMuYm9hcmRFbGVtZW50LmNsaWVudEhlaWdodCwgMTApXTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiR2FtZTo6ZHJhd1wiKTtcclxuICAgICAgICB0aGlzLmRyYXdpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICAgICAgbGV0IFt3LCBoXSA9IHRoaXMuZ2V0RGltcygpO1xyXG5cclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogaW1wbGVtZW50IHRoaXMhXHJcbiAgICAgICAgLy8gaWYgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXJlIE5PVCBhIG11bHRpcGxlIG9mIGVpdGhlciBCT0FSRF9XSURUSCBvclxyXG4gICAgICAgIC8vIEJPQVJEX0hFSUdIVCB3ZSBuZWVkIHRvIHVzZSB0aGUgdmFsdWVzIHRoYXQgZml0IGFuZCBcIm1vdmVcIiB0aGUgdG9wIFxyXG4gICAgICAgIC8vIGFuZCBsZWZ0IG9mIHRoZSBib2FyZCBhIGJpdCBhbmQgaW50cm9kdWNlIGEgYmxhY2sgYm9yZGVyIHRoYXQgZmlsbHNcclxuICAgICAgICAvLyB1cCB0aGUgZXh0cmFub3VzIFwic3BhY2UhXHJcbiAgICAgICAgLy8gQWxzbywgbW92ZSB0aGUgYm9hcmQgYXJlYSB0byB0aGUgY2VudGVyIGlmIHRoZXJlIGlzIG1vcmUgY2FudmFzIHNwYWNlXHJcbiAgICAgICAgLy8gdGhhbiBuZWVkZWQgdG8gZGlzcGxheSB0aGUgYm9hcmQuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZHJhdyBpbmRpdmlkdWFsIHRpbGVzIC0gb25seSB0aGUgdHJhY2tlZCBvbmUgc2hvdWxkIGJlIGRyYXduIG92ZXJcclxuICAgICAgICAvLyBhbGwgb3RoZXIgdGlsZXMgbGFzdCwgYmVjYXVzZSBvdGhlcndpc2UgdGhlIGJvcmRlciBvdXRsaW5lIGlzXHJcbiAgICAgICAgLy8gb3ZlcmRyYXduIGJ5IG5laWdoYm91cmluZyB0aWxlc1xyXG4gICAgICAgIGxldCBkZWxheWVkRGlzcGxheSA9IFtdO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGlsZS50cmFja2VkKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxheWVkRGlzcGxheS5wdXNoKHRpbGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGlsZS5kcmF3KGN0eCwgdywgaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBkZWxheWVkRGlzcGxheS5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgIHRpbGUuZHJhdyhjdHgsIHcsIGgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXR1cm5zIHRoZSBuZWlnaGJvdXJpbmcgdGlsZXMgdGhhdCBoYXZlIHRoZSBzYW1lIG51bWJlciBhcyB0aGUgcHJvdmlkZWQgdGlsZVxyXG4gICAgZmluZE5laWdoYm91cnNGb3JUaWxlKHRpbGUpIHtcclxuICAgICAgICBsZXQgbmVpZ2hib3VycyA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgbGVmdCA9IHRpbGUuYyA+IDAgPyB0aGlzLmdldFRpbGVBdCh0aWxlLmMgLSAxLCB0aWxlLnIpIDogbnVsbDtcclxuICAgICAgICBsZXQgdG9wID0gdGlsZS5yID4gMCA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYywgdGlsZS5yIC0gMSkgOiBudWxsO1xyXG4gICAgICAgIGxldCByaWdodCA9IHRpbGUuYyA8IEJPQVJEX1dJRFRILTEgPyB0aGlzLmdldFRpbGVBdCh0aWxlLmMgKyAxLCB0aWxlLnIpIDogbnVsbDtcclxuICAgICAgICBsZXQgYm90dG9tID0gdGlsZS5yIDwgQk9BUkRfSEVJR0hULTEgPyB0aGlzLmdldFRpbGVBdCh0aWxlLmMsIHRpbGUuciArIDEpIDogbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKG51bGwgIT0gbGVmdCAmJiBsZWZ0Lm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaChsZWZ0KTtcclxuICAgICAgICBpZiAobnVsbCAhPSB0b3AgJiYgdG9wLm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaCh0b3ApO1xyXG4gICAgICAgIGlmIChudWxsICE9IHJpZ2h0ICYmIHJpZ2h0Lm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaChyaWdodCk7XHJcbiAgICAgICAgaWYgKG51bGwgIT0gYm90dG9tICYmIGJvdHRvbS5udW1iZXIgPT09IHRpbGUubnVtYmVyKSBuZWlnaGJvdXJzLnB1c2goYm90dG9tKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5laWdoYm91cnM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VGlsZUF0KGNvbHVtbiwgcm93KSB7XHJcbiAgICAgICAgbGV0IHRpbGUgPSB0aGlzLmJvYXJkLmZpbmQoKHQpID0+IHQuYyA9PT0gY29sdW1uICYmIHQuciA9PT0gcm93KTtcclxuICAgICAgICByZXR1cm4gISF0aWxlID8gdGlsZSA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRpbGVzIHRoYXQgc2hhcmUgdGhlIHNhbWUgbnVtYmVyIGFzIHRoZSBvbmUgcHJvdmlkZWRcclxuICAgIC8vIGFuZCB0aGF0IGFyZSBjb250aW5vdXNseSBjb25uZWN0ZWQgdGhyb3VnaG91dCBlYWNoIG90aGVyLlxyXG4gICAgLy8gSW1wb3J0YW50OiBib2FyZCBib3JkZXJzIGFyZSBjdXQgb2ZmIHBvaW50cyFcclxuICAgIGdhdGhlckNvbm5lY3RlZFRpbGVzKHRpbGUpIHtcclxuXHJcbiAgICAgICAgLy8gQSBsaXN0IG9mIGFycmF5IGluZGljZXMgdGhhdCBhcmUgY29ubmVjdGVkIHRvIHRoZSB0aWxlXHJcbiAgICAgICAgLy8gYW5kIGZ1cnRoZXJtb3JlIHRvIG90aGVyIHRpbGVzIHdpdGggdGhlIHNhbWUgdmFsdWUvbnVtYmVyLlxyXG4gICAgICAgIGxldCBjb25uZWN0ZWQgPSBbXTsgXHJcblxyXG4gICAgICAgIC8vIFNlYXJjaGVzIHRocm91Z2ggYWxsIG5laWdoYm91cnMgdG8gZmluZCBhbGwgY29ubmVjdGVkIHRpbGVzLlxyXG4gICAgICAgIGxldCBjcmF3bCA9IChyb290VGlsZSwgY3Jhd2xlZCwgaWdub3JlUm9vdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocm9vdFRpbGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcInJvb3RUaWxlIG5vdCBzZXRcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG51bSA9IHJvb3RUaWxlLm51bWJlcjtcclxuICAgICAgICAgICAgY3Jhd2xlZC5wdXNoKHJvb3RUaWxlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBuZWlnaGJvdXJzID0gdGhpcy5maW5kTmVpZ2hib3Vyc0ZvclRpbGUocm9vdFRpbGUpLFxyXG4gICAgICAgICAgICAgICAgY291bnRlZCA9IG5laWdoYm91cnMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudGVkOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gbmVpZ2hib3Vyc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICBpZHhPZiA9IGNyYXdsZWQuaW5kZXhPZih0KTtcclxuICAgICAgICAgICAgICAgIGlmIChpZHhPZiA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjcmF3bCh0LCBjcmF3bGVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgY3Jhd2wodGlsZSwgY29ubmVjdGVkLCB0cnVlKTtcclxuICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGhhdmUgb3VyIGluaXRpYWwgdGlsZSBpbiB0aGUgcmVzdWx0IHNldFxyXG4gICAgICAgIHJldHVybiBjb25uZWN0ZWQuZmlsdGVyKCh0KSA9PiAhKHQuciA9PT0gdGlsZS5yICYmIHQuYyA9PT0gdGlsZS5jKSk7XHJcbiAgICB9XHJcbiAgICBcclxufSAvLyBjbGFzcyBHYW1lXHJcbiIsIi8qXHJcbiAqICBVdGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuIFxyXG5sZXQgZ2V0UmFuZG9tSW50ID0gKG1pbiwgbWF4ID0gZmFsc2UpID0+IHtcclxuICAgIGlmIChtYXggPT09IGZhbHNlKSB7XHJcbiAgICAgICAgbWF4ID0gbWluO1xyXG4gICAgICAgIG1pbiA9IDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFyc2VJbnQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbiwgMTApO1xyXG59O1xyXG5cclxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTIwNDMyMjgvMTkzMTY1XHJcbmZ1bmN0aW9uIGlzRGFya0NvbG9yKGNvbG9yKSB7XHJcbiAgICB2YXIgYyA9IGNvbG9yLmxlbmd0aCA9PT0gNiA/IGNvbG9yIDogY29sb3Iuc3Vic3RyaW5nKDEpOyAvLyBzdHJpcCAjXHJcbiAgICB2YXIgcmdiID0gcGFyc2VJbnQoYywgMTYpOyAgIC8vIGNvbnZlcnQgcnJnZ2JiIHRvIGRlY2ltYWxcclxuICAgIHZhciByID0gKHJnYiA+PiAxNikgJiAweGZmOyAgLy8gZXh0cmFjdCByZWRcclxuICAgIHZhciBnID0gKHJnYiA+PiAgOCkgJiAweGZmOyAgLy8gZXh0cmFjdCBncmVlblxyXG4gICAgdmFyIGIgPSAocmdiID4+ICAwKSAmIDB4ZmY7ICAvLyBleHRyYWN0IGJsdWVcclxuXHJcbiAgICAvLyB1c2UgYSBzdGFuZGFyZCBmb3JtdWxhIHRvIGNvbnZlcnQgdGhlIHJlc3VsdGluZyBSR0IgdmFsdWVzIGludG8gdGhlaXIgcGVyY2VpdmVkIGJyaWdodG5lc3NcclxuICAgIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1JlYy5fNzA5I0x1bWFfY29lZmZpY2llbnRzXHJcbiAgICB2YXIgbHVtYSA9IDAuMjEyNiAqIHIgKyAwLjcxNTIgKiBnICsgMC4wNzIyICogYjsgLy8gcGVyIElUVS1SIEJULjcwOVxyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKFwibHVtYSBmb3IgY29sb3I6XCIsIGNvbG9yLCBsdW1hKTtcclxuXHJcbiAgICByZXR1cm4gbHVtYSA8IDgwOyAvLyB0b28gZGFyayBpZiBsdW1hIGlzIHNtYWxsZXIgdGhhbiBOXHJcbn1cclxuXHJcblxyXG5leHBvcnQgeyBnZXRSYW5kb21JbnQsIGlzRGFya0NvbG9yIH07XHJcbiJdfQ==
