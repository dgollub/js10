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

var MOVE_STEPS_IN_FRAMES = 30; // 30 or in 0.5 seconds, assuming 60 frames/sec

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
        this.moveInFrames = 0;
        this.destroy = false;
        this.tracked = false;
        this.increaseNumber = false;
        this.isCollapse = false;
        this.connectedCount = 0;
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
            if (this.number <= -1) {
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

                var dr = this.moveTo.r - this.r;
                var dc = this.moveTo.c - this.c;
                var dsr = dr / MOVE_STEPS_IN_FRAMES;
                var dsc = dc / MOVE_STEPS_IN_FRAMES;
                var stepsFractionRows = step * dsr;
                var stepsFractionColumns = step * dsc;
                var moveRowsInPixel = h * stepsFractionRows;
                var moveColsInPixel = w * stepsFractionColumns;

                // TODO(dkg): add check for "is the tile already on the position where it should be"
                var _ref2 = [l + moveColsInPixel, t + moveRowsInPixel];
                l = _ref2[0];
                t = _ref2[1];
                if (step >= this.moveInFrames) {
                    var _moveTo$canvasCoordinates = this.moveTo.canvasCoordinates(sw, sh);

                    var _moveTo$canvasCoordinates2 = _slicedToArray(_moveTo$canvasCoordinates, 2);

                    l = _moveTo$canvasCoordinates2[0];
                    t = _moveTo$canvasCoordinates2[1];

                    this.r = this.moveTo.r;
                    this.c = this.moveTo.c;

                    if (this.isCollapse) {
                        this.moveTo.increaseNumber = true;
                        this.destroy = true;
                        this.isCollapse = false;
                    }

                    this.stepsMoved = 0;
                    this.moveTo = false;
                }
            }

            var fillColor = MAGIC_COLORS[this.number - 1];
            var antiColor = (0, _utilsEs6.isDarkColor)(fillColor) ? "lightgray" : "black";

            ctx.lineWidth = 1;
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
        key: 'fallDownTo',
        value: function fallDownTo(targetTile) {
            this.moveTo = targetTile;
            this.stepsMoved = 0;
            this.moveInFrames = MOVE_STEPS_IN_FRAMES / 2;
            this.isCollapse = false;
        }
    }, {
        key: 'animateCollapseTo',
        value: function animateCollapseTo(targetTile) {
            this.moveTo = targetTile;
            this.stepsMoved = 0;
            this.moveInFrames = MOVE_STEPS_IN_FRAMES;
            this.isCollapse = true;
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

            // we were added at the top after other tiles fell down
            // so let's come in gently from the top
            if (this.r == -1) {
                t = th / 5.0;
            }

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

        this.blockInput = false;
        this.points = 0;
        $("#points").html('No points :-(');

        var tiles = (function () {
            var tiles = [];
            for (var counter = 0; counter < BOARD_TILES_COUNT; counter++) {
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

            if (_this.blockInput) {
                console.log("input blocked");
                return;
            }

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
            clickedOnTile.connectedCount = connectedTiles.length;
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
            var blockInput = false;
            // TODO(dkg): remove destroyed tiles and add new tiles from above the board
            //            with gravity pulling them down etc.
            //            only let the player continue to play after all animations are done
            var removed = 0;
            // if we have any destroyed tiles, remove them from the array
            // also increase any numbers if we need to
            for (var idx = this.board.length - 1; idx--;) {
                var tile = this.board[idx];
                if (tile.destroy === true) {
                    this.board.splice(idx, 1);
                    removed++;
                    continue;
                }
                // the user clicked on this tile, it was connected to others of
                // the same kind so we need to increase the number
                if (tile.increaseNumber === true) {
                    this.points += Math.ceil(Math.sqrt(Math.pow(tile.connectedCount + 1, 2) * Math.pow(tile.number, 2)));
                    tile.number++;
                    tile.increaseNumber = false;
                    $("#points").html('Points: ' + this.points);
                }
                // we are still animating
                if (tile.stepsMoved > 0) {
                    blockInput = true;
                    continue;
                }
                // check if we need to apply gravity to this tile
                // check if we are at the bottom row
                if (tile.r >= BOARD_HEIGHT - 1) continue;
                // check if we have "air" underneath us, then we can apply gravity and
                // fall down one spot
                // FIXME(dkg): Sometimes the tile above doesn't fall down.
                //             I feel that the check for 'is position empty and can I fall down'
                //             has some slight edge cases that causes this. Investigate!
                var tileUnderUs = this.getTileAt(tile.c, tile.r + 1);
                if (null == tileUnderUs) {
                    // console.log("apply gravity now", tile);
                    tile.fallDownTo(new Tile({ number: -1, r: tile.r + 1, c: tile.c }));
                    blockInput = true;
                } // else {} // there is a tile under us, so we can't fall down now
            }

            // re-add elements at top
            for (var col = 0; col < BOARD_WIDTH - 1; col++) {
                var tile = this.getTileAt(col, 0);
                if (null == tile) {
                    blockInput = true;
                    // TODO(dkg): figure out why this doesn't work - the gravity
                    //            is not applied in the next frame ...
                    this.board.push(new Tile({ number: 0, r: 0, c: col }));
                }
            }

            this.blockInput = blockInput;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGtnL0RldmVsb3BtZW50L3ByaXZhdGUvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCIvVXNlcnMvZGtnL0RldmVsb3BtZW50L3ByaXZhdGUvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiL1VzZXJzL2RrZy9EZXZlbG9wbWVudC9wcml2YXRlL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNHQSxZQUFZLENBQUM7O0FBRWIsU0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7QUFBRSxXQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUFFOztBQUVqRyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUwsWUFBWSxDQUFBLENBQUE7O0FBRTdCLElBQUksU0FBUyxHQUFHLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQU5qRCxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUE7O0FBRXZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBSXJCLElBQUksSUFBSSxHQUFHLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFVLENBQUM7QUFDdEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUdaLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxFQUFFLEVBQUs7O0FBRXBDLFdBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFbEMsUUFBSSxHQUFHLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFVLENBQUM7QUFDbEIsUUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0NBRWYsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FDYkgsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRTtBQUN6QyxTQUFLLEVBQUUsSUFBSTtDQUNkLENBQUMsQ0FBQzs7QUFFSCxJQUFJLGNBQWMsR0FBRyxDQUFDLFlBQVk7QUFBRSxhQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFO0FBQUUsWUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLEFBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEFBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEFBQUMsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLEFBQUMsSUFBSTtBQUFFLGlCQUFLLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFBLENBQUUsSUFBSSxDQUFBLEFBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxFQUFFO0FBQUUsb0JBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEFBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsTUFBTTthQUFFO1NBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUFFLGNBQUUsR0FBRyxJQUFJLENBQUMsQUFBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO1NBQUUsU0FBUztBQUFFLGdCQUFJO0FBQUUsb0JBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2FBQUUsU0FBUztBQUFFLG9CQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQzthQUFFO1NBQUUsQUFBQyxPQUFPLElBQUksQ0FBQztLQUFFLEFBQUMsT0FBTyxVQUFVLEdBQUcsRUFBRSxDQUFDLEVBQUU7QUFBRSxZQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVB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RlksU0FBQSxxQkFBQSxDQUFDLElBQUksRUFBRTtBQUN4QixnQkFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDOztBQUVwQixnQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2xFLGdCQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDakUsZ0JBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsV0FBVyxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDL0UsZ0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsWUFBWSxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7O0FBRWpGLGdCQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkUsZ0JBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwRSxnQkFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssSUFB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LCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcclxuICAgIEVTNiBjb2RlIGVudHJ5IHBvaW50XHJcbiovXHJcbmNvbnN0IFZFUlNJT04gPSBcIjAuMC4yXCJcclxuXHJcbmNvbnNvbGUubG9nKFZFUlNJT04pO1xyXG5cclxuaW1wb3J0IEdhbWUgZnJvbSAnLi9nYW1lLmVzNic7XHJcblxyXG5sZXQgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbmdhbWUucGxheSgpO1xyXG5cclxuXHJcbiQoXCIjYnV0dG9uUmVzdGFydFwiKS5vbihcImNsaWNrXCIsIChldikgPT4ge1xyXG5cclxuICAgIGNvbnNvbGUuaW5mbyhcIj09PT4gUkVTVEFSVCBHQU1FXCIpO1xyXG5cclxuICAgIGdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgZ2FtZS5wbGF5KCk7XHJcblxyXG59KTtcclxuXHJcbiIsIi8qXHJcbiAgICBUaGUgZ2FtZSBjb2RlIGFuZCBsb2dpYywgd2l0aCBVSSBoYW5kbGluZy5cclxuICAgIFRPRE8oZGtnKTogdXNlIHRoZSBmb2xsb3dpbmcgdGVjaG5pcXVlc1xyXG4gICAgICAgIC0gZ2VuZXJhdG9ycyBhbmQgeWllbGRcclxuICAgICAgICAtIFN5bWJvbHNcclxuKi9cclxuXHJcbmltcG9ydCB7IGdldFJhbmRvbUludCwgaXNEYXJrQ29sb3IgfSBmcm9tICcuL3V0aWxzLmVzNic7XHJcblxyXG4vLyB0aGVzZSBhcmUgbm90IGluIHBpeGVsLCBidXQgcmF0aGVyIG91ciBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiB1bml0c1xyXG4vLyB0aGlzIG1lYW5zIE4gPSBOIG51bWJlciBvZiBpdGVtcywgZS5nLiAxMCA9IDEwIGl0ZW1zLCBub3QgMTAgcGl4ZWxzXHJcbi8vIHRoZSBkcmF3KCkgY2FsbCB3aWxsIGNvbnZlcnQgdGhvc2UgaW50byBwcm9wZXIgcGl4ZWxzXHJcbmNvbnN0IEJPQVJEX1dJRFRIID0gMTA7XHJcbmNvbnN0IEJPQVJEX0hFSUdIVCA9IDEwO1xyXG5jb25zdCBCT0FSRF9USUxFU19DT1VOVCA9IEJPQVJEX1dJRFRIICogQk9BUkRfSEVJR0hUO1xyXG5cclxuY29uc3QgQ09MT1JTID0gKCgpID0+IHtcclxuICAgIC8vIFRPRE8oZGtnKTogZWxpbWluYXRlIGNvbG9ycyB0aGF0IGFyZSB0b28gY2xvc2UgdG8gZWFjaCBvdGhlciBhbmQvb3IgZHVwbGljYXRlc1xyXG4gICAgbGV0IGlubmVyID0gKCkgPT4ge1xyXG4gICAgICAgIGxldCByZ2IgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdiA9IChwYXJzZUludChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTUpLCAxMCkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICAgICAgaWYgKHYubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgIHYgPSBgMCR7dn1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJnYi5wdXNoKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByZXR1cm4gJ3JnYignKyByZ2Iuam9pbignLCcpICsnKSc7XHJcbiAgICAgICAgcmV0dXJuICcjJyArIHJnYi5qb2luKFwiXCIpO1xyXG4gICAgfVxyXG4gICAgbGV0IHJldCA9IFtdO1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCAxMDAwOyB4KyspIHtcclxuICAgICAgICByZXQucHVzaChpbm5lcigpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbn0pKCk7XHJcblxyXG5sZXQgX3JuZENvbG9yID0gMDtcclxubGV0IGdldENvbG9yID0gKGlkeCA9IC0xKSA9PiB7XHJcbiAgICBpZiAoX3JuZENvbG9yID49IENPTE9SUy5sZW5ndGgpXHJcbiAgICAgICAgX3JuZENvbG9yID0gMDtcclxuICAgIGlmIChpZHggPiAtMSAmJiBpZHggPCBDT0xPUlMubGVuZ3RoKVxyXG4gICAgICAgIHJldHVybiBDT0xPUlNbaWR4XTtcclxuICAgIHJldHVybiBDT0xPUlNbX3JuZENvbG9yKytdO1xyXG59O1xyXG5cclxuY29uc3QgTUFHSUNfQ09MT1JTID0gKCgpID0+IHtcclxuICAgIGxldCByZXQgPSBbXTtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgNTA7IHgrKykge1xyXG4gICAgICAgIHJldC5wdXNoKGdldENvbG9yKHgpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbn0pKCk7XHJcbmNvbnN0IE1BR0lDX0NPTE9SU19SRVZFUlNFID0gKCgpID0+IHtcclxuICAgIHJldHVybiBbLi4uTUFHSUNfQ09MT1JTXS5yZXZlcnNlKCk7XHJcbn0pKCk7XHJcblxyXG5jb25zdCBNT1ZFX1NURVBTX0lOX0ZSQU1FUyA9IDMwOyAgLy8gMzAgb3IgaW4gMC41IHNlY29uZHMsIGFzc3VtaW5nIDYwIGZyYW1lcy9zZWNcclxuXHJcbi8vIGNvbnNvbGUubG9nKE1BR0lDX0NPTE9SUyk7XHJcblxyXG5jbGFzcyBUaWxlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih7IG51bWJlciA9IDAsIGMgPSAwLCByID0gMCB9ID0ge30pIHtcclxuICAgICAgICB0aGlzLm51bWJlciA9IG51bWJlciB8fCBnZXRSYW5kb21JbnQoMSwgMyk7XHJcbiAgICAgICAgLy8gaW4gY29sL3JvdyBjb29yZGluYXRlcywgdGhhdCBpcyBpbiBvdXIgb3duIGludGVybmFsIHVuaXRzXHJcbiAgICAgICAgdGhpcy5jID0gYztcclxuICAgICAgICB0aGlzLnIgPSByO1xyXG4gICAgICAgIHRoaXMubW92ZVRvID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UG9zaXRpb24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gNDsgLy8gcmFuZG9tIG51bWJlciwgaGlkZGVuIHhrY2QgcmVmZXJlbmNlXHJcbiAgICAgICAgdGhpcy5zdGVwc01vdmVkID0gMDtcclxuICAgICAgICB0aGlzLm1vdmVJbkZyYW1lcyA9IDA7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50cmFja2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pbmNyZWFzZU51bWJlciA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNDb2xsYXBzZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY29ubmVjdGVkQ291bnQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNhbGxlZCBvbmNlIHBlciBmcmFtZSAtIG9ubHkgb25jZSBwZXIgZnJhbWUhXHJcbiAgICBkcmF3KGN0eCwgc3csIHNoKSB7XHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiByYW5kb21pemUgY29sb3IgYWNjb3JkaW5nIHRvIHRoaXMubnVtYmVyXHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBpbXBsZW1lbnQgdGlsZSBkZXN0cnVjdGlvbiBhbmQgYWRkaW5nIG5ldyB0aWxlcyBmcm9tIGFib3ZlXHJcbiAgICAgICAgLy8gICAgICAgICAgICBXb3VsZCBiZSBjb29sIGlmIHRoZSB0aWxlIHdvdWxkIGV4cGxvZGUgaW4gaHVnZSBleHBsb3Npb25cclxuICAgICAgICAvLyAgICAgICAgICAgIGJ1dCBvbmx5IGlmIHRoZSBudW1iZXIgaXMgOSBhbmQgaXQgd291bGQgYmVjb21lIGEgMTAuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm51bWJlciA8PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgW3csIGhdID0gdGhpcy50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgIC8vIHRoZXNlIGFyZSB0aGUgb3JpZ2luYWwgcGl4ZWwgY29vcmRzIC0gdGhleSBuZWVkIHRvIGJlIGFkanVzdGVkXHJcbiAgICAgICAgLy8gd2hlbiB3ZSBoYXZlIHRvIGNvbGxhcHNlXHJcbiAgICAgICAgbGV0IFtsLCB0XSA9IHRoaXMuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5tb3ZlVG8pIHtcclxuICAgICAgICAgICAgLy8gVE9ETyhka2cpOiBDaGVjayBpZiB3ZSBhcmUgYWxyZWFkeSBpbiB0aGUgY29ycmVjdCBzcG90IGFuZFxyXG4gICAgICAgICAgICAvLyAgICAgICAgICAgIGlmIHdlIGFyZSwganVzdCBtYXJrIHVzIGFzIGRlc3Ryb3llZC5cclxuXHJcbiAgICAgICAgICAgIC8vIE5PVEUoZGtnKTogYW5pbWF0aW9uIGlkZWEgLSBoYXZlIHRoZSB0aWxlcyBzaHJpbmsgYW5kIGRpc2FwcGVhciBpbnN0ZWFkIG1heWJlP1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETyhka2cpOiBmaWd1cmUgb3V0IGhvdyB0byBhZGQgdmVsb2NpdHkgaW50byB0aGUgY29kZSBiZWxvd1xyXG5cclxuICAgICAgICAgICAgLy8gc3RlcHNNb3ZlZCBpcyBpbXBvcnRhbnQsIGFzIHdlIHdhbnQgdG8ga2VlcCB0cmFjayBob3cgZmFyXHJcbiAgICAgICAgICAgIC8vIHdlIGFyZSBpbnRvIHRoZSBhbmltYXRpb24gY3ljbGUgZm9yIHRoaXMgbW92ZSwgZXZlbiB3aGVuIHRoZSBcclxuICAgICAgICAgICAgLy8gdXNlciBjaGFuZ2VzIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cgYW5kIHRoZXJlZm9yZSB0aGUgY2FudmFzIGRpbWVuc2lvbnNcclxuICAgICAgICAgICAgbGV0IHN0ZXAgPSArK3RoaXMuc3RlcHNNb3ZlZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBbZHIsIGRjXSA9IFt0aGlzLm1vdmVUby5yIC0gdGhpcy5yLCB0aGlzLm1vdmVUby5jIC0gdGhpcy5jXTtcclxuICAgICAgICAgICAgbGV0IFtkc3IsIGRzY10gPSBbZHIgLyBNT1ZFX1NURVBTX0lOX0ZSQU1FUywgZGMgLyBNT1ZFX1NURVBTX0lOX0ZSQU1FU107XHJcbiAgICAgICAgICAgIGxldCBbc3RlcHNGcmFjdGlvblJvd3MsIHN0ZXBzRnJhY3Rpb25Db2x1bW5zXSA9IFsgc3RlcCAqIGRzciwgc3RlcCAqIGRzYyBdOyBcclxuICAgICAgICAgICAgbGV0IFttb3ZlUm93c0luUGl4ZWwsIG1vdmVDb2xzSW5QaXhlbF0gPSBbaCAqIHN0ZXBzRnJhY3Rpb25Sb3dzLCB3ICogc3RlcHNGcmFjdGlvbkNvbHVtbnNdO1xyXG5cclxuICAgICAgICAgICAgW2wsIHRdID0gW2wgKyBtb3ZlQ29sc0luUGl4ZWwsIHQgKyBtb3ZlUm93c0luUGl4ZWxdO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETyhka2cpOiBhZGQgY2hlY2sgZm9yIFwiaXMgdGhlIHRpbGUgYWxyZWFkeSBvbiB0aGUgcG9zaXRpb24gd2hlcmUgaXQgc2hvdWxkIGJlXCJcclxuICAgICAgICAgICAgaWYgKHN0ZXAgPj0gdGhpcy5tb3ZlSW5GcmFtZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBbbCwgdF0gPSB0aGlzLm1vdmVUby5jYW52YXNDb29yZGluYXRlcyhzdywgc2gpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuciA9IHRoaXMubW92ZVRvLnI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmMgPSB0aGlzLm1vdmVUby5jO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0NvbGxhcHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlVG8uaW5jcmVhc2VOdW1iZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NvbGxhcHNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGVwc01vdmVkID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZVRvID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IFxyXG5cclxuICAgICAgICBsZXQgZmlsbENvbG9yID0gTUFHSUNfQ09MT1JTW3RoaXMubnVtYmVyLTFdO1xyXG4gICAgICAgIGxldCBhbnRpQ29sb3IgPSBpc0RhcmtDb2xvcihmaWxsQ29sb3IpID8gXCJsaWdodGdyYXlcIiA6IFwiYmxhY2tcIjtcclxuXHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvcjtcclxuICAgICAgICBjdHguZmlsbFJlY3QobCwgdCwgdywgaCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRyYWNrZWQpIHtcclxuICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDQ7XHJcbiAgICAgICAgICAgIC8vIGN0eC5zdHJva2VTdHlsZSA9IE1BR0lDX0NPTE9SU19SRVZFUlNFW3RoaXMubnVtYmVyLTFdO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBhbnRpQ29sb3I7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VSZWN0KGwsIHQsIHcsIGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gd3JpdGUgdGhlIG51bWJlciBpbiB0aGUgY2VudGVyIG9mIHRoZSB0aWxlXHJcbiAgICAgICAgbGV0IFt4LCB5XSA9IFtcclxuICAgICAgICAgICAgbCArIE1hdGguY2VpbCh3IC8gMi4wKSwgXHJcbiAgICAgICAgICAgIHQgKyBNYXRoLmNlaWwoaCAvIDIuMClcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICAvLyBjdHguZmlsbFN0eWxlID0gTUFHSUNfQ09MT1JTX1JFVkVSU0VbdGhpcy5udW1iZXJdO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBhbnRpQ29sb3I7XHJcbiAgICAgICAgY3R4LmZvbnQgPSBcIjMycHggY291cmllclwiO1xyXG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLm51bWJlciwgeCwgeSk7XHJcbiAgICB9XHJcblxyXG4gICAgZmFsbERvd25Ubyh0YXJnZXRUaWxlKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG8gPSB0YXJnZXRUaWxlO1xyXG4gICAgICAgIHRoaXMuc3RlcHNNb3ZlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZlSW5GcmFtZXMgPSBNT1ZFX1NURVBTX0lOX0ZSQU1FUyAvIDI7XHJcbiAgICAgICAgdGhpcy5pc0NvbGxhcHNlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYW5pbWF0ZUNvbGxhcHNlVG8odGFyZ2V0VGlsZSkge1xyXG4gICAgICAgIHRoaXMubW92ZVRvID0gdGFyZ2V0VGlsZTtcclxuICAgICAgICB0aGlzLnN0ZXBzTW92ZWQgPSAwO1xyXG4gICAgICAgIHRoaXMubW92ZUluRnJhbWVzID0gTU9WRV9TVEVQU19JTl9GUkFNRVM7XHJcbiAgICAgICAgdGhpcy5pc0NvbGxhcHNlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjYW52YXNDb29yZGluYXRlcyhzdywgc2gpIHtcclxuICAgICAgICAvLyByZXR1cm4gdGhlIGN1cnJlbnQgdGlsZSBwb3NpdGlvbiBpbiBwaXhlbFxyXG4gICAgICAgIGxldCBbdHcsIHRoXSA9IHRoaXMudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBjYWxjIHRoZSB0b3AgYW5kIGxlZnQgY29vcmRpbmF0ZXMgaW4gcGl4ZWwgKHRvcC1sZWZ0IGlzIDAsIDAgaW4gb3VyIGNvb3JkaW5hdGUgc3lzdGVtXHJcbiAgICAgICAgLy8gYW5kIGJvdHRvbS1yaWdodCBpcyBvdXIgc2NyZWVuX2hlaWdodC1zY3JlZW5fd2lkdGgpXHJcbiAgICAgICAgLy8gdGhpcyBkZXBlbmRzIG9uIHRoZSB0aWxlcyBwb3NpdGlvbiAoaW4gY29sL3JvdyBjb29yZHMpXHJcbiAgICAgICAgLy8gSW4gY2FzZSB3ZSBhcmUgbW92aW5nL2NvbGxhcHNpbmcgb250byBhbm90aGVyIHRpbGUsIHdlIHdpbGwgbmVlZFxyXG4gICAgICAgIC8vIHRvIG1vdmUgb25jZSBwZXIgZnJhbWUgaW50byBhIGNlcnRhaW4gZGlyZWN0aW9uLlxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBbbCwgdF0gPSBbXHJcbiAgICAgICAgICAgIHRoaXMuYyAqIHR3LFxyXG4gICAgICAgICAgICB0aGlzLnIgKiB0aFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIC8vIHdlIHdlcmUgYWRkZWQgYXQgdGhlIHRvcCBhZnRlciBvdGhlciB0aWxlcyBmZWxsIGRvd25cclxuICAgICAgICAvLyBzbyBsZXQncyBjb21lIGluIGdlbnRseSBmcm9tIHRoZSB0b3BcclxuICAgICAgICBpZiAodGhpcy5yID09IC0xKSB7XHJcbiAgICAgICAgICAgIHQgPSB0aCAvIDUuMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBbbCwgdF07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRpbGVEaW1lbnNpb25zKHN3LCBzaCkge1xyXG4gICAgICAgIC8vIGNhbGMgdGlsZSB3aWR0aCBhbmQgaGVpZ2h0IGluIHBpeGVscyBmb3Igb25lIHRpbGVcclxuICAgICAgICAvLyBERVBFTkRJTkcgb24gdGhlIGN1cnJlbnQgc2NyZWVuIG9yIGJvYXJkIGRpbWVuc2lvbiFcclxuICAgICAgICAvLyBzdzogc2NyZWVuIG9yIGJvYXJkIHdpZHRoIGluIHBpeGVsXHJcbiAgICAgICAgLy8gc2g6IHNjcmVlbiBvciBib2FyZCBoZWlnaHQgaW4gcGl4ZWxcclxuICAgICAgICBcclxuICAgICAgICBsZXQgW3R3LCB0aF0gPSBbTWF0aC5jZWlsKHN3IC8gQk9BUkRfV0lEVEgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNlaWwoc2ggLyBCT0FSRF9IRUlHSFQpXTtcclxuICAgICAgICByZXR1cm4gW3R3LCB0aF07XHJcbiAgICB9XHJcbn0gLy8gY2xhc3MgVGlsZVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5ibG9ja0lucHV0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wb2ludHMgPSAwO1xyXG4gICAgICAgICQoXCIjcG9pbnRzXCIpLmh0bWwoYE5vIHBvaW50cyA6LShgKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgdGlsZXMgPSAoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdGlsZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY291bnRlciA9IDA7IGNvdW50ZXIgPCBCT0FSRF9USUxFU19DT1VOVDsgY291bnRlcisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IFtjb2x1bW4sIHJvd10gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoY291bnRlciAlIEJPQVJEX1dJRFRILCAxMCksICAgICAgICAgICAgICAvLyBwb3NpdGlvbiBpbiBjb2x1bW5cclxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChNYXRoLmZsb29yKGNvdW50ZXIgLyBCT0FSRF9IRUlHSFQpLCAxMCksIC8vIHBvc2l0aW9uIGluIHJvd1xyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGlsZSA9IG5ldyBUaWxlKHsgbnVtYmVyOiBnZXRSYW5kb21JbnQoMSwgMyksIGM6IGNvbHVtbiwgcjogcm93IH0pO1xyXG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaCh0aWxlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGlsZXM7XHJcbiAgICAgICAgfSkoKTtcclxuICAgICAgICB0aGlzLmJvYXJkID0gdGlsZXM7XHJcbiAgICBcclxuICAgICAgICBsZXQgYm9hcmRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2FyZFwiKTtcclxuICAgICAgICBsZXQgY29udGV4dCA9IGJvYXJkRWxlbWVudC5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgICAgIHRoaXMuY3R4ID0gY29udGV4dDtcclxuICAgICAgICB0aGlzLmJvYXJkRWxlbWVudCA9IGJvYXJkRWxlbWVudDtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCByZXNpemUgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IFt3dywgd2hdID0gWyQod2luZG93KS53aWR0aCgpLCAkKHdpbmRvdykuaGVpZ2h0KCldO1xyXG4gICAgICAgICAgICBsZXQgbWFyZ2luID0gMjAwO1xyXG4gICAgICAgICAgICBsZXQgJGJvYXJkID0gJChcIiNib2FyZFwiKTtcclxuICAgICAgICAgICAgJGJvYXJkLmhlaWdodChgJHt3aC1tYXJnaW59cHhgKTtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHdoLW1hcmdpbjtcclxuICAgICAgICAgICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gJGJvYXJkLndpZHRoKCk7IC8vIHRoaXMgc2hvdWxkIHRha2UgbWFyZ2lucyBhbmQgQ1NTIGludG8gYWNjb3VudFxyXG4gICAgICAgICAgICAvLyB0aGlzLmRyYXcoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCByZXNpemUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBnZXRNb3VzZUNvb3JkaW5hdGVzID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBldmVudCA9IGV2IHx8IHdpbmRvdy5ldmVudDsgLy8gSUUtaXNtXHJcbiAgICAgICAgICAgIC8vIElmIHBhZ2VYL1kgYXJlbid0IGF2YWlsYWJsZSBhbmQgY2xpZW50WC9ZIGFyZSxcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHBhZ2VYL1kgLSBsb2dpYyB0YWtlbiBmcm9tIGpRdWVyeS5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LnBhZ2VYID09IG51bGwgJiYgZXZlbnQuY2xpZW50WCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXZlbnREb2MgPSAoZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnRhcmdldC5vd25lckRvY3VtZW50KSB8fCBkb2N1bWVudCxcclxuICAgICAgICAgICAgICAgICAgICBkb2MgPSBldmVudERvYy5kb2N1bWVudEVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IGV2ZW50RG9jLmJvZHk7XHJcblxyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFnZVggPSBldmVudC5jbGllbnRYICtcclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2Muc2Nyb2xsTGVmdCB8fCBib2R5ICYmIGJvZHkuc2Nyb2xsTGVmdCB8fCAwKSAtXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLmNsaWVudExlZnQgfHwgYm9keSAmJiBib2R5LmNsaWVudExlZnQgfHwgMCk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWdlWSA9IGV2ZW50LmNsaWVudFkgK1xyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5zY3JvbGxUb3AgIHx8IGJvZHkgJiYgYm9keS5zY3JvbGxUb3AgIHx8IDApIC1cclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2MuY2xpZW50VG9wICB8fCBib2R5ICYmIGJvZHkuY2xpZW50VG9wICB8fCAwICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBwYXJlbnRPZmZzZXQgPSAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkub2Zmc2V0KCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbW91c2VQb3MgPSB7XHJcbiAgICAgICAgICAgICAgICB4OiBldmVudC5wYWdlWCAtIHBhcmVudE9mZnNldC5sZWZ0LFxyXG4gICAgICAgICAgICAgICAgeTogZXZlbnQucGFnZVkgLSBwYXJlbnRPZmZzZXQudG9wXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1vdXNlIG1vdmVkXCIsIG1vdXNlUG9zLngsIG1vdXNlUG9zLnkpO1xyXG4gICAgICAgICAgICByZXR1cm4gbW91c2VQb3M7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG1vdXNlVHJhY2tlciA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgbW91c2VQb3MgPSBnZXRNb3VzZUNvb3JkaW5hdGVzKGV2KSxcclxuICAgICAgICAgICAgICAgIGRpbXMgPSB0aGlzLmdldERpbXMoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYm9hcmQuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGlsZS50cmFja2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRpbGUuZGVzdHJveSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyB0aGUgbW91c2VQb3MgaXMgaW4gcGl4ZWwgY29vcmRzXHJcbiAgICAgICAgICAgICAgICBsZXQgW3N3LCBzaF0gPSBkaW1zO1xyXG4gICAgICAgICAgICAgICAgbGV0IFt0dywgdGhdID0gdGlsZS50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgICAgICAgICAgbGV0IFt0bCwgdHRdID0gdGlsZS5jYW52YXNDb29yZGluYXRlcyhzdywgc2gpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChtb3VzZVBvcy54ID49IHRsICYmIG1vdXNlUG9zLnggPD0gKHRsICsgdHcpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VQb3MueSA+PSB0dCAmJiBtb3VzZVBvcy55IDw9ICh0dCArIHRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbGUudHJhY2tlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQoXCIjYm9hcmRcIikub24oXCJtb3VzZW1vdmVcIiwgbW91c2VUcmFja2VyKTtcclxuXHJcbiAgICAgICAgbGV0IG1vdXNlQ2xpY2sgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJsb2NrSW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaW5wdXQgYmxvY2tlZFwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gaWYgKHRoaXMuZHJhd2luZyAhPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJJZ25vcmVkIG1vdXNlIGNsaWNrIGJlY2F1c2UgSSB3YXMgZHJhd2luZy5cIik7XHJcbiAgICAgICAgICAgICAgICAvLyByZXR1cm47XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBtb3VzZVBvcyA9IGdldE1vdXNlQ29vcmRpbmF0ZXMoZXYpLFxyXG4gICAgICAgICAgICAgICAgZGltcyA9IHRoaXMuZ2V0RGltcygpO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNsaWNrZWQgaGVyZVwiLCBtb3VzZVBvcyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY2xpY2tlZE9uVGlsZXMgPSB0aGlzLmJvYXJkLmZpbHRlcigodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbGUudHJhY2tlZDsgLy8gd2UgYXJlIGNoZWF0aW5nIGhlcmVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVRpbGVDbGlja2VkKGNsaWNrZWRPblRpbGVzLmxlbmd0aCA+IDAgPyBjbGlja2VkT25UaWxlc1swXSA6IG51bGwpO1xyXG5cclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICQoXCIjYm9hcmRcIikub24oXCJjbGlja1wiLCBtb3VzZUNsaWNrKTtcclxuXHJcbiAgICAgICAgcmVzaXplKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlVGlsZUNsaWNrZWQoY2xpY2tlZE9uVGlsZSkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaGFuZGxlVGlsZUNsaWNrZWRcIiwgY2xpY2tlZE9uVGlsZSk7XHJcbiAgICAgICAgaWYgKG51bGwgPT09IGNsaWNrZWRPblRpbGUpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBjaGVjayBpZiB0aWxlIGhhcyBuZWlnaGJvdXJzIHdpdGggdGhlIHNhbWUgbnVtYmVyXHJcbiAgICAgICAgLy8gaWYgeWVzLCBpbmNyZWFzZSBjdXJyZW50IHRpbGUncyBudW1iZXIgYW5kIGNvbGxhcHNlIGFsbCBjb25uZWN0ZWRcclxuICAgICAgICAvLyBuZWlnaGJvdXJzIHdpdGggdGhlIHNhbWUgbnVtYmVyIG9udG8gdGhlIHRpbGUgKGFuaW1hdGUgdGhpcyBhcyB3ZWxsKS5cclxuICAgICAgICAvLyBUaGVuIGxldCBncmF2aXR5IGRyb3AgZG93biBhbGwgdGlsZXMgdGhhdCBhcmUgaGFuZ2luZyBpbiB0aGUgYWlyLlxyXG4gICAgICAgIC8vIEFmdGVyIHRoYXQgYWRkIGZyZXNoIHRpbGVzIHRvIHRoZSBib2FyZCB1bnRpbCBhbGwgZW1wdHkgc3BhY2VzIGFyZVxyXG4gICAgICAgIC8vIGZpbGxlZCB1cCBhZ2FpbiAtIGxldCB0aGVzZSBkcm9wIGZyb20gdGhlIHRvcCBhcyB3ZWxsLlxyXG5cclxuICAgICAgICBsZXQgY29ubmVjdGVkVGlsZXMgPSB0aGlzLmdhdGhlckNvbm5lY3RlZFRpbGVzKGNsaWNrZWRPblRpbGUpO1xyXG4gICAgICAgIGNsaWNrZWRPblRpbGUuY29ubmVjdGVkQ291bnQgPSBjb25uZWN0ZWRUaWxlcy5sZW5ndGg7XHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBmb3IgZGVidWdnaW5nIHB1cnBvc2VzIGRpc3BsYXkgYSBvdmVybGF5IG9yIFxyXG4gICAgICAgIC8vICAgICAgICAgICAgZGlmZmVyZW50IGJvcmRlciBjb2xvciBmb3IgYWxsIGNvbm5lY3RlZCB0aWxlc1xyXG4gICAgICAgIC8vICAgICAgICAgICAgYXMgYSB3aG9sZSwgbm90IGZvciBlYWNoIGluZGl2aWR1YWwgb25lXHJcbiAgICAgICAgY29ubmVjdGVkVGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBhbmltYXRlIHRvIGNvbGxhcHNlIG9udG8gY2xpY2tlZCB0aWxlXHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aWxlcyBhZnRlciBhbmltYXRpb25cclxuICAgICAgICAgICAgLy8gY291bnQgYW5kIGFkZCBwb2ludHNcclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgZ2FtZSBvdmVyXHJcbiAgICAgICAgICAgIHRpbGUuYW5pbWF0ZUNvbGxhcHNlVG8oY2xpY2tlZE9uVGlsZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcGxheSgpIHtcclxuICAgICAgICBsZXQgYmxvY2tJbnB1dCA9IGZhbHNlO1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogcmVtb3ZlIGRlc3Ryb3llZCB0aWxlcyBhbmQgYWRkIG5ldyB0aWxlcyBmcm9tIGFib3ZlIHRoZSBib2FyZFxyXG4gICAgICAgIC8vICAgICAgICAgICAgd2l0aCBncmF2aXR5IHB1bGxpbmcgdGhlbSBkb3duIGV0Yy5cclxuICAgICAgICAvLyAgICAgICAgICAgIG9ubHkgbGV0IHRoZSBwbGF5ZXIgY29udGludWUgdG8gcGxheSBhZnRlciBhbGwgYW5pbWF0aW9ucyBhcmUgZG9uZVxyXG4gICAgICAgIGxldCByZW1vdmVkID0gMDtcclxuICAgICAgICAvLyBpZiB3ZSBoYXZlIGFueSBkZXN0cm95ZWQgdGlsZXMsIHJlbW92ZSB0aGVtIGZyb20gdGhlIGFycmF5XHJcbiAgICAgICAgLy8gYWxzbyBpbmNyZWFzZSBhbnkgbnVtYmVycyBpZiB3ZSBuZWVkIHRvXHJcbiAgICAgICAgZm9yIChsZXQgaWR4ID0gdGhpcy5ib2FyZC5sZW5ndGgtMTsgaWR4LS07KSB7XHJcbiAgICAgICAgICAgIGxldCB0aWxlID0gdGhpcy5ib2FyZFtpZHhdO1xyXG4gICAgICAgICAgICBpZiAodGlsZS5kZXN0cm95ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnNwbGljZShpZHgsIDEpO1xyXG4gICAgICAgICAgICAgICAgcmVtb3ZlZCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gdGhlIHVzZXIgY2xpY2tlZCBvbiB0aGlzIHRpbGUsIGl0IHdhcyBjb25uZWN0ZWQgdG8gb3RoZXJzIG9mXHJcbiAgICAgICAgICAgIC8vIHRoZSBzYW1lIGtpbmQgc28gd2UgbmVlZCB0byBpbmNyZWFzZSB0aGUgbnVtYmVyXHJcbiAgICAgICAgICAgIGlmICh0aWxlLmluY3JlYXNlTnVtYmVyID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50cyArPSBNYXRoLmNlaWwoTWF0aC5zcXJ0KCgodGlsZS5jb25uZWN0ZWRDb3VudCArIDEpKioyKSAqICh0aWxlLm51bWJlcioqMikpKTtcclxuICAgICAgICAgICAgICAgIHRpbGUubnVtYmVyKys7XHJcbiAgICAgICAgICAgICAgICB0aWxlLmluY3JlYXNlTnVtYmVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAkKFwiI3BvaW50c1wiKS5odG1sKGBQb2ludHM6ICR7dGhpcy5wb2ludHN9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gd2UgYXJlIHN0aWxsIGFuaW1hdGluZ1xyXG4gICAgICAgICAgICBpZiAodGlsZS5zdGVwc01vdmVkID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYmxvY2tJbnB1dCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiB3ZSBuZWVkIHRvIGFwcGx5IGdyYXZpdHkgdG8gdGhpcyB0aWxlXHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHdlIGFyZSBhdCB0aGUgYm90dG9tIHJvd1xyXG4gICAgICAgICAgICBpZiAodGlsZS5yID49IEJPQVJEX0hFSUdIVCAtIDEpIFxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHdlIGhhdmUgXCJhaXJcIiB1bmRlcm5lYXRoIHVzLCB0aGVuIHdlIGNhbiBhcHBseSBncmF2aXR5IGFuZFxyXG4gICAgICAgICAgICAvLyBmYWxsIGRvd24gb25lIHNwb3RcclxuICAgICAgICAgICAgLy8gRklYTUUoZGtnKTogU29tZXRpbWVzIHRoZSB0aWxlIGFib3ZlIGRvZXNuJ3QgZmFsbCBkb3duLlxyXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBJIGZlZWwgdGhhdCB0aGUgY2hlY2sgZm9yICdpcyBwb3NpdGlvbiBlbXB0eSBhbmQgY2FuIEkgZmFsbCBkb3duJ1xyXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICBoYXMgc29tZSBzbGlnaHQgZWRnZSBjYXNlcyB0aGF0IGNhdXNlcyB0aGlzLiBJbnZlc3RpZ2F0ZSFcclxuICAgICAgICAgICAgbGV0IHRpbGVVbmRlclVzID0gdGhpcy5nZXRUaWxlQXQodGlsZS5jLCB0aWxlLnIgKyAxKTtcclxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGlsZVVuZGVyVXMpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYXBwbHkgZ3Jhdml0eSBub3dcIiwgdGlsZSk7XHJcbiAgICAgICAgICAgICAgICB0aWxlLmZhbGxEb3duVG8obmV3IFRpbGUoe251bWJlcjogLTEsIHI6IHRpbGUuciArIDEsIGM6IHRpbGUuY30pKTtcclxuICAgICAgICAgICAgICAgIGJsb2NrSW5wdXQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IC8vIGVsc2Uge30gLy8gdGhlcmUgaXMgYSB0aWxlIHVuZGVyIHVzLCBzbyB3ZSBjYW4ndCBmYWxsIGRvd24gbm93XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZS1hZGQgZWxlbWVudHMgYXQgdG9wXHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgQk9BUkRfV0lEVEggLSAxOyBjb2wrKykge1xyXG4gICAgICAgICAgICBsZXQgdGlsZSA9IHRoaXMuZ2V0VGlsZUF0KGNvbCwgMCk7XHJcbiAgICAgICAgICAgIGlmIChudWxsID09IHRpbGUpIHtcclxuICAgICAgICAgICAgICAgIGJsb2NrSW5wdXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETyhka2cpOiBmaWd1cmUgb3V0IHdoeSB0aGlzIGRvZXNuJ3Qgd29yayAtIHRoZSBncmF2aXR5XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIGlzIG5vdCBhcHBsaWVkIGluIHRoZSBuZXh0IGZyYW1lIC4uLlxyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5wdXNoKG5ldyBUaWxlKHtudW1iZXI6IDAsIHI6IDAsIGM6IGNvbH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ibG9ja0lucHV0ID0gYmxvY2tJbnB1dDtcclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuXHJcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnBsYXkuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGltcygpIHtcclxuICAgICAgICByZXR1cm4gW3BhcnNlSW50KHRoaXMuYm9hcmRFbGVtZW50LmNsaWVudFdpZHRoLCAxMCksIHBhcnNlSW50KHRoaXMuYm9hcmRFbGVtZW50LmNsaWVudEhlaWdodCwgMTApXTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiR2FtZTo6ZHJhd1wiKTtcclxuICAgICAgICB0aGlzLmRyYXdpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICAgICAgbGV0IFt3LCBoXSA9IHRoaXMuZ2V0RGltcygpO1xyXG5cclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogaW1wbGVtZW50IHRoaXMhXHJcbiAgICAgICAgLy8gaWYgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXJlIE5PVCBhIG11bHRpcGxlIG9mIGVpdGhlciBCT0FSRF9XSURUSCBvclxyXG4gICAgICAgIC8vIEJPQVJEX0hFSUdIVCB3ZSBuZWVkIHRvIHVzZSB0aGUgdmFsdWVzIHRoYXQgZml0IGFuZCBcIm1vdmVcIiB0aGUgdG9wIFxyXG4gICAgICAgIC8vIGFuZCBsZWZ0IG9mIHRoZSBib2FyZCBhIGJpdCBhbmQgaW50cm9kdWNlIGEgYmxhY2sgYm9yZGVyIHRoYXQgZmlsbHNcclxuICAgICAgICAvLyB1cCB0aGUgZXh0cmFub3VzIFwic3BhY2UhXHJcbiAgICAgICAgLy8gQWxzbywgbW92ZSB0aGUgYm9hcmQgYXJlYSB0byB0aGUgY2VudGVyIGlmIHRoZXJlIGlzIG1vcmUgY2FudmFzIHNwYWNlXHJcbiAgICAgICAgLy8gdGhhbiBuZWVkZWQgdG8gZGlzcGxheSB0aGUgYm9hcmQuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZHJhdyBpbmRpdmlkdWFsIHRpbGVzIC0gb25seSB0aGUgdHJhY2tlZCBvbmUgc2hvdWxkIGJlIGRyYXduIG92ZXJcclxuICAgICAgICAvLyBhbGwgb3RoZXIgdGlsZXMgbGFzdCwgYmVjYXVzZSBvdGhlcndpc2UgdGhlIGJvcmRlciBvdXRsaW5lIGlzXHJcbiAgICAgICAgLy8gb3ZlcmRyYXduIGJ5IG5laWdoYm91cmluZyB0aWxlc1xyXG4gICAgICAgIGxldCBkZWxheWVkRGlzcGxheSA9IFtdO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGlsZS50cmFja2VkKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxheWVkRGlzcGxheS5wdXNoKHRpbGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGlsZS5kcmF3KGN0eCwgdywgaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBkZWxheWVkRGlzcGxheS5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgIHRpbGUuZHJhdyhjdHgsIHcsIGgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXR1cm5zIHRoZSBuZWlnaGJvdXJpbmcgdGlsZXMgdGhhdCBoYXZlIHRoZSBzYW1lIG51bWJlciBhcyB0aGUgcHJvdmlkZWQgdGlsZVxyXG4gICAgZmluZE5laWdoYm91cnNGb3JUaWxlKHRpbGUpIHtcclxuICAgICAgICBsZXQgbmVpZ2hib3VycyA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgbGVmdCA9IHRpbGUuYyA+IDAgPyB0aGlzLmdldFRpbGVBdCh0aWxlLmMgLSAxLCB0aWxlLnIpIDogbnVsbDtcclxuICAgICAgICBsZXQgdG9wID0gdGlsZS5yID4gMCA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYywgdGlsZS5yIC0gMSkgOiBudWxsO1xyXG4gICAgICAgIGxldCByaWdodCA9IHRpbGUuYyA8IEJPQVJEX1dJRFRILTEgPyB0aGlzLmdldFRpbGVBdCh0aWxlLmMgKyAxLCB0aWxlLnIpIDogbnVsbDtcclxuICAgICAgICBsZXQgYm90dG9tID0gdGlsZS5yIDwgQk9BUkRfSEVJR0hULTEgPyB0aGlzLmdldFRpbGVBdCh0aWxlLmMsIHRpbGUuciArIDEpIDogbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKG51bGwgIT0gbGVmdCAmJiBsZWZ0Lm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaChsZWZ0KTtcclxuICAgICAgICBpZiAobnVsbCAhPSB0b3AgJiYgdG9wLm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaCh0b3ApO1xyXG4gICAgICAgIGlmIChudWxsICE9IHJpZ2h0ICYmIHJpZ2h0Lm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaChyaWdodCk7XHJcbiAgICAgICAgaWYgKG51bGwgIT0gYm90dG9tICYmIGJvdHRvbS5udW1iZXIgPT09IHRpbGUubnVtYmVyKSBuZWlnaGJvdXJzLnB1c2goYm90dG9tKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5laWdoYm91cnM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VGlsZUF0KGNvbHVtbiwgcm93KSB7XHJcbiAgICAgICAgbGV0IHRpbGUgPSB0aGlzLmJvYXJkLmZpbmQoKHQpID0+IHQuYyA9PT0gY29sdW1uICYmIHQuciA9PT0gcm93KTtcclxuICAgICAgICByZXR1cm4gISF0aWxlID8gdGlsZSA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRpbGVzIHRoYXQgc2hhcmUgdGhlIHNhbWUgbnVtYmVyIGFzIHRoZSBvbmUgcHJvdmlkZWRcclxuICAgIC8vIGFuZCB0aGF0IGFyZSBjb250aW5vdXNseSBjb25uZWN0ZWQgdGhyb3VnaG91dCBlYWNoIG90aGVyLlxyXG4gICAgLy8gSW1wb3J0YW50OiBib2FyZCBib3JkZXJzIGFyZSBjdXQgb2ZmIHBvaW50cyFcclxuICAgIGdhdGhlckNvbm5lY3RlZFRpbGVzKHRpbGUpIHtcclxuXHJcbiAgICAgICAgLy8gQSBsaXN0IG9mIGFycmF5IGluZGljZXMgdGhhdCBhcmUgY29ubmVjdGVkIHRvIHRoZSB0aWxlXHJcbiAgICAgICAgLy8gYW5kIGZ1cnRoZXJtb3JlIHRvIG90aGVyIHRpbGVzIHdpdGggdGhlIHNhbWUgdmFsdWUvbnVtYmVyLlxyXG4gICAgICAgIGxldCBjb25uZWN0ZWQgPSBbXTsgXHJcblxyXG4gICAgICAgIC8vIFNlYXJjaGVzIHRocm91Z2ggYWxsIG5laWdoYm91cnMgdG8gZmluZCBhbGwgY29ubmVjdGVkIHRpbGVzLlxyXG4gICAgICAgIGxldCBjcmF3bCA9IChyb290VGlsZSwgY3Jhd2xlZCwgaWdub3JlUm9vdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocm9vdFRpbGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcInJvb3RUaWxlIG5vdCBzZXRcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG51bSA9IHJvb3RUaWxlLm51bWJlcjtcclxuICAgICAgICAgICAgY3Jhd2xlZC5wdXNoKHJvb3RUaWxlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBuZWlnaGJvdXJzID0gdGhpcy5maW5kTmVpZ2hib3Vyc0ZvclRpbGUocm9vdFRpbGUpLFxyXG4gICAgICAgICAgICAgICAgY291bnRlZCA9IG5laWdoYm91cnMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudGVkOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gbmVpZ2hib3Vyc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICBpZHhPZiA9IGNyYXdsZWQuaW5kZXhPZih0KTtcclxuICAgICAgICAgICAgICAgIGlmIChpZHhPZiA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjcmF3bCh0LCBjcmF3bGVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgY3Jhd2wodGlsZSwgY29ubmVjdGVkLCB0cnVlKTtcclxuICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGhhdmUgb3VyIGluaXRpYWwgdGlsZSBpbiB0aGUgcmVzdWx0IHNldFxyXG4gICAgICAgIHJldHVybiBjb25uZWN0ZWQuZmlsdGVyKCh0KSA9PiAhKHQuciA9PT0gdGlsZS5yICYmIHQuYyA9PT0gdGlsZS5jKSk7XHJcbiAgICB9XHJcbiAgICBcclxufSAvLyBjbGFzcyBHYW1lXHJcbiIsIi8qXHJcbiAqICBVdGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuIFxyXG5sZXQgZ2V0UmFuZG9tSW50ID0gKG1pbiwgbWF4ID0gZmFsc2UpID0+IHtcclxuICAgIGlmIChtYXggPT09IGZhbHNlKSB7XHJcbiAgICAgICAgbWF4ID0gbWluO1xyXG4gICAgICAgIG1pbiA9IDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFyc2VJbnQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbiwgMTApO1xyXG59O1xyXG5cclxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTIwNDMyMjgvMTkzMTY1XHJcbmZ1bmN0aW9uIGlzRGFya0NvbG9yKGNvbG9yKSB7XHJcbiAgICB2YXIgYyA9IGNvbG9yLmxlbmd0aCA9PT0gNiA/IGNvbG9yIDogY29sb3Iuc3Vic3RyaW5nKDEpOyAvLyBzdHJpcCAjXHJcbiAgICB2YXIgcmdiID0gcGFyc2VJbnQoYywgMTYpOyAgIC8vIGNvbnZlcnQgcnJnZ2JiIHRvIGRlY2ltYWxcclxuICAgIHZhciByID0gKHJnYiA+PiAxNikgJiAweGZmOyAgLy8gZXh0cmFjdCByZWRcclxuICAgIHZhciBnID0gKHJnYiA+PiAgOCkgJiAweGZmOyAgLy8gZXh0cmFjdCBncmVlblxyXG4gICAgdmFyIGIgPSAocmdiID4+ICAwKSAmIDB4ZmY7ICAvLyBleHRyYWN0IGJsdWVcclxuXHJcbiAgICAvLyB1c2UgYSBzdGFuZGFyZCBmb3JtdWxhIHRvIGNvbnZlcnQgdGhlIHJlc3VsdGluZyBSR0IgdmFsdWVzIGludG8gdGhlaXIgcGVyY2VpdmVkIGJyaWdodG5lc3NcclxuICAgIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1JlYy5fNzA5I0x1bWFfY29lZmZpY2llbnRzXHJcbiAgICB2YXIgbHVtYSA9IDAuMjEyNiAqIHIgKyAwLjcxNTIgKiBnICsgMC4wNzIyICogYjsgLy8gcGVyIElUVS1SIEJULjcwOVxyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKFwibHVtYSBmb3IgY29sb3I6XCIsIGNvbG9yLCBsdW1hKTtcclxuXHJcbiAgICByZXR1cm4gbHVtYSA8IDgwOyAvLyB0b28gZGFyayBpZiBsdW1hIGlzIHNtYWxsZXIgdGhhbiBOXHJcbn1cclxuXHJcblxyXG5leHBvcnQgeyBnZXRSYW5kb21JbnQsIGlzRGFya0NvbG9yIH07XHJcbiJdfQ==
