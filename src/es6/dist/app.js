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
                    this.destroy = true;
                    this.stepsMoved = 0;
                    this.moveTo = false;

                    var _moveTo$canvasCoordinates = this.moveTo.canvasCoordinates(sw, sh);

                    var _moveTo$canvasCoordinates2 = _slicedToArray(_moveTo$canvasCoordinates, 2);

                    l = _moveTo$canvasCoordinates2[0];
                    t = _moveTo$canvasCoordinates2[1];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGtnL0RldmVsb3BtZW50L3ByaXZhdGUvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCIvVXNlcnMvZGtnL0RldmVsb3BtZW50L3ByaXZhdGUvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiL1VzZXJzL2RrZy9EZXZlbG9wbWVudC9wcml2YXRlL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNHQSxZQUFZLENBQUM7O0FBRWIsU0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7QUFBRSxRQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUFFOztBQUVqRyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUwsWUFBWSxDQUFBLENBQUE7O0FBRTdCLElBQUksU0FBUyxHQUFHLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQU5qRCxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUE7O0FBRXZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBSXJCLElBQUksSUFBSSxHQUFHLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFVLENBQUM7QUFDdEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUdaLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxFQUFFLEVBQUs7O0FBRXZDLFFBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFbEMsS0FBSSxHQUFHLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFVLENBQUM7QUFDbEIsS0FBSSxDQUFDLElBQUksRUFBRSxDQUFDO0NBRVosQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FDYkgsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRTtBQUN6QyxTQUFLLEVBQUUsSUFBSTtDQUNkLENBQUMsQ0FBQzs7QUFFSCxJQUFJLGNBQWMsR0FBRyxDQUFDLFlBQVk7QUFBRSxhQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFO0FBQUUsWUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLEFBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEFBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEFBQUMsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLEFBQUMsSUFBSTtBQUFFLGlCQUFLLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFBLENBQUUsSUFBSSxDQUFBLEFBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFO0FBQUUsb0JBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEFBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsTUFBTTthQUFFO1NBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUFFLGNBQUUsR0FBRyxJQUFJLENBQUMsQUFBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO1NBQUUsU0FBUztBQUFFLGdCQUFJO0FBQUUsb0JBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2FBQUUsU0FBUztBQUFFLG9CQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQzthQUFFO1NBQUUsQUFBQyxPQUFPLElBQUksQ0FBQztLQUFFLEFBQUMsT0FBTyxVQUFVLEdBQUcsRUFBRSxDQUFDLEVBQUU7QUFBRSxZQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFBRSxtQkFBTyxHQUFHLENBQUM7U0FBRSxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFBRSxtQkFBTyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQUUsTUFBTTtBQUFFLGtCQUFNLElBQUksU0FBUyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7U0FBRTtLQUFFLENBQUM7Q0FBRSxDQUFBLEVBQUcsQ0FBQzs7QUFFMXBCLElBQUksWUFBWSxHQUFHLENBQUMsWUFBWTtBQUFFLGFBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRTtBQUFFLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQUUsZ0JBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsQUFBQyxVQUFVLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxBQUFDLElBQUksT0FBTyxJQUFJLFVBQVUsRUFBRSxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxBQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FBRTtLQUFFLEFBQUMsT0FBTyxVQUFVLFdBQVcsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFO0FBQUUsWUFBSSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxBQUFDLElBQUksV0FBVyxFQUFFLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxBQUFDLE9BQU8sV0FBVyxDQUFDO0tBQUUsQ0FBQztDQUFFLENBQUEsRUFBRyxDQUFDOztBQUV0akIsU0FBUyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7QUFBRSxRQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFBRSxhQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsT0FBTyxJQUFJLENBQUM7S0FBRSxNQUFNO0FBQUUsZUFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQUU7Q0FBRTs7QUFFL0wsU0FBUyxlQUFlLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRTtBQUFFLFFBQUksRUFBRSxRQUFRLFlBQVksV0FBVyxDQUFBLEFBQUMsRUFBRTtBQUFFLGNBQU0sSUFBSSxTQUFTLENBQUMsbUNBQW1DLENBQUMsQ0FBQztLQUFFO0NBQUU7O0FBRXpKLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FkbUIsYUFBYSxDQUFBLENBQUE7Ozs7O0FBS3ZELElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN2QixJQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDeEIsSUFBTSxpQkFBaUIsR0FBRyxXQUFXLEdBQUcsWUFBWSxDQUFDOztBQUVyRCxJQUFNLE1BQU0sR0FBRyxDQUFDLFlBQU07O0FBRWxCLFFBQUksS0FBSyxHQUFHLFNBQVIsS0FBSyxHQUFTO0FBQ2QsWUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2IsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QixnQkFBSSxDQUFDLEdBQUcsUUFBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyRSxnQkFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUNmLGlCQUFDLEdBQUEsR0FBQSxHQUFPLENBQUMsQ0FBRzthQUNmO0FBQ0QsZUFBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNmOztBQUVELGVBQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDN0IsQ0FBQTtBQUNELFFBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsV0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3JCO0FBQ0QsV0FBTyxHQUFHLENBQUM7Q0FDZCxDQUFBLEVBQUcsQ0FBQzs7QUFFTCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsSUFBSSxRQUFRLEdBQUcsU0FBWCxRQUFRLEdBQWlCO0FBZXpCLFFBZlksR0FBRyxHQUFBLFNBQUEsQ0FBQSxNQUFBLElBQUEsQ0FBQSxJQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxTQUFBLEdBQUcsQ0FBQyxDQUFDLEdBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBOztBQUNwQixRQUFJLFNBQVMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUMxQixTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUMvQixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixXQUFPLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0NBQzlCLENBQUM7O0FBRUYsSUFBTSxZQUFZLEdBQUcsQ0FBQyxZQUFNO0FBQ3hCLFFBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekIsV0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN6QjtBQUNELFdBQU8sR0FBRyxDQUFDO0NBQ2QsQ0FBQSxFQUFHLENBQUM7QUFDTCxJQUFNLG9CQUFvQixHQUFHLENBQUMsWUFBTTtBQUNoQyxXQUFPLEVBQUEsQ0FBQSxNQUFBLENBQUEsa0JBQUEsQ0FBSSxZQUFZLENBQUEsQ0FBQSxDQUFFLE9BQU8sRUFBRSxDQUFDO0NBQ3RDLENBQUEsRUFBRyxDQUFDOztBQUVMLElBQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDOzs7O0FBa0JoQyxJQWRNLElBQUksR0FBQSxDQUFBLFlBQUE7QUFFSyxhQUZULElBQUksR0FFeUM7QUFjM0MsWUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FkdkIsRUFBRSxHQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFnQnpDLFlBQUksV0FBVyxHQUFHLElBQUksQ0FoQlosTUFBTSxDQUFBO0FBaUJoQixZQWpCVSxNQUFNLEdBQUEsV0FBQSxLQUFBLFNBQUEsR0FBRyxDQUFDLEdBQUEsV0FBQSxDQUFBO0FBa0JwQixZQUFJLE1BQU0sR0FBRyxJQUFJLENBbEJLLENBQUMsQ0FBQTtBQW1CdkIsWUFuQnNCLENBQUMsR0FBQSxNQUFBLEtBQUEsU0FBQSxHQUFHLENBQUMsR0FBQSxNQUFBLENBQUE7QUFvQjNCLFlBQUksTUFBTSxHQUFHLElBQUksQ0FwQlksQ0FBQyxDQUFBO0FBcUI5QixZQXJCNkIsQ0FBQyxHQUFBLE1BQUEsS0FBQSxTQUFBLEdBQUcsQ0FBQyxHQUFBLE1BQUEsQ0FBQTs7QUF1QmxDLHVCQUFlLENBQUMsSUFBSSxFQXpCdEIsSUFBSSxDQUFBLENBQUE7O0FBR0YsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFM0MsWUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxZQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLFlBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0FBQzdCLFlBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFlBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0tBQ3hCOzs7Ozs7QUE4QkQsZ0JBQVksQ0EzQ1YsSUFBSSxFQUFBLENBQUE7QUE0Q0YsV0FBRyxFQUFFLE1BQU07QUFDWCxhQUFLLEVBN0JMLFNBQUEsSUFBQSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFOzs7OztBQUtkLGdCQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO0FBQ3ZCLHVCQUFPO2FBQ1Y7O0FBK0JHLGdCQUFJLGVBQWUsR0E3QlYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7O0FBK0JwQyxnQkFBSSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUUxRCxnQkFqQ0MsQ0FBQyxHQUFBLGdCQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFrQ0YsZ0JBbENJLENBQUMsR0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBOzs7OztBQXVDTCxnQkFBSSxrQkFBa0IsR0FwQ2IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTs7QUFzQ3ZDLGdCQUFJLG1CQUFtQixHQUFHLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFaEUsZ0JBeENDLENBQUMsR0FBQSxtQkFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBeUNGLGdCQXpDSSxDQUFDLEdBQUEsbUJBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFVCxnQkFBSSxJQUFJLENBQUMsTUFBTSxFQUFFOzs7Ozs7Ozs7OztBQVdiLG9CQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUM7O0FBMkN6QixvQkF6Q0MsRUFBRSxHQUFTLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUEwQ2xDLG9CQTFDSyxFQUFFLEdBQTZCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUEyQzFELG9CQTFDQyxHQUFHLEdBQVUsRUFBRSxHQUFHLG9CQUFvQixDQUFBO0FBMkN2QyxvQkEzQ00sR0FBRyxHQUFnQyxFQUFFLEdBQUcsb0JBQW9CLENBQUE7Ozs7QUErQ2xFLG9CQTVDQyxpQkFBaUIsR0FBNEIsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFBO0FBNkN6RCxvQkE3Q29CLG9CQUFvQixHQUFtQixJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUE7QUE4Q3RFLG9CQTdDQyxlQUFlLEdBQXNCLENBQUMsR0FBRyxpQkFBaUIsQ0FBQTtBQThDM0Qsb0JBOUNrQixlQUFlLEdBQTRCLENBQUMsR0FBRyxvQkFBb0IsQ0FBQTtBQStDckYsb0JBOUNDLEVBQUUsR0FBUyxDQUFDLEdBQUcsZUFBZSxDQUFBO0FBK0MvQixvQkEvQ0ssRUFBRSxHQUEwQixDQUFDLEdBQUcsZUFBZSxDQUFBOzs7O0FBRXZELGlCQUFDLEdBQVEsRUFBRSxDQUFBO0FBQVIsaUJBQUMsR0FBUyxFQUFFLENBQUE7QUFJaEIsb0JBQUksSUFBSSxJQUFJLG9CQUFvQixFQUFFO0FBQzlCLHdCQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNwQix3QkFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsd0JBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDOztBQWlEaEIsd0JBQUkseUJBQXlCLEdBaER4QixJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTs7QUFrRDFDLHdCQUFJLDBCQUEwQixHQUFHLGNBQWMsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFsRGpGLHFCQUFDLEdBQUEsMEJBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUFFLHFCQUFDLEdBQUEsMEJBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtpQkFDUixNQUFNO0FBQ0YscUJBQUMsR0FBUSxFQUFFLENBQUE7QUFBUixxQkFBQyxHQUFTLEVBQUUsQ0FBQTtpQkFDbkI7YUFDSjs7QUFFRCxnQkFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUMsZ0JBQUksU0FBUyxHQUFHLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBWSxTQUFTLENBQUMsR0FBRyxXQUFXLEdBQUcsT0FBTyxDQUFDOztBQUUvRCxlQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQzs7QUFFbEIsZUFBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDMUIsZUFBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFekIsZ0JBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNkLG1CQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQzs7QUFFbEIsbUJBQUcsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO0FBQzVCLG1CQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzlCOzs7QUF5REcsZ0JBdERDLENBQUMsR0FDRixDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUE7QUFzRHRCLGdCQXZESSxDQUFDLEdBRUwsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBOzs7QUFJMUIsZUFBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDMUIsZUFBRyxDQUFDLElBQUksR0FBRyxjQUFjLENBQUM7QUFDMUIsZUFBRyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDekIsZUFBRyxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7QUFDNUIsZUFBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNuQztLQXFEQSxFQUFFO0FBQ0MsV0FBRyxFQUFFLG1CQUFtQjtBQUN4QixhQUFLLEVBckRRLFNBQUEsaUJBQUEsQ0FBQyxVQUFVLEVBQUU7QUFDMUIsZ0JBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDO0FBQ3pCLGdCQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztTQUN2QjtLQXNEQSxFQUFFO0FBQ0MsV0FBRyxFQUFFLG1CQUFtQjtBQUN4QixhQUFLLEVBdERRLFNBQUEsaUJBQUEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFOzs7QUF5RGxCLGdCQUFJLGdCQUFnQixHQXZEVCxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTs7QUF5RHRDLGdCQUFJLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFNUQsZ0JBM0RDLEVBQUUsR0FBQSxpQkFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBNERILGdCQTVESyxFQUFFLEdBQUEsaUJBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTs7Ozs7Ozs7QUFvRVAsZ0JBNURDLENBQUMsR0FDRixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQTREWCxnQkE3REksQ0FBQyxHQUVMLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFBOztBQUdmLG1CQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0tBMkRBLEVBQUU7QUFDQyxXQUFHLEVBQUUsZ0JBQWdCO0FBQ3JCLGFBQUssRUEzREssU0FBQSxjQUFBLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRTs7OztBQStEZixnQkF6REMsRUFBRSxHQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLFdBQVcsQ0FBQyxDQUFBO0FBMER2QyxnQkExREssRUFBRSxHQUNLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLFlBQVksQ0FBQyxDQUFBOztBQUM1QyxtQkFBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNuQjtLQTJEQSxDQUFDLENBQUMsQ0FBQzs7QUFFSixXQTNMRSxJQUFJLENBQUE7Q0E0TFQsQ0FBQSxFQUFHLENBQUM7O0FBRUwsSUE3RHFCLElBQUksR0FBQSxDQUFBLFlBQUE7QUFFVixhQUZNLElBQUksR0FFUDtBQTZEVixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7O0FBRWpCLHVCQUFlLENBQUMsSUFBSSxFQWpFUCxJQUFJLENBQUEsQ0FBQTs7QUFJakIsWUFBSSxLQUFLLEdBQUcsQ0FBQyxZQUFNO0FBQ2YsZ0JBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNmLGlCQUFLLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxPQUFPLEdBQUcsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLEVBQUU7Ozs7QUFtRTFELG9CQTlESyxNQUFNLEdBQ1AsUUFBUSxDQUFDLE9BQU8sR0FBRyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUE7QUE4RHZDLG9CQS9EYSxHQUFHO0FBRVosd0JBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTs7O0FBR3BELG9CQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsWUFBQSxDQUFBLENBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDdkUscUJBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDcEI7QUFDRCxtQkFBTyxLQUFLLENBQUM7U0FDaEIsQ0FBQSxFQUFHLENBQUM7QUFDTCxZQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzs7QUFFbkIsWUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwRCxZQUFJLE9BQU8sR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUU1QyxZQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQztBQUNuQixZQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQzs7QUFFakMsWUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7O0FBRXJCLFlBQUksTUFBTSxHQUFHLENBQUEsVUFBQyxFQUFFLEVBQUs7QUErRGpCLGdCQTlESyxFQUFFLEdBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFBO0FBK0RqQyxnQkEvRFMsRUFBRSxHQUF3QixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUE7O0FBQ3JELGdCQUFJLE1BQU0sR0FBRyxHQUFHLENBQUM7QUFDakIsZ0JBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QixrQkFBTSxDQUFDLE1BQU0sQ0FBSSxFQUFFLEdBQUMsTUFBTSxHQUFBLElBQUEsQ0FBSyxDQUFDO0FBQ2hDLGlCQUFBLENBQUssR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFDLE1BQU0sQ0FBQztBQUNuQyxpQkFBQSxDQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7U0FFMUMsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFYixTQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFL0IsWUFBSSxtQkFBbUIsR0FBRyxTQUF0QixtQkFBbUIsQ0FBSSxFQUFFLEVBQUs7QUFDOUIsZ0JBQUksS0FBSyxHQUFHLEVBQUUsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDOzs7O0FBSS9CLGdCQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO0FBQzlDLG9CQUFJLFFBQVEsR0FBRyxLQUFNLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxJQUFLLFFBQVE7b0JBQ25FLEdBQUcsR0FBRyxRQUFRLENBQUMsZUFBZTtvQkFDOUIsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7O0FBRXpCLHFCQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLElBQ3hCLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQSxJQUNyRCxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUEsQ0FBRTtBQUMxRCxxQkFBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxJQUN4QixHQUFHLElBQUksR0FBRyxDQUFDLFNBQVMsSUFBSyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSyxDQUFDLENBQUEsSUFDckQsR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLElBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUssQ0FBQyxDQUFBLENBQUc7YUFDOUQ7O0FBRUQsZ0JBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRXJELGdCQUFJLFFBQVEsR0FBRztBQUNYLGlCQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSTtBQUNsQyxpQkFBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDLEdBQUc7YUFDcEMsQ0FBQzs7O0FBR0YsbUJBQU8sUUFBUSxDQUFDO1NBQ25CLENBQUM7O0FBRUYsWUFBSSxZQUFZLEdBQUcsQ0FBQSxVQUFDLEVBQUUsRUFBSztBQUN2QixnQkFBSSxRQUFRLEdBQUcsbUJBQW1CLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxJQUFJLEdBQUcsS0FBQSxDQUFLLE9BQU8sRUFBRSxDQUFDOztBQUUxQixpQkFBQSxDQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDekIsb0JBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDOzs7O0FBZ0VyQixvQkFBSSxLQUFLLEdBQUcsY0FBYyxDQTdEWCxJQUFJLEVBQUEsQ0FBQSxDQUFBLENBQUE7O0FBK0RuQixvQkEvREssRUFBRSxHQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQWdFUCxvQkFoRVMsRUFBRSxHQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFrRVgsb0JBQUksb0JBQW9CLEdBakVULElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBOztBQW1FMUMsb0JBQUkscUJBQXFCLEdBQUcsY0FBYyxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVwRSxvQkFyRUssRUFBRSxHQUFBLHFCQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFzRVAsb0JBdEVTLEVBQUUsR0FBQSxxQkFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBOztBQXdFWCxvQkFBSSx1QkFBdUIsR0F2RVosSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTs7QUF5RTdDLG9CQUFJLHdCQUF3QixHQUFHLGNBQWMsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFMUUsb0JBM0VLLEVBQUUsR0FBQSx3QkFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBNEVQLG9CQTVFUyxFQUFFLEdBQUEsd0JBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFWCxvQkFBSSxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxRQUFRLENBQUMsQ0FBQyxJQUFLLEVBQUUsR0FBRyxFQUFFLElBQzFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUssRUFBRSxHQUFHLEVBQUUsRUFBRztBQUM3Qyx3QkFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7aUJBQ3ZCO2FBQ0osQ0FBQyxDQUFDO1NBRU4sQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFYixTQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFMUMsWUFBSSxVQUFVLEdBQUcsQ0FBQSxVQUFDLEVBQUUsRUFBSztBQUNyQixjQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7Ozs7Ozs7QUFPcEIsZ0JBQUksUUFBUSxHQUFHLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztnQkFDbEMsSUFBSSxHQUFHLEtBQUEsQ0FBSyxPQUFPLEVBQUUsQ0FBQzs7O0FBRzFCLGdCQUFJLGNBQWMsR0FBRyxLQUFBLENBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBSztBQUM3Qyx1QkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3ZCLENBQUMsQ0FBQzs7QUFFSCxpQkFBQSxDQUFLLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUVoRixDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUViLFNBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDOztBQUVwQyxjQUFNLEVBQUUsQ0FBQztLQUNaOzs7O0FBNkVELGdCQUFZLENBbE1LLElBQUksRUFBQSxDQUFBO0FBbU1qQixXQUFHLEVBQUUsbUJBQW1CO0FBQ3hCLGFBQUssRUE3RVEsU0FBQSxpQkFBQSxDQUFDLGFBQWEsRUFBRTs7QUFFN0IsZ0JBQUksSUFBSSxLQUFLLGFBQWEsRUFDdEIsT0FBTzs7Ozs7Ozs7O0FBU1gsZ0JBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7OztBQUk5RCwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBSzs7Ozs7QUFLN0Isb0JBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUN6QyxDQUFDLENBQUM7U0FDTjtLQTZFQSxFQUFFO0FBQ0MsV0FBRyxFQUFFLE1BQU07QUFDWCxhQUFLLEVBN0VMLFNBQUEsSUFBQSxHQUFHO0FBQ0gsZ0JBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7OztBQUlaLGtCQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUN0RDtLQThFQSxFQUFFO0FBQ0MsV0FBRyxFQUFFLFNBQVM7QUFDZCxhQUFLLEVBOUVGLFNBQUEsT0FBQSxHQUFHO0FBQ04sbUJBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdEc7S0ErRUEsRUFBRTtBQUNDLFdBQUcsRUFBRSxNQUFNO0FBQ1gsYUFBSyxFQS9FTCxTQUFBLElBQUEsR0FBRztBQUNILG1CQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzFCLGdCQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7QUFFcEIsZ0JBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7O0FBaUZmLGdCQUFJLFFBQVEsR0FoRkgsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBOztBQWtGdkIsZ0JBQUksU0FBUyxHQUFHLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRTVDLGdCQXBGQyxDQUFDLEdBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBcUZGLGdCQXJGSSxDQUFDLEdBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVULGVBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUIsZUFBRyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7QUFDeEIsZUFBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQWF6QixnQkFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBSztBQUN6QixvQkFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2Qsa0NBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzdCLE1BQU07QUFDSCx3QkFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN4QjthQUNKLENBQUMsQ0FBQztBQUNILDBCQUFjLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQzdCLG9CQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDeEIsQ0FBQyxDQUFDOztBQUVILGdCQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztTQUN4Qjs7O0tBd0ZBLEVBQUU7QUFDQyxXQUFHLEVBQUUsdUJBQXVCO0FBQzVCLGFBQUssRUF2RlksU0FBQSxxQkFBQSxDQUFDLElBQUksRUFBRTtBQUN4QixnQkFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDOztBQUVwQixnQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2xFLGdCQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDakUsZ0JBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsV0FBVyxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDL0UsZ0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsWUFBWSxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7O0FBRWpGLGdCQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkUsZ0JBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwRSxnQkFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFB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cmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxyXG4gICAgRVM2IGNvZGUgZW50cnkgcG9pbnRcclxuKi9cclxuY29uc3QgVkVSU0lPTiA9IFwiMC4wLjJcIlxyXG5cclxuY29uc29sZS5sb2coVkVSU0lPTik7XHJcblxyXG5pbXBvcnQgR2FtZSBmcm9tICcuL2dhbWUuZXM2JztcclxuXHJcbmxldCBnYW1lID0gbmV3IEdhbWUoKTtcclxuZ2FtZS5wbGF5KCk7XHJcblxyXG5cclxuJChcIiNidXR0b25SZXN0YXJ0XCIpLm9uKFwiY2xpY2tcIiwgKGV2KSA9PiB7XHJcblxyXG5cdGNvbnNvbGUuaW5mbyhcIj09PT4gUkVTVEFSVCBHQU1FXCIpO1xyXG5cclxuXHRnYW1lID0gbmV3IEdhbWUoKTtcclxuXHRnYW1lLnBsYXkoKTtcclxuXHJcbn0pO1xyXG5cclxuIiwiLypcclxuICAgIFRoZSBnYW1lIGNvZGUgYW5kIGxvZ2ljLCB3aXRoIFVJIGhhbmRsaW5nLlxyXG4gICAgVE9ETyhka2cpOiB1c2UgdGhlIGZvbGxvd2luZyB0ZWNobmlxdWVzXHJcbiAgICAgICAgLSBnZW5lcmF0b3JzIGFuZCB5aWVsZFxyXG4gICAgICAgIC0gU3ltYm9sc1xyXG4qL1xyXG5cclxuaW1wb3J0IHsgZ2V0UmFuZG9tSW50LCBpc0RhcmtDb2xvciB9IGZyb20gJy4vdXRpbHMuZXM2JztcclxuXHJcbi8vIHRoZXNlIGFyZSBub3QgaW4gcGl4ZWwsIGJ1dCByYXRoZXIgb3VyIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHVuaXRzXHJcbi8vIHRoaXMgbWVhbnMgTiA9IE4gbnVtYmVyIG9mIGl0ZW1zLCBlLmcuIDEwID0gMTAgaXRlbXMsIG5vdCAxMCBwaXhlbHNcclxuLy8gdGhlIGRyYXcoKSBjYWxsIHdpbGwgY29udmVydCB0aG9zZSBpbnRvIHByb3BlciBwaXhlbHNcclxuY29uc3QgQk9BUkRfV0lEVEggPSAxMDtcclxuY29uc3QgQk9BUkRfSEVJR0hUID0gMTA7XHJcbmNvbnN0IEJPQVJEX1RJTEVTX0NPVU5UID0gQk9BUkRfV0lEVEggKiBCT0FSRF9IRUlHSFQ7XHJcblxyXG5jb25zdCBDT0xPUlMgPSAoKCkgPT4ge1xyXG4gICAgLy8gVE9ETyhka2cpOiBlbGltaW5hdGUgY29sb3JzIHRoYXQgYXJlIHRvbyBjbG9zZSB0byBlYWNoIG90aGVyIGFuZC9vciBkdXBsaWNhdGVzXHJcbiAgICBsZXQgaW5uZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgbGV0IHJnYiA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB2ID0gKHBhcnNlSW50KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NSksIDEwKSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgICAgICBpZiAodi5sZW5ndGggPD0gMSkge1xyXG4gICAgICAgICAgICAgICAgdiA9IGAwJHt2fWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmdiLnB1c2godik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHJldHVybiAncmdiKCcrIHJnYi5qb2luKCcsJykgKycpJztcclxuICAgICAgICByZXR1cm4gJyMnICsgcmdiLmpvaW4oXCJcIik7XHJcbiAgICB9XHJcbiAgICBsZXQgcmV0ID0gW107XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IDEwMDA7IHgrKykge1xyXG4gICAgICAgIHJldC5wdXNoKGlubmVyKCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJldDtcclxufSkoKTtcclxuXHJcbmxldCBfcm5kQ29sb3IgPSAwO1xyXG5sZXQgZ2V0Q29sb3IgPSAoaWR4ID0gLTEpID0+IHtcclxuICAgIGlmIChfcm5kQ29sb3IgPj0gQ09MT1JTLmxlbmd0aClcclxuICAgICAgICBfcm5kQ29sb3IgPSAwO1xyXG4gICAgaWYgKGlkeCA+IC0xICYmIGlkeCA8IENPTE9SUy5sZW5ndGgpXHJcbiAgICAgICAgcmV0dXJuIENPTE9SU1tpZHhdO1xyXG4gICAgcmV0dXJuIENPTE9SU1tfcm5kQ29sb3IrK107XHJcbn07XHJcblxyXG5jb25zdCBNQUdJQ19DT0xPUlMgPSAoKCkgPT4ge1xyXG4gICAgbGV0IHJldCA9IFtdO1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCA1MDsgeCsrKSB7XHJcbiAgICAgICAgcmV0LnB1c2goZ2V0Q29sb3IoeCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJldDtcclxufSkoKTtcclxuY29uc3QgTUFHSUNfQ09MT1JTX1JFVkVSU0UgPSAoKCkgPT4ge1xyXG4gICAgcmV0dXJuIFsuLi5NQUdJQ19DT0xPUlNdLnJldmVyc2UoKTtcclxufSkoKTtcclxuXHJcbmNvbnN0IE1PVkVfU1RFUFNfSU5fRlJBTUVTID0gMzA7ICAvLyBvciBpbiAwLjUgc2Vjb25kcywgYXNzdW1pbmcgNjAgZnJhbWVzL3NlY1xyXG5cclxuLy8gY29uc29sZS5sb2coTUFHSUNfQ09MT1JTKTtcclxuXHJcbmNsYXNzIFRpbGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHsgbnVtYmVyID0gMCwgYyA9IDAsIHIgPSAwIH0gPSB7fSkge1xyXG4gICAgICAgIHRoaXMubnVtYmVyID0gbnVtYmVyIHx8IGdldFJhbmRvbUludCgxLCAzKTtcclxuICAgICAgICAvLyBpbiBjb2wvcm93IGNvb3JkaW5hdGVzLCB0aGF0IGlzIGluIG91ciBvd24gaW50ZXJuYWwgdW5pdHNcclxuICAgICAgICB0aGlzLmMgPSBjO1xyXG4gICAgICAgIHRoaXMuciA9IHI7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG8gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnRQb3NpdGlvbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSA0OyAvLyByYW5kb20gbnVtYmVyLCBoaWRkZW4geGtjZCByZWZlcmVuY2VcclxuICAgICAgICB0aGlzLnN0ZXBzTW92ZWQgPSAwO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudHJhY2tlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNhbGxlZCBvbmNlIHBlciBmcmFtZSAtIG9ubHkgb25jZSBwZXIgZnJhbWUhXHJcbiAgICBkcmF3KGN0eCwgc3csIHNoKSB7XHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiByYW5kb21pemUgY29sb3IgYWNjb3JkaW5nIHRvIHRoaXMubnVtYmVyXHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBpbXBsZW1lbnQgdGlsZSBkZXN0cnVjdGlvbiBhbmQgYWRkaW5nIG5ldyB0aWxlcyBmcm9tIGFib3ZlXHJcbiAgICAgICAgLy8gICAgICAgICAgICBXb3VsZCBiZSBjb29sIGlmIHRoZSB0aWxlIHdvdWxkIGV4cGxvZGUgaW4gaHVnZSBleHBsb3Npb25cclxuICAgICAgICAvLyAgICAgICAgICAgIGJ1dCBvbmx5IGlmIHRoZSBudW1iZXIgaXMgOSBhbmQgaXQgd291bGQgYmVjb21lIGEgMTAuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgW3csIGhdID0gdGhpcy50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgIC8vIHRoZXNlIGFyZSB0aGUgb3JpZ2luYWwgcGl4ZWwgY29vcmRzIC0gdGhleSBuZWVkIHRvIGJlIGFkanVzdGVkXHJcbiAgICAgICAgLy8gd2hlbiB3ZSBoYXZlIHRvIGNvbGxhcHNlXHJcbiAgICAgICAgbGV0IFtsLCB0XSA9IHRoaXMuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5tb3ZlVG8pIHtcclxuICAgICAgICAgICAgLy8gVE9ETyhka2cpOiBDaGVjayBpZiB3ZSBhcmUgYWxyZWFkeSBpbiB0aGUgY29ycmVjdCBzcG90IGFuZFxyXG4gICAgICAgICAgICAvLyAgICAgICAgICAgIGlmIHdlIGFyZSwganVzdCBtYXJrIHVzIGFzIGRlc3Ryb3llZC5cclxuXHJcbiAgICAgICAgICAgIC8vIE5PVEUoZGtnKTogYW5pbWF0aW9uIGlkZWEgLSBoYXZlIHRoZSB0aWxlcyBzaHJpbmsgYW5kIGRpc2FwcGVhciBpbnN0ZWFkIG1heWJlP1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETyhka2cpOiBmaWd1cmUgb3V0IGhvdyB0byBhZGQgdmVsb2NpdHkgaW50byB0aGUgY29kZSBiZWxvd1xyXG5cclxuICAgICAgICAgICAgLy8gc3RlcHNNb3ZlZCBpcyBpbXBvcnRhbnQsIGFzIHdlIHdhbnQgdG8ga2VlcCB0cmFjayBob3cgZmFyXHJcbiAgICAgICAgICAgIC8vIHdlIGFyZSBpbnRvIHRoZSBhbmltYXRpb24gY3ljbGUgZm9yIHRoaXMgbW92ZSwgZXZlbiB3aGVuIHRoZSBcclxuICAgICAgICAgICAgLy8gdXNlciBjaGFuZ2VzIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cgYW5kIHRoZXJlZm9yZSB0aGUgY2FudmFzIGRpbWVuc2lvbnNcclxuICAgICAgICAgICAgbGV0IHN0ZXAgPSArK3RoaXMuc3RlcHNNb3ZlZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBbZHIsIGRjXSA9IFt0aGlzLnIgLSB0aGlzLm1vdmVUby5yLCB0aGlzLmMgLSB0aGlzLm1vdmVUby5jXTtcclxuICAgICAgICAgICAgbGV0IFtkc3IsIGRzY10gPSBbZHIgLyBNT1ZFX1NURVBTX0lOX0ZSQU1FUywgZGMgLyBNT1ZFX1NURVBTX0lOX0ZSQU1FU107XHJcbiAgICAgICAgICAgIC8vIFRoZSAtZHNyIGFuZCAtZHNjIGFyZSBoZXJlIGluIG9yZGVyIHRvIGhhdmUgdGhlIHRpbGVzIG1vdmUgb250byB0aGUgdGFyZ2V0IG9uZSwgbm90IG1vdmVcclxuICAgICAgICAgICAgLy8gYXdheSBmcm9tIGl0LlxyXG4gICAgICAgICAgICBsZXQgW3N0ZXBzRnJhY3Rpb25Sb3dzLCBzdGVwc0ZyYWN0aW9uQ29sdW1uc10gPSBbIHN0ZXAgKiAtZHNyLCBzdGVwICogLWRzYyBdOyBcclxuICAgICAgICAgICAgbGV0IFttb3ZlUm93c0luUGl4ZWwsIG1vdmVDb2xzSW5QaXhlbF0gPSBbaCAqIHN0ZXBzRnJhY3Rpb25Sb3dzLCB3ICogc3RlcHNGcmFjdGlvbkNvbHVtbnNdO1xyXG4gICAgICAgICAgICBsZXQgW25sLCBudF0gPSBbbCArIG1vdmVDb2xzSW5QaXhlbCwgdCArIG1vdmVSb3dzSW5QaXhlbF07XHJcblxyXG4gICAgICAgICAgICBbbCwgdF0gPSBbbmwsIG50XTtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoaXMgY29kZSBpcyB3b3JraW5nXHJcbiAgICAgICAgICAgIC8vIFRPRE8oZGtnKTogYWRkIGNoZWNrIGZvciBcImlzIHRoZSB0aWxlIGFscmVhZHkgb24gdGhlIHBvc2l0aW9uIHdoZXJlIGl0IHNob3VsZCBiZVwiXHJcbiAgICAgICAgICAgIGlmIChzdGVwID49IE1PVkVfU1RFUFNfSU5fRlJBTUVTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3kgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGVwc01vdmVkID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZVRvID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBbbCwgdF0gPSB0aGlzLm1vdmVUby5jYW52YXNDb29yZGluYXRlcyhzdywgc2gpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgW2wsIHRdID0gW25sLCBudF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IFxyXG5cclxuICAgICAgICBsZXQgZmlsbENvbG9yID0gTUFHSUNfQ09MT1JTW3RoaXMubnVtYmVyLTFdO1xyXG4gICAgICAgIGxldCBhbnRpQ29sb3IgPSBpc0RhcmtDb2xvcihmaWxsQ29sb3IpID8gXCJsaWdodGdyYXlcIiA6IFwiYmxhY2tcIjtcclxuXHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgICAgICAgLy8gY3R4LmZpbGxTdHlsZSA9ICh0aGlzLmMgKyB0aGlzLnIpICUgMiAhPSAwID8gXCIjRkY0NTAwXCIgOiBcIiNGRkE1MDBcIjtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gZmlsbENvbG9yO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdChsLCB0LCB3LCBoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudHJhY2tlZCkge1xyXG4gICAgICAgICAgICBjdHgubGluZVdpZHRoID0gNDtcclxuICAgICAgICAgICAgLy8gY3R4LnN0cm9rZVN0eWxlID0gTUFHSUNfQ09MT1JTX1JFVkVSU0VbdGhpcy5udW1iZXItMV07XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGFudGlDb2xvcjtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVJlY3QobCwgdCwgdywgaCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB3cml0ZSB0aGUgbnVtYmVyIGluIHRoZSBjZW50ZXIgb2YgdGhlIHRpbGVcclxuICAgICAgICBsZXQgW3gsIHldID0gW1xyXG4gICAgICAgICAgICBsICsgTWF0aC5jZWlsKHcgLyAyLjApLCBcclxuICAgICAgICAgICAgdCArIE1hdGguY2VpbChoIC8gMi4wKVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIC8vIGN0eC5maWxsU3R5bGUgPSBNQUdJQ19DT0xPUlNfUkVWRVJTRVt0aGlzLm51bWJlcl07XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGFudGlDb2xvcjtcclxuICAgICAgICBjdHguZm9udCA9IFwiMzJweCBjb3VyaWVyXCI7XHJcbiAgICAgICAgY3R4LnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgICAgICAgY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcbiAgICAgICAgY3R4LmZpbGxUZXh0KHRoaXMubnVtYmVyLCB4LCB5KTtcclxuICAgIH1cclxuXHJcbiAgICBhbmltYXRlQ29sbGFwc2VUbyh0YXJnZXRUaWxlKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG8gPSB0YXJnZXRUaWxlO1xyXG4gICAgICAgIHRoaXMuc3RlcHNNb3ZlZCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKSB7XHJcbiAgICAgICAgLy8gcmV0dXJuIHRoZSBjdXJyZW50IHRpbGUgcG9zaXRpb24gaW4gcGl4ZWxcclxuICAgICAgICBsZXQgW3R3LCB0aF0gPSB0aGlzLnRpbGVEaW1lbnNpb25zKHN3LCBzaCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gY2FsYyB0aGUgdG9wIGFuZCBsZWZ0IGNvb3JkaW5hdGVzIGluIHBpeGVsICh0b3AtbGVmdCBpcyAwLCAwIGluIG91ciBjb29yZGluYXRlIHN5c3RlbVxyXG4gICAgICAgIC8vIGFuZCBib3R0b20tcmlnaHQgaXMgb3VyIHNjcmVlbl9oZWlnaHQtc2NyZWVuX3dpZHRoKVxyXG4gICAgICAgIC8vIHRoaXMgZGVwZW5kcyBvbiB0aGUgdGlsZXMgcG9zaXRpb24gKGluIGNvbC9yb3cgY29vcmRzKVxyXG4gICAgICAgIC8vIEluIGNhc2Ugd2UgYXJlIG1vdmluZy9jb2xsYXBzaW5nIG9udG8gYW5vdGhlciB0aWxlLCB3ZSB3aWxsIG5lZWRcclxuICAgICAgICAvLyB0byBtb3ZlIG9uY2UgcGVyIGZyYW1lIGludG8gYSBjZXJ0YWluIGRpcmVjdGlvbi5cclxuICAgICAgICBcclxuICAgICAgICBsZXQgW2wsIHRdID0gW1xyXG4gICAgICAgICAgICB0aGlzLmMgKiB0dyxcclxuICAgICAgICAgICAgdGhpcy5yICogdGhcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICByZXR1cm4gW2wsIHRdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aWxlRGltZW5zaW9ucyhzdywgc2gpIHtcclxuICAgICAgICAvLyBjYWxjIHRpbGUgd2lkdGggYW5kIGhlaWdodCBpbiBwaXhlbHMgZm9yIG9uZSB0aWxlXHJcbiAgICAgICAgLy8gREVQRU5ESU5HIG9uIHRoZSBjdXJyZW50IHNjcmVlbiBvciBib2FyZCBkaW1lbnNpb24hXHJcbiAgICAgICAgLy8gc3c6IHNjcmVlbiBvciBib2FyZCB3aWR0aCBpbiBwaXhlbFxyXG4gICAgICAgIC8vIHNoOiBzY3JlZW4gb3IgYm9hcmQgaGVpZ2h0IGluIHBpeGVsXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IFt0dywgdGhdID0gW01hdGguY2VpbChzdyAvIEJPQVJEX1dJRFRIKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jZWlsKHNoIC8gQk9BUkRfSEVJR0hUKV07XHJcbiAgICAgICAgcmV0dXJuIFt0dywgdGhdO1xyXG4gICAgfVxyXG59IC8vIGNsYXNzIFRpbGVcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgICAgICBsZXQgdGlsZXMgPSAoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdGlsZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY291bnRlciA9IDA7IGNvdW50ZXIgPCBCT0FSRF9USUxFU19DT1VOVDsgY291bnRlcisrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBsZXQgW2NvbHVtbnMsIHJvd3NdID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHBhcnNlRmxvYXQoQk9BUkRfVElMRVNfQ09VTlQgLyBCT0FSRF9XSURUSCksXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcGFyc2VGbG9hdChCT0FSRF9USUxFU19DT1VOVCAvIEJPQVJEX0hFSUdIVClcclxuICAgICAgICAgICAgICAgIC8vIF07XHJcbiAgICAgICAgICAgICAgICBsZXQgW2NvbHVtbiwgcm93XSA9IFtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChjb3VudGVyICUgQk9BUkRfV0lEVEgsIDEwKSwgICAgICAgICAgICAgIC8vIHBvc2l0aW9uIGluIGNvbHVtblxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KE1hdGguZmxvb3IoY291bnRlciAvIEJPQVJEX0hFSUdIVCksIDEwKSwgLy8gcG9zaXRpb24gaW4gcm93XHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0aWxlID0gbmV3IFRpbGUoeyBudW1iZXI6IGdldFJhbmRvbUludCgxLCAzKSwgYzogY29sdW1uLCByOiByb3cgfSk7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aWxlcztcclxuICAgICAgICB9KSgpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSB0aWxlcztcclxuICAgIFxyXG4gICAgICAgIGxldCBib2FyZEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkXCIpO1xyXG4gICAgICAgIGxldCBjb250ZXh0ID0gYm9hcmRFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHggPSBjb250ZXh0O1xyXG4gICAgICAgIHRoaXMuYm9hcmRFbGVtZW50ID0gYm9hcmRFbGVtZW50O1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHJlc2l6ZSA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgW3d3LCB3aF0gPSBbJCh3aW5kb3cpLndpZHRoKCksICQod2luZG93KS5oZWlnaHQoKV07XHJcbiAgICAgICAgICAgIGxldCBtYXJnaW4gPSAyMDA7XHJcbiAgICAgICAgICAgIGxldCAkYm9hcmQgPSAkKFwiI2JvYXJkXCIpO1xyXG4gICAgICAgICAgICAkYm9hcmQuaGVpZ2h0KGAke3doLW1hcmdpbn1weGApO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0ID0gd2gtbWFyZ2luO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5jYW52YXMud2lkdGggPSAkYm9hcmQud2lkdGgoKTsgLy8gdGhpcyBzaG91bGQgdGFrZSBtYXJnaW5zIGFuZCBDU1MgaW50byBhY2NvdW50XHJcbiAgICAgICAgICAgIC8vIHRoaXMuZHJhdygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHJlc2l6ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGdldE1vdXNlQ29vcmRpbmF0ZXMgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IGV2ZW50ID0gZXYgfHwgd2luZG93LmV2ZW50OyAvLyBJRS1pc21cclxuICAgICAgICAgICAgLy8gSWYgcGFnZVgvWSBhcmVuJ3QgYXZhaWxhYmxlIGFuZCBjbGllbnRYL1kgYXJlLFxyXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgcGFnZVgvWSAtIGxvZ2ljIHRha2VuIGZyb20galF1ZXJ5LlxyXG4gICAgICAgICAgICAvLyAoVGhpcyBpcyB0byBzdXBwb3J0IG9sZCBJRSlcclxuICAgICAgICAgICAgaWYgKGV2ZW50LnBhZ2VYID09IG51bGwgJiYgZXZlbnQuY2xpZW50WCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXZlbnREb2MgPSAoZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnRhcmdldC5vd25lckRvY3VtZW50KSB8fCBkb2N1bWVudCxcclxuICAgICAgICAgICAgICAgICAgICBkb2MgPSBldmVudERvYy5kb2N1bWVudEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IGV2ZW50RG9jLmJvZHk7XHJcblxyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFnZVggPSBldmVudC5jbGllbnRYICtcclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2Muc2Nyb2xsTGVmdCB8fCBib2R5ICYmIGJvZHkuc2Nyb2xsTGVmdCB8fCAwKSAtXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLmNsaWVudExlZnQgfHwgYm9keSAmJiBib2R5LmNsaWVudExlZnQgfHwgMCk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWdlWSA9IGV2ZW50LmNsaWVudFkgK1xyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5zY3JvbGxUb3AgIHx8IGJvZHkgJiYgYm9keS5zY3JvbGxUb3AgIHx8IDApIC1cclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2MuY2xpZW50VG9wICB8fCBib2R5ICYmIGJvZHkuY2xpZW50VG9wICB8fCAwICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBwYXJlbnRPZmZzZXQgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkub2Zmc2V0KCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbW91c2VQb3MgPSB7XHJcbiAgICAgICAgICAgICAgICB4OiBldmVudC5wYWdlWCAtIHBhcmVudE9mZnNldC5sZWZ0LFxyXG4gICAgICAgICAgICAgICAgeTogZXZlbnQucGFnZVkgLSBwYXJlbnRPZmZzZXQudG9wXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1vdXNlIG1vdmVkXCIsIG1vdXNlUG9zLngsIG1vdXNlUG9zLnkpO1xyXG4gICAgICAgICAgICByZXR1cm4gbW91c2VQb3M7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG1vdXNlVHJhY2tlciA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbW91c2VQb3MgPSBnZXRNb3VzZUNvb3JkaW5hdGVzKGV2KSxcclxuICAgICAgICAgICAgICAgIGRpbXMgPSB0aGlzLmdldERpbXMoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGlsZS50cmFja2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1vdXNlUG9zIGlzIGluIHBpeGVsIGNvb3Jkc1xyXG4gICAgICAgICAgICAgICAgbGV0IFtzdywgc2hdID0gZGltcztcclxuICAgICAgICAgICAgICAgIGxldCBbdHcsIHRoXSA9IHRpbGUudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICAgICAgICAgIGxldCBbdGwsIHR0XSA9IHRpbGUuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobW91c2VQb3MueCA+PSB0bCAmJiBtb3VzZVBvcy54IDw9ICh0bCArIHR3KSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlUG9zLnkgPj0gdHQgJiYgbW91c2VQb3MueSA8PSAodHQgKyB0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aWxlLnRyYWNrZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAkKFwiI2JvYXJkXCIpLm9uKFwibW91c2Vtb3ZlXCIsIG1vdXNlVHJhY2tlcik7XHJcblxyXG4gICAgICAgIGxldCBtb3VzZUNsaWNrID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiAodGhpcy5kcmF3aW5nICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIklnbm9yZWQgbW91c2UgY2xpY2sgYmVjYXVzZSBJIHdhcyBkcmF3aW5nLlwiKTtcclxuICAgICAgICAgICAgICAgIC8vIHJldHVybjtcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0gZ2V0TW91c2VDb29yZGluYXRlcyhldiksXHJcbiAgICAgICAgICAgICAgICBkaW1zID0gdGhpcy5nZXREaW1zKCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBoZXJlXCIsIG1vdXNlUG9zKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjbGlja2VkT25UaWxlcyA9IHRoaXMuYm9hcmQuZmlsdGVyKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGlsZS50cmFja2VkOyAvLyB3ZSBhcmUgY2hlYXRpbmcgaGVyZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlVGlsZUNsaWNrZWQoY2xpY2tlZE9uVGlsZXMubGVuZ3RoID4gMCA/IGNsaWNrZWRPblRpbGVzWzBdIDogbnVsbCk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgJChcIiNib2FyZFwiKS5vbihcImNsaWNrXCIsIG1vdXNlQ2xpY2spO1xyXG5cclxuICAgICAgICByZXNpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVUaWxlQ2xpY2tlZChjbGlja2VkT25UaWxlKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJoYW5kbGVUaWxlQ2xpY2tlZFwiLCBjbGlja2VkT25UaWxlKTtcclxuICAgICAgICBpZiAobnVsbCA9PT0gY2xpY2tlZE9uVGlsZSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBUT0RPKGRrZyk6IGNoZWNrIGlmIHRpbGUgaGFzIG5laWdoYm91cnMgd2l0aCB0aGUgc2FtZSBudW1iZXJcclxuICAgICAgICAvLyBpZiB5ZXMsIGluY3JlYXNlIGN1cnJlbnQgdGlsZSdzIG51bWJlciBhbmQgY29sbGFwc2UgYWxsIGNvbm5lY3RlZFxyXG4gICAgICAgIC8vIG5laWdoYm91cnMgd2l0aCB0aGUgc2FtZSBudW1iZXIgb250byB0aGUgdGlsZSAoYW5pbWF0ZSB0aGlzIGFzIHdlbGwpLlxyXG4gICAgICAgIC8vIFRoZW4gbGV0IGdyYXZpdHkgZHJvcCBkb3duIGFsbCB0aWxlcyB0aGF0IGFyZSBoYW5naW5nIGluIHRoZSBhaXIuXHJcbiAgICAgICAgLy8gQWZ0ZXIgdGhhdCBhZGQgZnJlc2ggdGlsZXMgdG8gdGhlIGJvYXJkIHVudGlsIGFsbCBlbXB0eSBzcGFjZXMgYXJlXHJcbiAgICAgICAgLy8gZmlsbGVkIHVwIGFnYWluIC0gbGV0IHRoZXNlIGRyb3AgZnJvbSB0aGUgdG9wIGFzIHdlbGwuXHJcblxyXG4gICAgICAgIGxldCBjb25uZWN0ZWRUaWxlcyA9IHRoaXMuZ2F0aGVyQ29ubmVjdGVkVGlsZXMoY2xpY2tlZE9uVGlsZSk7XHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBmb3IgZGVidWdnaW5nIHB1cnBvc2VzIGRpc3BsYXkgYSBvdmVybGF5IG9yIFxyXG4gICAgICAgIC8vICAgICAgICAgICAgZGlmZmVyZW50IGJvcmRlciBjb2xvciBmb3IgYWxsIGNvbm5lY3RlZCB0aWxlc1xyXG4gICAgICAgIC8vICAgICAgICAgICAgYXMgYSB3aG9sZSwgbm90IGZvciBlYWNoIGluZGl2aWR1YWwgb25lXHJcbiAgICAgICAgY29ubmVjdGVkVGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBhbmltYXRlIHRvIGNvbGxhcHNlIG9udG8gY2xpY2tlZCB0aWxlXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aWxlcyBhZnRlciBhbmltYXRpb25cclxuICAgICAgICAgICAgLy8gY291bnQgYW5kIGFkZCBwb2ludHNcclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgZ2FtZSBvdmVyXHJcbiAgICAgICAgICAgIHRpbGUuYW5pbWF0ZUNvbGxhcHNlVG8oY2xpY2tlZE9uVGlsZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcGxheSgpIHtcclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuICAgICAgICAvLyBUT0RPKGRrZyk6IHJlbW92ZSBkZXN0cm95ZWQgdGlsZXMgYW5kIGFkZCBuZXcgdGlsZXMgZnJvbSBhYm92ZSB0aGUgYm9hcmRcclxuICAgICAgICAvLyAgICAgICAgICAgIHdpdGggZ3Jhdml0eSBwdWxsaW5nIHRoZW0gZG93biBldGMuXHJcbiAgICAgICAgLy8gICAgICAgICAgICBvbmx5IGxldCB0aGUgcGxheWVyIGNvbnRpbnVlIHRvIHBsYXkgYWZ0ZXIgYWxsIGFuaW1hdGlvbnMgYXJlIGRvbmVcclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucGxheS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXREaW1zKCkge1xyXG4gICAgICAgIHJldHVybiBbcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50V2lkdGgsIDEwKSwgcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50SGVpZ2h0LCAxMCldO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJHYW1lOjpkcmF3XCIpO1xyXG4gICAgICAgIHRoaXMuZHJhd2luZyA9IHRydWU7XHJcblxyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLmN0eDtcclxuICAgICAgICBsZXQgW3csIGhdID0gdGhpcy5nZXREaW1zKCk7XHJcblxyXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdywgaCk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgdywgaCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBpbXBsZW1lbnQgdGhpcyFcclxuICAgICAgICAvLyBpZiB0aGUgd2lkdGggYW5kIGhlaWdodCBhcmUgTk9UIGEgbXVsdGlwbGUgb2YgZWl0aGVyIEJPQVJEX1dJRFRIIG9yXHJcbiAgICAgICAgLy8gQk9BUkRfSEVJR0hUIHdlIG5lZWQgdG8gdXNlIHRoZSB2YWx1ZXMgdGhhdCBmaXQgYW5kIFwibW92ZVwiIHRoZSB0b3AgXHJcbiAgICAgICAgLy8gYW5kIGxlZnQgb2YgdGhlIGJvYXJkIGEgYml0IGFuZCBpbnRyb2R1Y2UgYSBibGFjayBib3JkZXIgdGhhdCBmaWxsc1xyXG4gICAgICAgIC8vIHVwIHRoZSBleHRyYW5vdXMgXCJzcGFjZSFcclxuICAgICAgICAvLyBBbHNvLCBtb3ZlIHRoZSBib2FyZCBhcmVhIHRvIHRoZSBjZW50ZXIgaWYgdGhlcmUgaXMgbW9yZSBjYW52YXMgc3BhY2VcclxuICAgICAgICAvLyB0aGFuIG5lZWRlZCB0byBkaXNwbGF5IHRoZSBib2FyZC5cclxuICAgICAgICBcclxuICAgICAgICAvLyBkcmF3IGluZGl2aWR1YWwgdGlsZXMgLSBvbmx5IHRoZSB0cmFja2VkIG9uZSBzaG91bGQgYmUgZHJhd24gb3ZlclxyXG4gICAgICAgIC8vIGFsbCBvdGhlciB0aWxlcyBsYXN0LCBiZWNhdXNlIG90aGVyd2lzZSB0aGUgYm9yZGVyIG91dGxpbmUgaXNcclxuICAgICAgICAvLyBvdmVyZHJhd24gYnkgbmVpZ2hib3VyaW5nIHRpbGVzXHJcbiAgICAgICAgbGV0IGRlbGF5ZWREaXNwbGF5ID0gW107XHJcbiAgICAgICAgdGhpcy5ib2FyZC5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aWxlLnRyYWNrZWQpIHtcclxuICAgICAgICAgICAgICAgIGRlbGF5ZWREaXNwbGF5LnB1c2godGlsZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlLmRyYXcoY3R4LCB3LCBoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGRlbGF5ZWREaXNwbGF5LmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgdGlsZS5kcmF3KGN0eCwgdywgaCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd2luZyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJldHVybnMgdGhlIG5laWdoYm91cmluZyB0aWxlcyB0aGF0IGhhdmUgdGhlIHNhbWUgbnVtYmVyIGFzIHRoZSBwcm92aWRlZCB0aWxlXHJcbiAgICBmaW5kTmVpZ2hib3Vyc0ZvclRpbGUodGlsZSkge1xyXG4gICAgICAgIGxldCBuZWlnaGJvdXJzID0gW107XHJcblxyXG4gICAgICAgIGxldCBsZWZ0ID0gdGlsZS5jID4gMCA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYyAtIDEsIHRpbGUucikgOiBudWxsO1xyXG4gICAgICAgIGxldCB0b3AgPSB0aWxlLnIgPiAwID8gdGhpcy5nZXRUaWxlQXQodGlsZS5jLCB0aWxlLnIgLSAxKSA6IG51bGw7XHJcbiAgICAgICAgbGV0IHJpZ2h0ID0gdGlsZS5jIDwgQk9BUkRfV0lEVEgtMSA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYyArIDEsIHRpbGUucikgOiBudWxsO1xyXG4gICAgICAgIGxldCBib3R0b20gPSB0aWxlLnIgPCBCT0FSRF9IRUlHSFQtMSA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYywgdGlsZS5yICsgMSkgOiBudWxsO1xyXG5cclxuICAgICAgICBpZiAobnVsbCAhPSBsZWZ0ICYmIGxlZnQubnVtYmVyID09PSB0aWxlLm51bWJlcikgbmVpZ2hib3Vycy5wdXNoKGxlZnQpO1xyXG4gICAgICAgIGlmIChudWxsICE9IHRvcCAmJiB0b3AubnVtYmVyID09PSB0aWxlLm51bWJlcikgbmVpZ2hib3Vycy5wdXNoKHRvcCk7XHJcbiAgICAgICAgaWYgKG51bGwgIT0gcmlnaHQgJiYgcmlnaHQubnVtYmVyID09PSB0aWxlLm51bWJlcikgbmVpZ2hib3Vycy5wdXNoKHJpZ2h0KTtcclxuICAgICAgICBpZiAobnVsbCAhPSBib3R0b20gJiYgYm90dG9tLm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaChib3R0b20pO1xyXG5cclxuICAgICAgICByZXR1cm4gbmVpZ2hib3VycztcclxuICAgIH1cclxuXHJcbiAgICBnZXRUaWxlQXQoY29sdW1uLCByb3cpIHtcclxuICAgICAgICBsZXQgdGlsZSA9IHRoaXMuYm9hcmQuZmluZCgodCkgPT4gdC5jID09PSBjb2x1bW4gJiYgdC5yID09PSByb3cpO1xyXG4gICAgICAgIHJldHVybiAhIXRpbGUgPyB0aWxlIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGlsZXMgdGhhdCBzaGFyZSB0aGUgc2FtZSBudW1iZXIgYXMgdGhlIG9uZSBwcm92aWRlZFxyXG4gICAgLy8gYW5kIHRoYXQgYXJlIGNvbnRpbm91c2x5IGNvbm5lY3RlZCB0aHJvdWdob3V0IGVhY2ggb3RoZXIuXHJcbiAgICAvLyBJbXBvcnRhbnQ6IGJvYXJkIGJvcmRlcnMgYXJlIGN1dCBvZmYgcG9pbnRzIVxyXG4gICAgZ2F0aGVyQ29ubmVjdGVkVGlsZXModGlsZSkge1xyXG5cclxuICAgICAgICAvLyBBIGxpc3Qgb2YgYXJyYXkgaW5kaWNlcyB0aGF0IGFyZSBjb25uZWN0ZWQgdG8gdGhlIHRpbGVcclxuICAgICAgICAvLyBhbmQgZnVydGhlcm1vcmUgdG8gb3RoZXIgdGlsZXMgd2l0aCB0aGUgc2FtZSB2YWx1ZS9udW1iZXIuXHJcbiAgICAgICAgbGV0IGNvbm5lY3RlZCA9IFtdOyBcclxuXHJcbiAgICAgICAgLy8gU2VhcmNoZXMgdGhyb3VnaCBhbGwgbmVpZ2hib3VycyB0byBmaW5kIGFsbCBjb25uZWN0ZWQgdGlsZXMuXHJcbiAgICAgICAgbGV0IGNyYXdsID0gKHJvb3RUaWxlLCBjcmF3bGVkLCBpZ25vcmVSb290KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyb290VGlsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwicm9vdFRpbGUgbm90IHNldFwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbnVtID0gcm9vdFRpbGUubnVtYmVyO1xyXG4gICAgICAgICAgICBjcmF3bGVkLnB1c2gocm9vdFRpbGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5laWdoYm91cnMgPSB0aGlzLmZpbmROZWlnaGJvdXJzRm9yVGlsZShyb290VGlsZSksXHJcbiAgICAgICAgICAgICAgICBjb3VudGVkID0gbmVpZ2hib3Vycy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50ZWQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSBuZWlnaGJvdXJzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkeE9mID0gY3Jhd2xlZC5pbmRleE9mKHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkeE9mID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNyYXdsKHQsIGNyYXdsZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICBjcmF3bCh0aWxlLCBjb25uZWN0ZWQsIHRydWUpO1xyXG4gICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gaGF2ZSBvdXIgaW5pdGlhbCB0aWxlIGluIHRoZSByZXN1bHQgc2V0XHJcbiAgICAgICAgcmV0dXJuIGNvbm5lY3RlZC5maWx0ZXIoKHQpID0+ICEodC5yID09PSB0aWxlLnIgJiYgdC5jID09PSB0aWxlLmMpKTtcclxuICAgIH1cclxuICAgIFxyXG59IC8vIGNsYXNzIEdhbWVcclxuIiwiLypcclxuICogIFV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG4gXHJcbmxldCBnZXRSYW5kb21JbnQgPSAobWluLCBtYXggPSBmYWxzZSkgPT4ge1xyXG4gICAgaWYgKG1heCA9PT0gZmFsc2UpIHtcclxuICAgICAgICBtYXggPSBtaW47XHJcbiAgICAgICAgbWluID0gMDtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXJzZUludChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluLCAxMCk7XHJcbn07XHJcblxyXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMjA0MzIyOC8xOTMxNjVcclxuZnVuY3Rpb24gaXNEYXJrQ29sb3IoY29sb3IpIHtcclxuICAgIHZhciBjID0gY29sb3IubGVuZ3RoID09PSA2ID8gY29sb3IgOiBjb2xvci5zdWJzdHJpbmcoMSk7IC8vIHN0cmlwICNcclxuICAgIHZhciByZ2IgPSBwYXJzZUludChjLCAxNik7ICAgLy8gY29udmVydCBycmdnYmIgdG8gZGVjaW1hbFxyXG4gICAgdmFyIHIgPSAocmdiID4+IDE2KSAmIDB4ZmY7ICAvLyBleHRyYWN0IHJlZFxyXG4gICAgdmFyIGcgPSAocmdiID4+ICA4KSAmIDB4ZmY7ICAvLyBleHRyYWN0IGdyZWVuXHJcbiAgICB2YXIgYiA9IChyZ2IgPj4gIDApICYgMHhmZjsgIC8vIGV4dHJhY3QgYmx1ZVxyXG5cclxuICAgIC8vIHVzZSBhIHN0YW5kYXJkIGZvcm11bGEgdG8gY29udmVydCB0aGUgcmVzdWx0aW5nIFJHQiB2YWx1ZXMgaW50byB0aGVpciBwZXJjZWl2ZWQgYnJpZ2h0bmVzc1xyXG4gICAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUmVjLl83MDkjTHVtYV9jb2VmZmljaWVudHNcclxuICAgIHZhciBsdW1hID0gMC4yMTI2ICogciArIDAuNzE1MiAqIGcgKyAwLjA3MjIgKiBiOyAvLyBwZXIgSVRVLVIgQlQuNzA5XHJcblxyXG4gICAgLy8gY29uc29sZS5sb2coXCJsdW1hIGZvciBjb2xvcjpcIiwgY29sb3IsIGx1bWEpO1xyXG5cclxuICAgIHJldHVybiBsdW1hIDwgODA7IC8vIHRvbyBkYXJrIGlmIGx1bWEgaXMgc21hbGxlciB0aGFuIE5cclxufVxyXG5cclxuXHJcbmV4cG9ydCB7IGdldFJhbmRvbUludCwgaXNEYXJrQ29sb3IgfTtcclxuIl19
