(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
    ES6 code entry point
*/
"use strict";

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { "default": obj };
}

var _gameEs6 = require('./game.es6');

var _gameEs62 = _interopRequireDefault(_gameEs6);

var VERSION = "0.0.2";

console.log(VERSION);

var game = new _gameEs62["default"]();
game.play();

$("#buttonRestart").on("click", function (ev) {

	console.info("===> RESTART GAME");

	game = new _gameEs62["default"]();
	game.play();
});

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

var _slicedToArray = (function () {
    function sliceIterator(arr, i) {
        var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;_e = err;
        } finally {
            try {
                if (!_n && _i['return']) _i['return']();
            } finally {
                if (_d) throw _e;
            }
        }return _arr;
    }return function (arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError('Invalid attempt to destructure non-iterable instance');
        }
    };
})();

var _createClass = (function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
})();

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;
    } else {
        return Array.from(arr);
    }
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}

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

var MOVE_STEPS_IN_FRAMES = 20; // 30 or in 0.5 seconds, assuming 60 frames/sec

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

            if (this.moveTo) {
                // TODO(dkg): Check if we are already in the correct spot and
                //            if we are, just mark us as destroyed.

                // NOTE(dkg): animation idea - have the tiles shrink and disappear instead maybe?

                // TODO(dkg): figure out how to add velocity into the code below

                // stepsMoved is important, as we want to keep track how far
                // we are into the animation cycle for this move, even when the
                // user changes the size of the window and therefore the canvas dimensions
                var step = ++this.stepsMoved;

                var dr = this.r - this.moveTo.r;
                var dc = this.c - this.moveTo.c;
                var dsr = dr / MOVE_STEPS_IN_FRAMES;
                var dsc = dc / MOVE_STEPS_IN_FRAMES;

                // The -dsr and -dsc are here in order to have the tiles move onto the target one, not move
                // away from it.
                var stepsFractionRows = step * -dsr;
                var stepsFractionColumns = step * -dsc;
                var moveRowsInPixel = h * stepsFractionRows;
                var moveColsInPixel = w * stepsFractionColumns;
                var nl = l + moveColsInPixel;
                var nt = t + moveRowsInPixel;

                // this code is working
                // TODO(dkg): add check for "is the tile already on the position where it should be"
                l = nl;
                t = nt;
                if (step >= MOVE_STEPS_IN_FRAMES) {
                    var _moveTo$canvasCoordinates = this.moveTo.canvasCoordinates(sw, sh);

                    var _moveTo$canvasCoordinates2 = _slicedToArray(_moveTo$canvasCoordinates, 2);

                    l = _moveTo$canvasCoordinates2[0];
                    t = _moveTo$canvasCoordinates2[1];

                    this.destroy = true;
                    this.stepsMoved = 0;
                    this.moveTo = false;
                } else {
                    l = nl;
                    t = nt;
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

                if (tile.destroy) {
                    return;
                }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGtnL0RldmVsb3BtZW50L3ByaXZhdGUvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCIvVXNlcnMvZGtnL0RldmVsb3BtZW50L3ByaXZhdGUvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiL1VzZXJzL2RrZy9EZXZlbG9wbWVudC9wcml2YXRlL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNHQSxZQUFZLENBQUM7O0FBRWIsU0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7QUFBRSxRQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUFFOztBQUVqRyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUwsWUFBWSxDQUFBLENBQUE7O0FBRTdCLElBQUksU0FBUyxHQUFHLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQU5qRCxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUE7O0FBRXZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBSXJCLElBQUksSUFBSSxHQUFHLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFVLENBQUM7QUFDdEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUdaLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxFQUFFLEVBQUs7O0FBRXZDLFFBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFbEMsS0FBSSxHQUFHLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFVLENBQUM7QUFDbEIsS0FBSSxDQUFDLElBQUksRUFBRSxDQUFDO0NBRVosQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FDYkgsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRTtBQUN6QyxTQUFLLEVBQUUsSUFBSTtDQUNkLENBQUMsQ0FBQzs7QUFFSCxJQUFJLGNBQWMsR0FBRyxDQUFDLFlBQVk7QUFBRSxhQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFO0FBQUUsWUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLEFBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEFBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEFBQUMsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLEFBQUMsSUFBSTtBQUFFLGlCQUFLLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFBLENBQUUsSUFBSSxDQUFBLEFBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFO0FBQUUsb0JBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEFBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsTUFBTTthQUFFO1NBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUFFLGNBQUUsR0FBRyxJQUFJLENBQUMsQUFBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO1NBQUUsU0FBUztBQUFFLGdCQUFJO0FBQUUsb0JBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2FBQUUsU0FBUztBQUFFLG9CQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQzthQUFFO1NBQUUsQUFBQyxPQUFPLElBQUksQ0FBQztLQUFFLEFBQUMsT0FBTyxVQUFVLEdBQUcsRUFBRSxDQUFDLEVBQUU7QUFBRSxZQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVB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QU9yQixPQUFPLENBUGdCLFdBQVcsR0FBWCxXQUFXLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcclxuICAgIEVTNiBjb2RlIGVudHJ5IHBvaW50XHJcbiovXHJcbmNvbnN0IFZFUlNJT04gPSBcIjAuMC4yXCJcclxuXHJcbmNvbnNvbGUubG9nKFZFUlNJT04pO1xyXG5cclxuaW1wb3J0IEdhbWUgZnJvbSAnLi9nYW1lLmVzNic7XHJcblxyXG5sZXQgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbmdhbWUucGxheSgpO1xyXG5cclxuXHJcbiQoXCIjYnV0dG9uUmVzdGFydFwiKS5vbihcImNsaWNrXCIsIChldikgPT4ge1xyXG5cclxuXHRjb25zb2xlLmluZm8oXCI9PT0+IFJFU1RBUlQgR0FNRVwiKTtcclxuXHJcblx0Z2FtZSA9IG5ldyBHYW1lKCk7XHJcblx0Z2FtZS5wbGF5KCk7XHJcblxyXG59KTtcclxuXHJcbiIsIi8qXHJcbiAgICBUaGUgZ2FtZSBjb2RlIGFuZCBsb2dpYywgd2l0aCBVSSBoYW5kbGluZy5cclxuICAgIFRPRE8oZGtnKTogdXNlIHRoZSBmb2xsb3dpbmcgdGVjaG5pcXVlc1xyXG4gICAgICAgIC0gZ2VuZXJhdG9ycyBhbmQgeWllbGRcclxuICAgICAgICAtIFN5bWJvbHNcclxuKi9cclxuXHJcbmltcG9ydCB7IGdldFJhbmRvbUludCwgaXNEYXJrQ29sb3IgfSBmcm9tICcuL3V0aWxzLmVzNic7XHJcblxyXG4vLyB0aGVzZSBhcmUgbm90IGluIHBpeGVsLCBidXQgcmF0aGVyIG91ciBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiB1bml0c1xyXG4vLyB0aGlzIG1lYW5zIE4gPSBOIG51bWJlciBvZiBpdGVtcywgZS5nLiAxMCA9IDEwIGl0ZW1zLCBub3QgMTAgcGl4ZWxzXHJcbi8vIHRoZSBkcmF3KCkgY2FsbCB3aWxsIGNvbnZlcnQgdGhvc2UgaW50byBwcm9wZXIgcGl4ZWxzXHJcbmNvbnN0IEJPQVJEX1dJRFRIID0gMTA7XHJcbmNvbnN0IEJPQVJEX0hFSUdIVCA9IDEwO1xyXG5jb25zdCBCT0FSRF9USUxFU19DT1VOVCA9IEJPQVJEX1dJRFRIICogQk9BUkRfSEVJR0hUO1xyXG5cclxuY29uc3QgQ09MT1JTID0gKCgpID0+IHtcclxuICAgIC8vIFRPRE8oZGtnKTogZWxpbWluYXRlIGNvbG9ycyB0aGF0IGFyZSB0b28gY2xvc2UgdG8gZWFjaCBvdGhlciBhbmQvb3IgZHVwbGljYXRlc1xyXG4gICAgbGV0IGlubmVyID0gKCkgPT4ge1xyXG4gICAgICAgIGxldCByZ2IgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdiA9IChwYXJzZUludChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTUpLCAxMCkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICAgICAgaWYgKHYubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgIHYgPSBgMCR7dn1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJnYi5wdXNoKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByZXR1cm4gJ3JnYignKyByZ2Iuam9pbignLCcpICsnKSc7XHJcbiAgICAgICAgcmV0dXJuICcjJyArIHJnYi5qb2luKFwiXCIpO1xyXG4gICAgfVxyXG4gICAgbGV0IHJldCA9IFtdO1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCAxMDAwOyB4KyspIHtcclxuICAgICAgICByZXQucHVzaChpbm5lcigpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbn0pKCk7XHJcblxyXG5sZXQgX3JuZENvbG9yID0gMDtcclxubGV0IGdldENvbG9yID0gKGlkeCA9IC0xKSA9PiB7XHJcbiAgICBpZiAoX3JuZENvbG9yID49IENPTE9SUy5sZW5ndGgpXHJcbiAgICAgICAgX3JuZENvbG9yID0gMDtcclxuICAgIGlmIChpZHggPiAtMSAmJiBpZHggPCBDT0xPUlMubGVuZ3RoKVxyXG4gICAgICAgIHJldHVybiBDT0xPUlNbaWR4XTtcclxuICAgIHJldHVybiBDT0xPUlNbX3JuZENvbG9yKytdO1xyXG59O1xyXG5cclxuY29uc3QgTUFHSUNfQ09MT1JTID0gKCgpID0+IHtcclxuICAgIGxldCByZXQgPSBbXTtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgNTA7IHgrKykge1xyXG4gICAgICAgIHJldC5wdXNoKGdldENvbG9yKHgpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbn0pKCk7XHJcbmNvbnN0IE1BR0lDX0NPTE9SU19SRVZFUlNFID0gKCgpID0+IHtcclxuICAgIHJldHVybiBbLi4uTUFHSUNfQ09MT1JTXS5yZXZlcnNlKCk7XHJcbn0pKCk7XHJcblxyXG5jb25zdCBNT1ZFX1NURVBTX0lOX0ZSQU1FUyA9IDIwOyAgLy8gMzAgb3IgaW4gMC41IHNlY29uZHMsIGFzc3VtaW5nIDYwIGZyYW1lcy9zZWNcclxuXHJcbi8vIGNvbnNvbGUubG9nKE1BR0lDX0NPTE9SUyk7XHJcblxyXG5jbGFzcyBUaWxlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih7IG51bWJlciA9IDAsIGMgPSAwLCByID0gMCB9ID0ge30pIHtcclxuICAgICAgICB0aGlzLm51bWJlciA9IG51bWJlciB8fCBnZXRSYW5kb21JbnQoMSwgMyk7XHJcbiAgICAgICAgLy8gaW4gY29sL3JvdyBjb29yZGluYXRlcywgdGhhdCBpcyBpbiBvdXIgb3duIGludGVybmFsIHVuaXRzXHJcbiAgICAgICAgdGhpcy5jID0gYztcclxuICAgICAgICB0aGlzLnIgPSByO1xyXG4gICAgICAgIHRoaXMubW92ZVRvID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UG9zaXRpb24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gNDsgLy8gcmFuZG9tIG51bWJlciwgaGlkZGVuIHhrY2QgcmVmZXJlbmNlXHJcbiAgICAgICAgdGhpcy5zdGVwc01vdmVkID0gMDtcclxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnRyYWNrZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYWxsZWQgb25jZSBwZXIgZnJhbWUgLSBvbmx5IG9uY2UgcGVyIGZyYW1lIVxyXG4gICAgZHJhdyhjdHgsIHN3LCBzaCkge1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogcmFuZG9taXplIGNvbG9yIGFjY29yZGluZyB0byB0aGlzLm51bWJlclxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogaW1wbGVtZW50IHRpbGUgZGVzdHJ1Y3Rpb24gYW5kIGFkZGluZyBuZXcgdGlsZXMgZnJvbSBhYm92ZVxyXG4gICAgICAgIC8vICAgICAgICAgICAgV291bGQgYmUgY29vbCBpZiB0aGUgdGlsZSB3b3VsZCBleHBsb2RlIGluIGh1Z2UgZXhwbG9zaW9uXHJcbiAgICAgICAgLy8gICAgICAgICAgICBidXQgb25seSBpZiB0aGUgbnVtYmVyIGlzIDkgYW5kIGl0IHdvdWxkIGJlY29tZSBhIDEwLlxyXG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3kgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IFt3LCBoXSA9IHRoaXMudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICAvLyB0aGVzZSBhcmUgdGhlIG9yaWdpbmFsIHBpeGVsIGNvb3JkcyAtIHRoZXkgbmVlZCB0byBiZSBhZGp1c3RlZFxyXG4gICAgICAgIC8vIHdoZW4gd2UgaGF2ZSB0byBjb2xsYXBzZVxyXG4gICAgICAgIGxldCBbbCwgdF0gPSB0aGlzLmNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubW92ZVRvKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE8oZGtnKTogQ2hlY2sgaWYgd2UgYXJlIGFscmVhZHkgaW4gdGhlIGNvcnJlY3Qgc3BvdCBhbmRcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICBpZiB3ZSBhcmUsIGp1c3QgbWFyayB1cyBhcyBkZXN0cm95ZWQuXHJcblxyXG4gICAgICAgICAgICAvLyBOT1RFKGRrZyk6IGFuaW1hdGlvbiBpZGVhIC0gaGF2ZSB0aGUgdGlsZXMgc2hyaW5rIGFuZCBkaXNhcHBlYXIgaW5zdGVhZCBtYXliZT9cclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE8oZGtnKTogZmlndXJlIG91dCBob3cgdG8gYWRkIHZlbG9jaXR5IGludG8gdGhlIGNvZGUgYmVsb3dcclxuXHJcbiAgICAgICAgICAgIC8vIHN0ZXBzTW92ZWQgaXMgaW1wb3J0YW50LCBhcyB3ZSB3YW50IHRvIGtlZXAgdHJhY2sgaG93IGZhclxyXG4gICAgICAgICAgICAvLyB3ZSBhcmUgaW50byB0aGUgYW5pbWF0aW9uIGN5Y2xlIGZvciB0aGlzIG1vdmUsIGV2ZW4gd2hlbiB0aGUgXHJcbiAgICAgICAgICAgIC8vIHVzZXIgY2hhbmdlcyB0aGUgc2l6ZSBvZiB0aGUgd2luZG93IGFuZCB0aGVyZWZvcmUgdGhlIGNhbnZhcyBkaW1lbnNpb25zXHJcbiAgICAgICAgICAgIGxldCBzdGVwID0gKyt0aGlzLnN0ZXBzTW92ZWQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgW2RyLCBkY10gPSBbdGhpcy5yIC0gdGhpcy5tb3ZlVG8uciwgdGhpcy5jIC0gdGhpcy5tb3ZlVG8uY107XHJcbiAgICAgICAgICAgIGxldCBbZHNyLCBkc2NdID0gW2RyIC8gTU9WRV9TVEVQU19JTl9GUkFNRVMsIGRjIC8gTU9WRV9TVEVQU19JTl9GUkFNRVNdO1xyXG4gICAgICAgICAgICAvLyBUaGUgLWRzciBhbmQgLWRzYyBhcmUgaGVyZSBpbiBvcmRlciB0byBoYXZlIHRoZSB0aWxlcyBtb3ZlIG9udG8gdGhlIHRhcmdldCBvbmUsIG5vdCBtb3ZlXHJcbiAgICAgICAgICAgIC8vIGF3YXkgZnJvbSBpdC5cclxuICAgICAgICAgICAgbGV0IFtzdGVwc0ZyYWN0aW9uUm93cywgc3RlcHNGcmFjdGlvbkNvbHVtbnNdID0gWyBzdGVwICogLWRzciwgc3RlcCAqIC1kc2MgXTsgXHJcbiAgICAgICAgICAgIGxldCBbbW92ZVJvd3NJblBpeGVsLCBtb3ZlQ29sc0luUGl4ZWxdID0gW2ggKiBzdGVwc0ZyYWN0aW9uUm93cywgdyAqIHN0ZXBzRnJhY3Rpb25Db2x1bW5zXTtcclxuICAgICAgICAgICAgbGV0IFtubCwgbnRdID0gW2wgKyBtb3ZlQ29sc0luUGl4ZWwsIHQgKyBtb3ZlUm93c0luUGl4ZWxdO1xyXG5cclxuICAgICAgICAgICAgW2wsIHRdID0gW25sLCBudF07XHJcblxyXG4gICAgICAgICAgICAvLyB0aGlzIGNvZGUgaXMgd29ya2luZ1xyXG4gICAgICAgICAgICAvLyBUT0RPKGRrZyk6IGFkZCBjaGVjayBmb3IgXCJpcyB0aGUgdGlsZSBhbHJlYWR5IG9uIHRoZSBwb3NpdGlvbiB3aGVyZSBpdCBzaG91bGQgYmVcIlxyXG4gICAgICAgICAgICBpZiAoc3RlcCA+PSBNT1ZFX1NURVBTX0lOX0ZSQU1FUykge1xyXG5cclxuICAgICAgICAgICAgICAgIFtsLCB0XSA9IHRoaXMubW92ZVRvLmNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RlcHNNb3ZlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVUbyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIFtsLCB0XSA9IFtubCwgbnRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgbGV0IGZpbGxDb2xvciA9IE1BR0lDX0NPTE9SU1t0aGlzLm51bWJlci0xXTtcclxuICAgICAgICBsZXQgYW50aUNvbG9yID0gaXNEYXJrQ29sb3IoZmlsbENvbG9yKSA/IFwibGlnaHRncmF5XCIgOiBcImJsYWNrXCI7XHJcblxyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAxO1xyXG4gICAgICAgIC8vIGN0eC5maWxsU3R5bGUgPSAodGhpcy5jICsgdGhpcy5yKSAlIDIgIT0gMCA/IFwiI0ZGNDUwMFwiIDogXCIjRkZBNTAwXCI7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvcjtcclxuICAgICAgICBjdHguZmlsbFJlY3QobCwgdCwgdywgaCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRyYWNrZWQpIHtcclxuICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDQ7XHJcbiAgICAgICAgICAgIC8vIGN0eC5zdHJva2VTdHlsZSA9IE1BR0lDX0NPTE9SU19SRVZFUlNFW3RoaXMubnVtYmVyLTFdO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBhbnRpQ29sb3I7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VSZWN0KGwsIHQsIHcsIGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gd3JpdGUgdGhlIG51bWJlciBpbiB0aGUgY2VudGVyIG9mIHRoZSB0aWxlXHJcbiAgICAgICAgbGV0IFt4LCB5XSA9IFtcclxuICAgICAgICAgICAgbCArIE1hdGguY2VpbCh3IC8gMi4wKSwgXHJcbiAgICAgICAgICAgIHQgKyBNYXRoLmNlaWwoaCAvIDIuMClcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICAvLyBjdHguZmlsbFN0eWxlID0gTUFHSUNfQ09MT1JTX1JFVkVSU0VbdGhpcy5udW1iZXJdO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBhbnRpQ29sb3I7XHJcbiAgICAgICAgY3R4LmZvbnQgPSBcIjMycHggY291cmllclwiO1xyXG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLm51bWJlciwgeCwgeSk7XHJcbiAgICB9XHJcblxyXG4gICAgYW5pbWF0ZUNvbGxhcHNlVG8odGFyZ2V0VGlsZSkge1xyXG4gICAgICAgIHRoaXMubW92ZVRvID0gdGFyZ2V0VGlsZTtcclxuICAgICAgICB0aGlzLnN0ZXBzTW92ZWQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCkge1xyXG4gICAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudCB0aWxlIHBvc2l0aW9uIGluIHBpeGVsXHJcbiAgICAgICAgbGV0IFt0dywgdGhdID0gdGhpcy50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGNhbGMgdGhlIHRvcCBhbmQgbGVmdCBjb29yZGluYXRlcyBpbiBwaXhlbCAodG9wLWxlZnQgaXMgMCwgMCBpbiBvdXIgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICAgICAgICAvLyBhbmQgYm90dG9tLXJpZ2h0IGlzIG91ciBzY3JlZW5faGVpZ2h0LXNjcmVlbl93aWR0aClcclxuICAgICAgICAvLyB0aGlzIGRlcGVuZHMgb24gdGhlIHRpbGVzIHBvc2l0aW9uIChpbiBjb2wvcm93IGNvb3JkcylcclxuICAgICAgICAvLyBJbiBjYXNlIHdlIGFyZSBtb3ZpbmcvY29sbGFwc2luZyBvbnRvIGFub3RoZXIgdGlsZSwgd2Ugd2lsbCBuZWVkXHJcbiAgICAgICAgLy8gdG8gbW92ZSBvbmNlIHBlciBmcmFtZSBpbnRvIGEgY2VydGFpbiBkaXJlY3Rpb24uXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IFtsLCB0XSA9IFtcclxuICAgICAgICAgICAgdGhpcy5jICogdHcsXHJcbiAgICAgICAgICAgIHRoaXMuciAqIHRoXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtsLCB0XTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGlsZURpbWVuc2lvbnMoc3csIHNoKSB7XHJcbiAgICAgICAgLy8gY2FsYyB0aWxlIHdpZHRoIGFuZCBoZWlnaHQgaW4gcGl4ZWxzIGZvciBvbmUgdGlsZVxyXG4gICAgICAgIC8vIERFUEVORElORyBvbiB0aGUgY3VycmVudCBzY3JlZW4gb3IgYm9hcmQgZGltZW5zaW9uIVxyXG4gICAgICAgIC8vIHN3OiBzY3JlZW4gb3IgYm9hcmQgd2lkdGggaW4gcGl4ZWxcclxuICAgICAgICAvLyBzaDogc2NyZWVuIG9yIGJvYXJkIGhlaWdodCBpbiBwaXhlbFxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBbdHcsIHRoXSA9IFtNYXRoLmNlaWwoc3cgLyBCT0FSRF9XSURUSCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY2VpbChzaCAvIEJPQVJEX0hFSUdIVCldO1xyXG4gICAgICAgIHJldHVybiBbdHcsIHRoXTtcclxuICAgIH1cclxufSAvLyBjbGFzcyBUaWxlXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAgICAgbGV0IHRpbGVzID0gKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRpbGVzID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvdW50ZXIgPSAwOyBjb3VudGVyIDwgQk9BUkRfVElMRVNfQ09VTlQ7IGNvdW50ZXIrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gbGV0IFtjb2x1bW5zLCByb3dzXSA9IFtcclxuICAgICAgICAgICAgICAgICAgICAvLyBwYXJzZUZsb2F0KEJPQVJEX1RJTEVTX0NPVU5UIC8gQk9BUkRfV0lEVEgpLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBhcnNlRmxvYXQoQk9BUkRfVElMRVNfQ09VTlQgLyBCT0FSRF9IRUlHSFQpXHJcbiAgICAgICAgICAgICAgICAvLyBdO1xyXG4gICAgICAgICAgICAgICAgbGV0IFtjb2x1bW4sIHJvd10gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoY291bnRlciAlIEJPQVJEX1dJRFRILCAxMCksICAgICAgICAgICAgICAvLyBwb3NpdGlvbiBpbiBjb2x1bW5cclxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChNYXRoLmZsb29yKGNvdW50ZXIgLyBCT0FSRF9IRUlHSFQpLCAxMCksIC8vIHBvc2l0aW9uIGluIHJvd1xyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGlsZSA9IG5ldyBUaWxlKHsgbnVtYmVyOiBnZXRSYW5kb21JbnQoMSwgMyksIGM6IGNvbHVtbiwgcjogcm93IH0pO1xyXG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaCh0aWxlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGlsZXM7XHJcbiAgICAgICAgfSkoKTtcclxuICAgICAgICB0aGlzLmJvYXJkID0gdGlsZXM7XHJcbiAgICBcclxuICAgICAgICBsZXQgYm9hcmRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZFwiKTtcclxuICAgICAgICBsZXQgY29udGV4dCA9IGJvYXJkRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4ID0gY29udGV4dDtcclxuICAgICAgICB0aGlzLmJvYXJkRWxlbWVudCA9IGJvYXJkRWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCByZXNpemUgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IFt3dywgd2hdID0gWyQod2luZG93KS53aWR0aCgpLCAkKHdpbmRvdykuaGVpZ2h0KCldO1xyXG4gICAgICAgICAgICBsZXQgbWFyZ2luID0gMjAwO1xyXG4gICAgICAgICAgICBsZXQgJGJvYXJkID0gJChcIiNib2FyZFwiKTtcclxuICAgICAgICAgICAgJGJvYXJkLmhlaWdodChgJHt3aC1tYXJnaW59cHhgKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHdoLW1hcmdpbjtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gJGJvYXJkLndpZHRoKCk7IC8vIHRoaXMgc2hvdWxkIHRha2UgbWFyZ2lucyBhbmQgQ1NTIGludG8gYWNjb3VudFxyXG4gICAgICAgICAgICAvLyB0aGlzLmRyYXcoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCByZXNpemUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBnZXRNb3VzZUNvb3JkaW5hdGVzID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBldmVudCA9IGV2IHx8IHdpbmRvdy5ldmVudDsgLy8gSUUtaXNtXHJcbiAgICAgICAgICAgIC8vIElmIHBhZ2VYL1kgYXJlbid0IGF2YWlsYWJsZSBhbmQgY2xpZW50WC9ZIGFyZSxcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHBhZ2VYL1kgLSBsb2dpYyB0YWtlbiBmcm9tIGpRdWVyeS5cclxuICAgICAgICAgICAgLy8gKFRoaXMgaXMgdG8gc3VwcG9ydCBvbGQgSUUpXHJcbiAgICAgICAgICAgIGlmIChldmVudC5wYWdlWCA9PSBudWxsICYmIGV2ZW50LmNsaWVudFggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50RG9jID0gKGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQub3duZXJEb2N1bWVudCkgfHwgZG9jdW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jID0gZXZlbnREb2MuZG9jdW1lbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBldmVudERvYy5ib2R5O1xyXG5cclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhZ2VYID0gZXZlbnQuY2xpZW50WCArXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLnNjcm9sbExlZnQgfHwgYm9keSAmJiBib2R5LnNjcm9sbExlZnQgfHwgMCkgLVxyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5jbGllbnRMZWZ0IHx8IGJvZHkgJiYgYm9keS5jbGllbnRMZWZ0IHx8IDApO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFnZVkgPSBldmVudC5jbGllbnRZICtcclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2Muc2Nyb2xsVG9wICB8fCBib2R5ICYmIGJvZHkuc2Nyb2xsVG9wICB8fCAwKSAtXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLmNsaWVudFRvcCAgfHwgYm9keSAmJiBib2R5LmNsaWVudFRvcCAgfHwgMCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgcGFyZW50T2Zmc2V0ID0gJChldmVudC50YXJnZXQpLnBhcmVudCgpLm9mZnNldCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgeDogZXZlbnQucGFnZVggLSBwYXJlbnRPZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgIHk6IGV2ZW50LnBhZ2VZIC0gcGFyZW50T2Zmc2V0LnRvcFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJtb3VzZSBtb3ZlZFwiLCBtb3VzZVBvcy54LCBtb3VzZVBvcy55KTtcclxuICAgICAgICAgICAgcmV0dXJuIG1vdXNlUG9zO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBtb3VzZVRyYWNrZXIgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0gZ2V0TW91c2VDb29yZGluYXRlcyhldiksXHJcbiAgICAgICAgICAgICAgICBkaW1zID0gdGhpcy5nZXREaW1zKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRpbGUudHJhY2tlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aWxlLmRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1vdXNlUG9zIGlzIGluIHBpeGVsIGNvb3Jkc1xyXG4gICAgICAgICAgICAgICAgbGV0IFtzdywgc2hdID0gZGltcztcclxuICAgICAgICAgICAgICAgIGxldCBbdHcsIHRoXSA9IHRpbGUudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICAgICAgICAgIGxldCBbdGwsIHR0XSA9IHRpbGUuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobW91c2VQb3MueCA+PSB0bCAmJiBtb3VzZVBvcy54IDw9ICh0bCArIHR3KSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlUG9zLnkgPj0gdHQgJiYgbW91c2VQb3MueSA8PSAodHQgKyB0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aWxlLnRyYWNrZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAkKFwiI2JvYXJkXCIpLm9uKFwibW91c2Vtb3ZlXCIsIG1vdXNlVHJhY2tlcik7XHJcblxyXG4gICAgICAgIGxldCBtb3VzZUNsaWNrID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiAodGhpcy5kcmF3aW5nICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIklnbm9yZWQgbW91c2UgY2xpY2sgYmVjYXVzZSBJIHdhcyBkcmF3aW5nLlwiKTtcclxuICAgICAgICAgICAgICAgIC8vIHJldHVybjtcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0gZ2V0TW91c2VDb29yZGluYXRlcyhldiksXHJcbiAgICAgICAgICAgICAgICBkaW1zID0gdGhpcy5nZXREaW1zKCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBoZXJlXCIsIG1vdXNlUG9zKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjbGlja2VkT25UaWxlcyA9IHRoaXMuYm9hcmQuZmlsdGVyKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGlsZS50cmFja2VkOyAvLyB3ZSBhcmUgY2hlYXRpbmcgaGVyZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlVGlsZUNsaWNrZWQoY2xpY2tlZE9uVGlsZXMubGVuZ3RoID4gMCA/IGNsaWNrZWRPblRpbGVzWzBdIDogbnVsbCk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgJChcIiNib2FyZFwiKS5vbihcImNsaWNrXCIsIG1vdXNlQ2xpY2spO1xyXG5cclxuICAgICAgICByZXNpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVUaWxlQ2xpY2tlZChjbGlja2VkT25UaWxlKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJoYW5kbGVUaWxlQ2xpY2tlZFwiLCBjbGlja2VkT25UaWxlKTtcclxuICAgICAgICBpZiAobnVsbCA9PT0gY2xpY2tlZE9uVGlsZSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBUT0RPKGRrZyk6IGNoZWNrIGlmIHRpbGUgaGFzIG5laWdoYm91cnMgd2l0aCB0aGUgc2FtZSBudW1iZXJcclxuICAgICAgICAvLyBpZiB5ZXMsIGluY3JlYXNlIGN1cnJlbnQgdGlsZSdzIG51bWJlciBhbmQgY29sbGFwc2UgYWxsIGNvbm5lY3RlZFxyXG4gICAgICAgIC8vIG5laWdoYm91cnMgd2l0aCB0aGUgc2FtZSBudW1iZXIgb250byB0aGUgdGlsZSAoYW5pbWF0ZSB0aGlzIGFzIHdlbGwpLlxyXG4gICAgICAgIC8vIFRoZW4gbGV0IGdyYXZpdHkgZHJvcCBkb3duIGFsbCB0aWxlcyB0aGF0IGFyZSBoYW5naW5nIGluIHRoZSBhaXIuXHJcbiAgICAgICAgLy8gQWZ0ZXIgdGhhdCBhZGQgZnJlc2ggdGlsZXMgdG8gdGhlIGJvYXJkIHVudGlsIGFsbCBlbXB0eSBzcGFjZXMgYXJlXHJcbiAgICAgICAgLy8gZmlsbGVkIHVwIGFnYWluIC0gbGV0IHRoZXNlIGRyb3AgZnJvbSB0aGUgdG9wIGFzIHdlbGwuXHJcblxyXG4gICAgICAgIGxldCBjb25uZWN0ZWRUaWxlcyA9IHRoaXMuZ2F0aGVyQ29ubmVjdGVkVGlsZXMoY2xpY2tlZE9uVGlsZSk7XHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBmb3IgZGVidWdnaW5nIHB1cnBvc2VzIGRpc3BsYXkgYSBvdmVybGF5IG9yIFxyXG4gICAgICAgIC8vICAgICAgICAgICAgZGlmZmVyZW50IGJvcmRlciBjb2xvciBmb3IgYWxsIGNvbm5lY3RlZCB0aWxlc1xyXG4gICAgICAgIC8vICAgICAgICAgICAgYXMgYSB3aG9sZSwgbm90IGZvciBlYWNoIGluZGl2aWR1YWwgb25lXHJcbiAgICAgICAgY29ubmVjdGVkVGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBhbmltYXRlIHRvIGNvbGxhcHNlIG9udG8gY2xpY2tlZCB0aWxlXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aWxlcyBhZnRlciBhbmltYXRpb25cclxuICAgICAgICAgICAgLy8gY291bnQgYW5kIGFkZCBwb2ludHNcclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgZ2FtZSBvdmVyXHJcbiAgICAgICAgICAgIHRpbGUuYW5pbWF0ZUNvbGxhcHNlVG8oY2xpY2tlZE9uVGlsZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcGxheSgpIHtcclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuICAgICAgICAvLyBUT0RPKGRrZyk6IHJlbW92ZSBkZXN0cm95ZWQgdGlsZXMgYW5kIGFkZCBuZXcgdGlsZXMgZnJvbSBhYm92ZSB0aGUgYm9hcmRcclxuICAgICAgICAvLyAgICAgICAgICAgIHdpdGggZ3Jhdml0eSBwdWxsaW5nIHRoZW0gZG93biBldGMuXHJcbiAgICAgICAgLy8gICAgICAgICAgICBvbmx5IGxldCB0aGUgcGxheWVyIGNvbnRpbnVlIHRvIHBsYXkgYWZ0ZXIgYWxsIGFuaW1hdGlvbnMgYXJlIGRvbmVcclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucGxheS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXREaW1zKCkge1xyXG4gICAgICAgIHJldHVybiBbcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50V2lkdGgsIDEwKSwgcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50SGVpZ2h0LCAxMCldO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJHYW1lOjpkcmF3XCIpO1xyXG4gICAgICAgIHRoaXMuZHJhd2luZyA9IHRydWU7XHJcblxyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLmN0eDtcclxuICAgICAgICBsZXQgW3csIGhdID0gdGhpcy5nZXREaW1zKCk7XHJcblxyXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdywgaCk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgdywgaCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBpbXBsZW1lbnQgdGhpcyFcclxuICAgICAgICAvLyBpZiB0aGUgd2lkdGggYW5kIGhlaWdodCBhcmUgTk9UIGEgbXVsdGlwbGUgb2YgZWl0aGVyIEJPQVJEX1dJRFRIIG9yXHJcbiAgICAgICAgLy8gQk9BUkRfSEVJR0hUIHdlIG5lZWQgdG8gdXNlIHRoZSB2YWx1ZXMgdGhhdCBmaXQgYW5kIFwibW92ZVwiIHRoZSB0b3AgXHJcbiAgICAgICAgLy8gYW5kIGxlZnQgb2YgdGhlIGJvYXJkIGEgYml0IGFuZCBpbnRyb2R1Y2UgYSBibGFjayBib3JkZXIgdGhhdCBmaWxsc1xyXG4gICAgICAgIC8vIHVwIHRoZSBleHRyYW5vdXMgXCJzcGFjZSFcclxuICAgICAgICAvLyBBbHNvLCBtb3ZlIHRoZSBib2FyZCBhcmVhIHRvIHRoZSBjZW50ZXIgaWYgdGhlcmUgaXMgbW9yZSBjYW52YXMgc3BhY2VcclxuICAgICAgICAvLyB0aGFuIG5lZWRlZCB0byBkaXNwbGF5IHRoZSBib2FyZC5cclxuICAgICAgICBcclxuICAgICAgICAvLyBkcmF3IGluZGl2aWR1YWwgdGlsZXMgLSBvbmx5IHRoZSB0cmFja2VkIG9uZSBzaG91bGQgYmUgZHJhd24gb3ZlclxyXG4gICAgICAgIC8vIGFsbCBvdGhlciB0aWxlcyBsYXN0LCBiZWNhdXNlIG90aGVyd2lzZSB0aGUgYm9yZGVyIG91dGxpbmUgaXNcclxuICAgICAgICAvLyBvdmVyZHJhd24gYnkgbmVpZ2hib3VyaW5nIHRpbGVzXHJcbiAgICAgICAgbGV0IGRlbGF5ZWREaXNwbGF5ID0gW107XHJcbiAgICAgICAgdGhpcy5ib2FyZC5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aWxlLnRyYWNrZWQpIHtcclxuICAgICAgICAgICAgICAgIGRlbGF5ZWREaXNwbGF5LnB1c2godGlsZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlLmRyYXcoY3R4LCB3LCBoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGRlbGF5ZWREaXNwbGF5LmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgdGlsZS5kcmF3KGN0eCwgdywgaCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd2luZyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJldHVybnMgdGhlIG5laWdoYm91cmluZyB0aWxlcyB0aGF0IGhhdmUgdGhlIHNhbWUgbnVtYmVyIGFzIHRoZSBwcm92aWRlZCB0aWxlXHJcbiAgICBmaW5kTmVpZ2hib3Vyc0ZvclRpbGUodGlsZSkge1xyXG4gICAgICAgIGxldCBuZWlnaGJvdXJzID0gW107XHJcblxyXG4gICAgICAgIGxldCBsZWZ0ID0gdGlsZS5jID4gMCA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYyAtIDEsIHRpbGUucikgOiBudWxsO1xyXG4gICAgICAgIGxldCB0b3AgPSB0aWxlLnIgPiAwID8gdGhpcy5nZXRUaWxlQXQodGlsZS5jLCB0aWxlLnIgLSAxKSA6IG51bGw7XHJcbiAgICAgICAgbGV0IHJpZ2h0ID0gdGlsZS5jIDwgQk9BUkRfV0lEVEgtMSA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYyArIDEsIHRpbGUucikgOiBudWxsO1xyXG4gICAgICAgIGxldCBib3R0b20gPSB0aWxlLnIgPCBCT0FSRF9IRUlHSFQtMSA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYywgdGlsZS5yICsgMSkgOiBudWxsO1xyXG5cclxuICAgICAgICBpZiAobnVsbCAhPSBsZWZ0ICYmIGxlZnQubnVtYmVyID09PSB0aWxlLm51bWJlcikgbmVpZ2hib3Vycy5wdXNoKGxlZnQpO1xyXG4gICAgICAgIGlmIChudWxsICE9IHRvcCAmJiB0b3AubnVtYmVyID09PSB0aWxlLm51bWJlcikgbmVpZ2hib3Vycy5wdXNoKHRvcCk7XHJcbiAgICAgICAgaWYgKG51bGwgIT0gcmlnaHQgJiYgcmlnaHQubnVtYmVyID09PSB0aWxlLm51bWJlcikgbmVpZ2hib3Vycy5wdXNoKHJpZ2h0KTtcclxuICAgICAgICBpZiAobnVsbCAhPSBib3R0b20gJiYgYm90dG9tLm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaChib3R0b20pO1xyXG5cclxuICAgICAgICByZXR1cm4gbmVpZ2hib3VycztcclxuICAgIH1cclxuXHJcbiAgICBnZXRUaWxlQXQoY29sdW1uLCByb3cpIHtcclxuICAgICAgICBsZXQgdGlsZSA9IHRoaXMuYm9hcmQuZmluZCgodCkgPT4gdC5jID09PSBjb2x1bW4gJiYgdC5yID09PSByb3cpO1xyXG4gICAgICAgIHJldHVybiAhIXRpbGUgPyB0aWxlIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGlsZXMgdGhhdCBzaGFyZSB0aGUgc2FtZSBudW1iZXIgYXMgdGhlIG9uZSBwcm92aWRlZFxyXG4gICAgLy8gYW5kIHRoYXQgYXJlIGNvbnRpbm91c2x5IGNvbm5lY3RlZCB0aHJvdWdob3V0IGVhY2ggb3RoZXIuXHJcbiAgICAvLyBJbXBvcnRhbnQ6IGJvYXJkIGJvcmRlcnMgYXJlIGN1dCBvZmYgcG9pbnRzIVxyXG4gICAgZ2F0aGVyQ29ubmVjdGVkVGlsZXModGlsZSkge1xyXG5cclxuICAgICAgICAvLyBBIGxpc3Qgb2YgYXJyYXkgaW5kaWNlcyB0aGF0IGFyZSBjb25uZWN0ZWQgdG8gdGhlIHRpbGVcclxuICAgICAgICAvLyBhbmQgZnVydGhlcm1vcmUgdG8gb3RoZXIgdGlsZXMgd2l0aCB0aGUgc2FtZSB2YWx1ZS9udW1iZXIuXHJcbiAgICAgICAgbGV0IGNvbm5lY3RlZCA9IFtdOyBcclxuXHJcbiAgICAgICAgLy8gU2VhcmNoZXMgdGhyb3VnaCBhbGwgbmVpZ2hib3VycyB0byBmaW5kIGFsbCBjb25uZWN0ZWQgdGlsZXMuXHJcbiAgICAgICAgbGV0IGNyYXdsID0gKHJvb3RUaWxlLCBjcmF3bGVkLCBpZ25vcmVSb290KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyb290VGlsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwicm9vdFRpbGUgbm90IHNldFwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbnVtID0gcm9vdFRpbGUubnVtYmVyO1xyXG4gICAgICAgICAgICBjcmF3bGVkLnB1c2gocm9vdFRpbGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5laWdoYm91cnMgPSB0aGlzLmZpbmROZWlnaGJvdXJzRm9yVGlsZShyb290VGlsZSksXHJcbiAgICAgICAgICAgICAgICBjb3VudGVkID0gbmVpZ2hib3Vycy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50ZWQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSBuZWlnaGJvdXJzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkeE9mID0gY3Jhd2xlZC5pbmRleE9mKHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkeE9mID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNyYXdsKHQsIGNyYXdsZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICBjcmF3bCh0aWxlLCBjb25uZWN0ZWQsIHRydWUpO1xyXG4gICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gaGF2ZSBvdXIgaW5pdGlhbCB0aWxlIGluIHRoZSByZXN1bHQgc2V0XHJcbiAgICAgICAgcmV0dXJuIGNvbm5lY3RlZC5maWx0ZXIoKHQpID0+ICEodC5yID09PSB0aWxlLnIgJiYgdC5jID09PSB0aWxlLmMpKTtcclxuICAgIH1cclxuICAgIFxyXG59IC8vIGNsYXNzIEdhbWVcclxuIiwiLypcclxuICogIFV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG4gXHJcbmxldCBnZXRSYW5kb21JbnQgPSAobWluLCBtYXggPSBmYWxzZSkgPT4ge1xyXG4gICAgaWYgKG1heCA9PT0gZmFsc2UpIHtcclxuICAgICAgICBtYXggPSBtaW47XHJcbiAgICAgICAgbWluID0gMDtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXJzZUludChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluLCAxMCk7XHJcbn07XHJcblxyXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMjA0MzIyOC8xOTMxNjVcclxuZnVuY3Rpb24gaXNEYXJrQ29sb3IoY29sb3IpIHtcclxuICAgIHZhciBjID0gY29sb3IubGVuZ3RoID09PSA2ID8gY29sb3IgOiBjb2xvci5zdWJzdHJpbmcoMSk7IC8vIHN0cmlwICNcclxuICAgIHZhciByZ2IgPSBwYXJzZUludChjLCAxNik7ICAgLy8gY29udmVydCBycmdnYmIgdG8gZGVjaW1hbFxyXG4gICAgdmFyIHIgPSAocmdiID4+IDE2KSAmIDB4ZmY7ICAvLyBleHRyYWN0IHJlZFxyXG4gICAgdmFyIGcgPSAocmdiID4+ICA4KSAmIDB4ZmY7ICAvLyBleHRyYWN0IGdyZWVuXHJcbiAgICB2YXIgYiA9IChyZ2IgPj4gIDApICYgMHhmZjsgIC8vIGV4dHJhY3QgYmx1ZVxyXG5cclxuICAgIC8vIHVzZSBhIHN0YW5kYXJkIGZvcm11bGEgdG8gY29udmVydCB0aGUgcmVzdWx0aW5nIFJHQiB2YWx1ZXMgaW50byB0aGVpciBwZXJjZWl2ZWQgYnJpZ2h0bmVzc1xyXG4gICAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUmVjLl83MDkjTHVtYV9jb2VmZmljaWVudHNcclxuICAgIHZhciBsdW1hID0gMC4yMTI2ICogciArIDAuNzE1MiAqIGcgKyAwLjA3MjIgKiBiOyAvLyBwZXIgSVRVLVIgQlQuNzA5XHJcblxyXG4gICAgLy8gY29uc29sZS5sb2coXCJsdW1hIGZvciBjb2xvcjpcIiwgY29sb3IsIGx1bWEpO1xyXG5cclxuICAgIHJldHVybiBsdW1hIDwgODA7IC8vIHRvbyBkYXJrIGlmIGx1bWEgaXMgc21hbGxlciB0aGFuIE5cclxufVxyXG5cclxuXHJcbmV4cG9ydCB7IGdldFJhbmRvbUludCwgaXNEYXJrQ29sb3IgfTtcclxuIl19
