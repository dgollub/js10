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

                // this code is working
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
            this.moveInFrames = MOVE_STEPS_IN_FRAMES / 3;
            this.isCollapse = false;
        }
    }, {
        key: 'animateCollapseTo',
        value: function animateCollapseTo(targetTile) {
            this.moveTo = targetTile;
            this.stepsMoved = 0;
            this.moveInFrames = MOVE_STEPS_IN_FRAMES / 4;
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
                    this.board.push(new Tile({ number: (0, _utilsEs6.getRandomInt)(6, 9), r: 0, c: col }));
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiQzovVXNlcnMvZGtnL1Byb2pla3RlL2dhbWVzL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNHQSxZQUFZLENBQUM7O0FBRWIsU0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7QUFBRSxXQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUFFOztBQUVqRyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUwsWUFBWSxDQUFBLENBQUE7O0FBRTdCLElBQUksU0FBUyxHQUFHLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQU5qRCxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUE7O0FBRXZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBSXJCLElBQUksSUFBSSxHQUFHLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFVLENBQUM7QUFDdEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUdaLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxFQUFFLEVBQUs7O0FBRXBDLFdBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFbEMsUUFBSSxHQUFHLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFVLENBQUM7QUFDbEIsUUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0NBRWYsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FDYkgs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QztDQUNwQjs7QUFTRCxPQUFPLENBTkUsWUFBWSxHQUFaLFlBQVksQ0FBQTtBQU9yQixPQUFPLENBUGdCLFdBQVcsR0FBWCxXQUFXLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcclxuICAgIEVTNiBjb2RlIGVudHJ5IHBvaW50XHJcbiovXHJcbmNvbnN0IFZFUlNJT04gPSBcIjAuMC4yXCJcclxuXHJcbmNvbnNvbGUubG9nKFZFUlNJT04pO1xyXG5cclxuaW1wb3J0IEdhbWUgZnJvbSAnLi9nYW1lLmVzNic7XHJcblxyXG5sZXQgZ2FtZSA9IG5ldyBHYW1lKCk7XHJcbmdhbWUucGxheSgpO1xyXG5cclxuXHJcbiQoXCIjYnV0dG9uUmVzdGFydFwiKS5vbihcImNsaWNrXCIsIChldikgPT4ge1xyXG5cclxuICAgIGNvbnNvbGUuaW5mbyhcIj09PT4gUkVTVEFSVCBHQU1FXCIpO1xyXG5cclxuICAgIGdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgZ2FtZS5wbGF5KCk7XHJcblxyXG59KTtcclxuXHJcbiIsIi8qXHJcbiAgICBUaGUgZ2FtZSBjb2RlIGFuZCBsb2dpYywgd2l0aCBVSSBoYW5kbGluZy5cclxuICAgIFRPRE8oZGtnKTogdXNlIHRoZSBmb2xsb3dpbmcgdGVjaG5pcXVlc1xyXG4gICAgICAgIC0gZ2VuZXJhdG9ycyBhbmQgeWllbGRcclxuICAgICAgICAtIFN5bWJvbHNcclxuKi9cclxuXHJcbmltcG9ydCB7IGdldFJhbmRvbUludCwgaXNEYXJrQ29sb3IgfSBmcm9tICcuL3V0aWxzLmVzNic7XHJcblxyXG4vLyB0aGVzZSBhcmUgbm90IGluIHBpeGVsLCBidXQgcmF0aGVyIG91ciBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiB1bml0c1xyXG4vLyB0aGlzIG1lYW5zIE4gPSBOIG51bWJlciBvZiBpdGVtcywgZS5nLiAxMCA9IDEwIGl0ZW1zLCBub3QgMTAgcGl4ZWxzXHJcbi8vIHRoZSBkcmF3KCkgY2FsbCB3aWxsIGNvbnZlcnQgdGhvc2UgaW50byBwcm9wZXIgcGl4ZWxzXHJcbmNvbnN0IEJPQVJEX1dJRFRIID0gMTA7XHJcbmNvbnN0IEJPQVJEX0hFSUdIVCA9IDEwO1xyXG5jb25zdCBCT0FSRF9USUxFU19DT1VOVCA9IEJPQVJEX1dJRFRIICogQk9BUkRfSEVJR0hUO1xyXG5cclxuY29uc3QgQ09MT1JTID0gKCgpID0+IHtcclxuICAgIC8vIFRPRE8oZGtnKTogZWxpbWluYXRlIGNvbG9ycyB0aGF0IGFyZSB0b28gY2xvc2UgdG8gZWFjaCBvdGhlciBhbmQvb3IgZHVwbGljYXRlc1xyXG4gICAgbGV0IGlubmVyID0gKCkgPT4ge1xyXG4gICAgICAgIGxldCByZ2IgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdiA9IChwYXJzZUludChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTUpLCAxMCkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICAgICAgaWYgKHYubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgIHYgPSBgMCR7dn1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJnYi5wdXNoKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByZXR1cm4gJ3JnYignKyByZ2Iuam9pbignLCcpICsnKSc7XHJcbiAgICAgICAgcmV0dXJuICcjJyArIHJnYi5qb2luKFwiXCIpO1xyXG4gICAgfVxyXG4gICAgbGV0IHJldCA9IFtdO1xyXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCAxMDAwOyB4KyspIHtcclxuICAgICAgICByZXQucHVzaChpbm5lcigpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbn0pKCk7XHJcblxyXG5sZXQgX3JuZENvbG9yID0gMDtcclxubGV0IGdldENvbG9yID0gKGlkeCA9IC0xKSA9PiB7XHJcbiAgICBpZiAoX3JuZENvbG9yID49IENPTE9SUy5sZW5ndGgpXHJcbiAgICAgICAgX3JuZENvbG9yID0gMDtcclxuICAgIGlmIChpZHggPiAtMSAmJiBpZHggPCBDT0xPUlMubGVuZ3RoKVxyXG4gICAgICAgIHJldHVybiBDT0xPUlNbaWR4XTtcclxuICAgIHJldHVybiBDT0xPUlNbX3JuZENvbG9yKytdO1xyXG59O1xyXG5cclxuY29uc3QgTUFHSUNfQ09MT1JTID0gKCgpID0+IHtcclxuICAgIGxldCByZXQgPSBbXTtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgNTA7IHgrKykge1xyXG4gICAgICAgIHJldC5wdXNoKGdldENvbG9yKHgpKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbn0pKCk7XHJcbmNvbnN0IE1BR0lDX0NPTE9SU19SRVZFUlNFID0gKCgpID0+IHtcclxuICAgIHJldHVybiBbLi4uTUFHSUNfQ09MT1JTXS5yZXZlcnNlKCk7XHJcbn0pKCk7XHJcblxyXG5jb25zdCBNT1ZFX1NURVBTX0lOX0ZSQU1FUyA9IDMwOyAgLy8gMzAgb3IgaW4gMC41IHNlY29uZHMsIGFzc3VtaW5nIDYwIGZyYW1lcy9zZWNcclxuXHJcbi8vIGNvbnNvbGUubG9nKE1BR0lDX0NPTE9SUyk7XHJcblxyXG5jbGFzcyBUaWxlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih7IG51bWJlciA9IDAsIGMgPSAwLCByID0gMCB9ID0ge30pIHtcclxuICAgICAgICB0aGlzLm51bWJlciA9IG51bWJlciB8fCBnZXRSYW5kb21JbnQoMSwgMyk7XHJcbiAgICAgICAgLy8gaW4gY29sL3JvdyBjb29yZGluYXRlcywgdGhhdCBpcyBpbiBvdXIgb3duIGludGVybmFsIHVuaXRzXHJcbiAgICAgICAgdGhpcy5jID0gYztcclxuICAgICAgICB0aGlzLnIgPSByO1xyXG4gICAgICAgIHRoaXMubW92ZVRvID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50UG9zaXRpb24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gNDsgLy8gcmFuZG9tIG51bWJlciwgaGlkZGVuIHhrY2QgcmVmZXJlbmNlXHJcbiAgICAgICAgdGhpcy5zdGVwc01vdmVkID0gMDtcclxuICAgICAgICB0aGlzLm1vdmVJbkZyYW1lcyA9IDA7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50cmFja2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pbmNyZWFzZU51bWJlciA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNDb2xsYXBzZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY29ubmVjdGVkQ291bnQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNhbGxlZCBvbmNlIHBlciBmcmFtZSAtIG9ubHkgb25jZSBwZXIgZnJhbWUhXHJcbiAgICBkcmF3KGN0eCwgc3csIHNoKSB7XHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiByYW5kb21pemUgY29sb3IgYWNjb3JkaW5nIHRvIHRoaXMubnVtYmVyXHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBpbXBsZW1lbnQgdGlsZSBkZXN0cnVjdGlvbiBhbmQgYWRkaW5nIG5ldyB0aWxlcyBmcm9tIGFib3ZlXHJcbiAgICAgICAgLy8gICAgICAgICAgICBXb3VsZCBiZSBjb29sIGlmIHRoZSB0aWxlIHdvdWxkIGV4cGxvZGUgaW4gaHVnZSBleHBsb3Npb25cclxuICAgICAgICAvLyAgICAgICAgICAgIGJ1dCBvbmx5IGlmIHRoZSBudW1iZXIgaXMgOSBhbmQgaXQgd291bGQgYmVjb21lIGEgMTAuXHJcbiAgICAgICAgaWYgKHRoaXMuZGVzdHJveSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm51bWJlciA8PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgW3csIGhdID0gdGhpcy50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgIC8vIHRoZXNlIGFyZSB0aGUgb3JpZ2luYWwgcGl4ZWwgY29vcmRzIC0gdGhleSBuZWVkIHRvIGJlIGFkanVzdGVkXHJcbiAgICAgICAgLy8gd2hlbiB3ZSBoYXZlIHRvIGNvbGxhcHNlXHJcbiAgICAgICAgbGV0IFtsLCB0XSA9IHRoaXMuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5tb3ZlVG8pIHtcclxuICAgICAgICAgICAgLy8gVE9ETyhka2cpOiBDaGVjayBpZiB3ZSBhcmUgYWxyZWFkeSBpbiB0aGUgY29ycmVjdCBzcG90IGFuZFxyXG4gICAgICAgICAgICAvLyAgICAgICAgICAgIGlmIHdlIGFyZSwganVzdCBtYXJrIHVzIGFzIGRlc3Ryb3llZC5cclxuXHJcbiAgICAgICAgICAgIC8vIE5PVEUoZGtnKTogYW5pbWF0aW9uIGlkZWEgLSBoYXZlIHRoZSB0aWxlcyBzaHJpbmsgYW5kIGRpc2FwcGVhciBpbnN0ZWFkIG1heWJlP1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETyhka2cpOiBmaWd1cmUgb3V0IGhvdyB0byBhZGQgdmVsb2NpdHkgaW50byB0aGUgY29kZSBiZWxvd1xyXG5cclxuICAgICAgICAgICAgLy8gc3RlcHNNb3ZlZCBpcyBpbXBvcnRhbnQsIGFzIHdlIHdhbnQgdG8ga2VlcCB0cmFjayBob3cgZmFyXHJcbiAgICAgICAgICAgIC8vIHdlIGFyZSBpbnRvIHRoZSBhbmltYXRpb24gY3ljbGUgZm9yIHRoaXMgbW92ZSwgZXZlbiB3aGVuIHRoZSBcclxuICAgICAgICAgICAgLy8gdXNlciBjaGFuZ2VzIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cgYW5kIHRoZXJlZm9yZSB0aGUgY2FudmFzIGRpbWVuc2lvbnNcclxuICAgICAgICAgICAgbGV0IHN0ZXAgPSArK3RoaXMuc3RlcHNNb3ZlZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBbZHIsIGRjXSA9IFt0aGlzLm1vdmVUby5yIC0gdGhpcy5yLCB0aGlzLm1vdmVUby5jIC0gdGhpcy5jXTtcclxuICAgICAgICAgICAgbGV0IFtkc3IsIGRzY10gPSBbZHIgLyBNT1ZFX1NURVBTX0lOX0ZSQU1FUywgZGMgLyBNT1ZFX1NURVBTX0lOX0ZSQU1FU107XHJcbiAgICAgICAgICAgIGxldCBbc3RlcHNGcmFjdGlvblJvd3MsIHN0ZXBzRnJhY3Rpb25Db2x1bW5zXSA9IFsgc3RlcCAqIGRzciwgc3RlcCAqIGRzYyBdOyBcclxuICAgICAgICAgICAgbGV0IFttb3ZlUm93c0luUGl4ZWwsIG1vdmVDb2xzSW5QaXhlbF0gPSBbaCAqIHN0ZXBzRnJhY3Rpb25Sb3dzLCB3ICogc3RlcHNGcmFjdGlvbkNvbHVtbnNdO1xyXG5cclxuICAgICAgICAgICAgW2wsIHRdID0gW2wgKyBtb3ZlQ29sc0luUGl4ZWwsIHQgKyBtb3ZlUm93c0luUGl4ZWxdO1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcyBjb2RlIGlzIHdvcmtpbmdcclxuICAgICAgICAgICAgLy8gVE9ETyhka2cpOiBhZGQgY2hlY2sgZm9yIFwiaXMgdGhlIHRpbGUgYWxyZWFkeSBvbiB0aGUgcG9zaXRpb24gd2hlcmUgaXQgc2hvdWxkIGJlXCJcclxuICAgICAgICAgICAgaWYgKHN0ZXAgPj0gdGhpcy5tb3ZlSW5GcmFtZXMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBbbCwgdF0gPSB0aGlzLm1vdmVUby5jYW52YXNDb29yZGluYXRlcyhzdywgc2gpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuciA9IHRoaXMubW92ZVRvLnI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmMgPSB0aGlzLm1vdmVUby5jO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0NvbGxhcHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlVG8uaW5jcmVhc2VOdW1iZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NvbGxhcHNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGVwc01vdmVkID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZVRvID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IFxyXG5cclxuICAgICAgICBsZXQgZmlsbENvbG9yID0gTUFHSUNfQ09MT1JTW3RoaXMubnVtYmVyLTFdO1xyXG4gICAgICAgIGxldCBhbnRpQ29sb3IgPSBpc0RhcmtDb2xvcihmaWxsQ29sb3IpID8gXCJsaWdodGdyYXlcIiA6IFwiYmxhY2tcIjtcclxuXHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvcjtcclxuICAgICAgICBjdHguZmlsbFJlY3QobCwgdCwgdywgaCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRyYWNrZWQpIHtcclxuICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDQ7XHJcbiAgICAgICAgICAgIC8vIGN0eC5zdHJva2VTdHlsZSA9IE1BR0lDX0NPTE9SU19SRVZFUlNFW3RoaXMubnVtYmVyLTFdO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBhbnRpQ29sb3I7XHJcbiAgICAgICAgICAgIGN0eC5zdHJva2VSZWN0KGwsIHQsIHcsIGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gd3JpdGUgdGhlIG51bWJlciBpbiB0aGUgY2VudGVyIG9mIHRoZSB0aWxlXHJcbiAgICAgICAgbGV0IFt4LCB5XSA9IFtcclxuICAgICAgICAgICAgbCArIE1hdGguY2VpbCh3IC8gMi4wKSwgXHJcbiAgICAgICAgICAgIHQgKyBNYXRoLmNlaWwoaCAvIDIuMClcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICAvLyBjdHguZmlsbFN0eWxlID0gTUFHSUNfQ09MT1JTX1JFVkVSU0VbdGhpcy5udW1iZXJdO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBhbnRpQ29sb3I7XHJcbiAgICAgICAgY3R4LmZvbnQgPSBcIjMycHggY291cmllclwiO1xyXG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gICAgICAgIGN0eC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xyXG4gICAgICAgIGN0eC5maWxsVGV4dCh0aGlzLm51bWJlciwgeCwgeSk7XHJcbiAgICB9XHJcblxyXG4gICAgZmFsbERvd25Ubyh0YXJnZXRUaWxlKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG8gPSB0YXJnZXRUaWxlO1xyXG4gICAgICAgIHRoaXMuc3RlcHNNb3ZlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZlSW5GcmFtZXMgPSBNT1ZFX1NURVBTX0lOX0ZSQU1FUyAvIDM7XHJcbiAgICAgICAgdGhpcy5pc0NvbGxhcHNlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYW5pbWF0ZUNvbGxhcHNlVG8odGFyZ2V0VGlsZSkge1xyXG4gICAgICAgIHRoaXMubW92ZVRvID0gdGFyZ2V0VGlsZTtcclxuICAgICAgICB0aGlzLnN0ZXBzTW92ZWQgPSAwO1xyXG4gICAgICAgIHRoaXMubW92ZUluRnJhbWVzID0gTU9WRV9TVEVQU19JTl9GUkFNRVMgLyA0O1xyXG4gICAgICAgIHRoaXMuaXNDb2xsYXBzZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKSB7XHJcbiAgICAgICAgLy8gcmV0dXJuIHRoZSBjdXJyZW50IHRpbGUgcG9zaXRpb24gaW4gcGl4ZWxcclxuICAgICAgICBsZXQgW3R3LCB0aF0gPSB0aGlzLnRpbGVEaW1lbnNpb25zKHN3LCBzaCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gY2FsYyB0aGUgdG9wIGFuZCBsZWZ0IGNvb3JkaW5hdGVzIGluIHBpeGVsICh0b3AtbGVmdCBpcyAwLCAwIGluIG91ciBjb29yZGluYXRlIHN5c3RlbVxyXG4gICAgICAgIC8vIGFuZCBib3R0b20tcmlnaHQgaXMgb3VyIHNjcmVlbl9oZWlnaHQtc2NyZWVuX3dpZHRoKVxyXG4gICAgICAgIC8vIHRoaXMgZGVwZW5kcyBvbiB0aGUgdGlsZXMgcG9zaXRpb24gKGluIGNvbC9yb3cgY29vcmRzKVxyXG4gICAgICAgIC8vIEluIGNhc2Ugd2UgYXJlIG1vdmluZy9jb2xsYXBzaW5nIG9udG8gYW5vdGhlciB0aWxlLCB3ZSB3aWxsIG5lZWRcclxuICAgICAgICAvLyB0byBtb3ZlIG9uY2UgcGVyIGZyYW1lIGludG8gYSBjZXJ0YWluIGRpcmVjdGlvbi5cclxuICAgICAgICBcclxuICAgICAgICBsZXQgW2wsIHRdID0gW1xyXG4gICAgICAgICAgICB0aGlzLmMgKiB0dyxcclxuICAgICAgICAgICAgdGhpcy5yICogdGhcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICAvLyB3ZSB3ZXJlIGFkZGVkIGF0IHRoZSB0b3AgYWZ0ZXIgb3RoZXIgdGlsZXMgZmVsbCBkb3duXHJcbiAgICAgICAgLy8gc28gbGV0J3MgY29tZSBpbiBnZW50bHkgZnJvbSB0aGUgdG9wXHJcbiAgICAgICAgaWYgKHRoaXMuciA9PSAtMSkge1xyXG4gICAgICAgICAgICB0ID0gdGggLyA1LjA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gW2wsIHRdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aWxlRGltZW5zaW9ucyhzdywgc2gpIHtcclxuICAgICAgICAvLyBjYWxjIHRpbGUgd2lkdGggYW5kIGhlaWdodCBpbiBwaXhlbHMgZm9yIG9uZSB0aWxlXHJcbiAgICAgICAgLy8gREVQRU5ESU5HIG9uIHRoZSBjdXJyZW50IHNjcmVlbiBvciBib2FyZCBkaW1lbnNpb24hXHJcbiAgICAgICAgLy8gc3c6IHNjcmVlbiBvciBib2FyZCB3aWR0aCBpbiBwaXhlbFxyXG4gICAgICAgIC8vIHNoOiBzY3JlZW4gb3IgYm9hcmQgaGVpZ2h0IGluIHBpeGVsXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IFt0dywgdGhdID0gW01hdGguY2VpbChzdyAvIEJPQVJEX1dJRFRIKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5jZWlsKHNoIC8gQk9BUkRfSEVJR0hUKV07XHJcbiAgICAgICAgcmV0dXJuIFt0dywgdGhdO1xyXG4gICAgfVxyXG59IC8vIGNsYXNzIFRpbGVcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuYmxvY2tJbnB1dCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucG9pbnRzID0gMDtcclxuICAgICAgICAkKFwiI3BvaW50c1wiKS5odG1sKGBObyBwb2ludHMgOi0oYCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHRpbGVzID0gKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRpbGVzID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvdW50ZXIgPSAwOyBjb3VudGVyIDwgQk9BUkRfVElMRVNfQ09VTlQ7IGNvdW50ZXIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBbY29sdW1uLCByb3ddID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGNvdW50ZXIgJSBCT0FSRF9XSURUSCwgMTApLCAgICAgICAgICAgICAgLy8gcG9zaXRpb24gaW4gY29sdW1uXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoTWF0aC5mbG9vcihjb3VudGVyIC8gQk9BUkRfSEVJR0hUKSwgMTApLCAvLyBwb3NpdGlvbiBpbiByb3dcclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGUgPSBuZXcgVGlsZSh7IG51bWJlcjogZ2V0UmFuZG9tSW50KDEsIDMpLCBjOiBjb2x1bW4sIHI6IHJvdyB9KTtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGlsZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRpbGVzO1xyXG4gICAgICAgIH0pKCk7XHJcbiAgICAgICAgdGhpcy5ib2FyZCA9IHRpbGVzO1xyXG4gICAgXHJcbiAgICAgICAgbGV0IGJvYXJkRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9hcmRcIik7XHJcbiAgICAgICAgbGV0IGNvbnRleHQgPSBib2FyZEVsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmN0eCA9IGNvbnRleHQ7XHJcbiAgICAgICAgdGhpcy5ib2FyZEVsZW1lbnQgPSBib2FyZEVsZW1lbnQ7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgcmVzaXplID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBbd3csIHdoXSA9IFskKHdpbmRvdykud2lkdGgoKSwgJCh3aW5kb3cpLmhlaWdodCgpXTtcclxuICAgICAgICAgICAgbGV0IG1hcmdpbiA9IDIwMDtcclxuICAgICAgICAgICAgbGV0ICRib2FyZCA9ICQoXCIjYm9hcmRcIik7XHJcbiAgICAgICAgICAgICRib2FyZC5oZWlnaHQoYCR7d2gtbWFyZ2lufXB4YCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgPSB3aC1tYXJnaW47XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmNhbnZhcy53aWR0aCA9ICRib2FyZC53aWR0aCgpOyAvLyB0aGlzIHNob3VsZCB0YWtlIG1hcmdpbnMgYW5kIENTUyBpbnRvIGFjY291bnRcclxuICAgICAgICAgICAgLy8gdGhpcy5kcmF3KCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgcmVzaXplKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZ2V0TW91c2VDb29yZGluYXRlcyA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQgPSBldiB8fCB3aW5kb3cuZXZlbnQ7IC8vIElFLWlzbVxyXG4gICAgICAgICAgICAvLyBJZiBwYWdlWC9ZIGFyZW4ndCBhdmFpbGFibGUgYW5kIGNsaWVudFgvWSBhcmUsXHJcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBwYWdlWC9ZIC0gbG9naWMgdGFrZW4gZnJvbSBqUXVlcnkuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5wYWdlWCA9PSBudWxsICYmIGV2ZW50LmNsaWVudFggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50RG9jID0gKGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQub3duZXJEb2N1bWVudCkgfHwgZG9jdW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgZG9jID0gZXZlbnREb2MuZG9jdW1lbnRFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBldmVudERvYy5ib2R5O1xyXG5cclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhZ2VYID0gZXZlbnQuY2xpZW50WCArXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLnNjcm9sbExlZnQgfHwgYm9keSAmJiBib2R5LnNjcm9sbExlZnQgfHwgMCkgLVxyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5jbGllbnRMZWZ0IHx8IGJvZHkgJiYgYm9keS5jbGllbnRMZWZ0IHx8IDApO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucGFnZVkgPSBldmVudC5jbGllbnRZICtcclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2Muc2Nyb2xsVG9wICB8fCBib2R5ICYmIGJvZHkuc2Nyb2xsVG9wICB8fCAwKSAtXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLmNsaWVudFRvcCAgfHwgYm9keSAmJiBib2R5LmNsaWVudFRvcCAgfHwgMCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgcGFyZW50T2Zmc2V0ID0gJChldmVudC50YXJnZXQpLnBhcmVudCgpLm9mZnNldCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgeDogZXZlbnQucGFnZVggLSBwYXJlbnRPZmZzZXQubGVmdCxcclxuICAgICAgICAgICAgICAgIHk6IGV2ZW50LnBhZ2VZIC0gcGFyZW50T2Zmc2V0LnRvcFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJtb3VzZSBtb3ZlZFwiLCBtb3VzZVBvcy54LCBtb3VzZVBvcy55KTtcclxuICAgICAgICAgICAgcmV0dXJuIG1vdXNlUG9zO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBtb3VzZVRyYWNrZXIgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0gZ2V0TW91c2VDb29yZGluYXRlcyhldiksXHJcbiAgICAgICAgICAgICAgICBkaW1zID0gdGhpcy5nZXREaW1zKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJvYXJkLmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRpbGUudHJhY2tlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aWxlLmRlc3Ryb3kpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1vdXNlUG9zIGlzIGluIHBpeGVsIGNvb3Jkc1xyXG4gICAgICAgICAgICAgICAgbGV0IFtzdywgc2hdID0gZGltcztcclxuICAgICAgICAgICAgICAgIGxldCBbdHcsIHRoXSA9IHRpbGUudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICAgICAgICAgIGxldCBbdGwsIHR0XSA9IHRpbGUuY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobW91c2VQb3MueCA+PSB0bCAmJiBtb3VzZVBvcy54IDw9ICh0bCArIHR3KSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlUG9zLnkgPj0gdHQgJiYgbW91c2VQb3MueSA8PSAodHQgKyB0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aWxlLnRyYWNrZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAkKFwiI2JvYXJkXCIpLm9uKFwibW91c2Vtb3ZlXCIsIG1vdXNlVHJhY2tlcik7XHJcblxyXG4gICAgICAgIGxldCBtb3VzZUNsaWNrID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5ibG9ja0lucHV0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImlucHV0IGJsb2NrZWRcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlmICh0aGlzLmRyYXdpbmcgIT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiSWdub3JlZCBtb3VzZSBjbGljayBiZWNhdXNlIEkgd2FzIGRyYXdpbmcuXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbW91c2VQb3MgPSBnZXRNb3VzZUNvb3JkaW5hdGVzKGV2KSxcclxuICAgICAgICAgICAgICAgIGRpbXMgPSB0aGlzLmdldERpbXMoKTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJjbGlja2VkIGhlcmVcIiwgbW91c2VQb3MpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNsaWNrZWRPblRpbGVzID0gdGhpcy5ib2FyZC5maWx0ZXIoKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aWxlLnRyYWNrZWQ7IC8vIHdlIGFyZSBjaGVhdGluZyBoZXJlXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVUaWxlQ2xpY2tlZChjbGlja2VkT25UaWxlcy5sZW5ndGggPiAwID8gY2xpY2tlZE9uVGlsZXNbMF0gOiBudWxsKTtcclxuXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAkKFwiI2JvYXJkXCIpLm9uKFwiY2xpY2tcIiwgbW91c2VDbGljayk7XHJcblxyXG4gICAgICAgIHJlc2l6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZVRpbGVDbGlja2VkKGNsaWNrZWRPblRpbGUpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImhhbmRsZVRpbGVDbGlja2VkXCIsIGNsaWNrZWRPblRpbGUpO1xyXG4gICAgICAgIGlmIChudWxsID09PSBjbGlja2VkT25UaWxlKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogY2hlY2sgaWYgdGlsZSBoYXMgbmVpZ2hib3VycyB3aXRoIHRoZSBzYW1lIG51bWJlclxyXG4gICAgICAgIC8vIGlmIHllcywgaW5jcmVhc2UgY3VycmVudCB0aWxlJ3MgbnVtYmVyIGFuZCBjb2xsYXBzZSBhbGwgY29ubmVjdGVkXHJcbiAgICAgICAgLy8gbmVpZ2hib3VycyB3aXRoIHRoZSBzYW1lIG51bWJlciBvbnRvIHRoZSB0aWxlIChhbmltYXRlIHRoaXMgYXMgd2VsbCkuXHJcbiAgICAgICAgLy8gVGhlbiBsZXQgZ3Jhdml0eSBkcm9wIGRvd24gYWxsIHRpbGVzIHRoYXQgYXJlIGhhbmdpbmcgaW4gdGhlIGFpci5cclxuICAgICAgICAvLyBBZnRlciB0aGF0IGFkZCBmcmVzaCB0aWxlcyB0byB0aGUgYm9hcmQgdW50aWwgYWxsIGVtcHR5IHNwYWNlcyBhcmVcclxuICAgICAgICAvLyBmaWxsZWQgdXAgYWdhaW4gLSBsZXQgdGhlc2UgZHJvcCBmcm9tIHRoZSB0b3AgYXMgd2VsbC5cclxuXHJcbiAgICAgICAgbGV0IGNvbm5lY3RlZFRpbGVzID0gdGhpcy5nYXRoZXJDb25uZWN0ZWRUaWxlcyhjbGlja2VkT25UaWxlKTtcclxuICAgICAgICBjbGlja2VkT25UaWxlLmNvbm5lY3RlZENvdW50ID0gY29ubmVjdGVkVGlsZXMubGVuZ3RoO1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogZm9yIGRlYnVnZ2luZyBwdXJwb3NlcyBkaXNwbGF5IGEgb3ZlcmxheSBvciBcclxuICAgICAgICAvLyAgICAgICAgICAgIGRpZmZlcmVudCBib3JkZXIgY29sb3IgZm9yIGFsbCBjb25uZWN0ZWQgdGlsZXNcclxuICAgICAgICAvLyAgICAgICAgICAgIGFzIGEgd2hvbGUsIG5vdCBmb3IgZWFjaCBpbmRpdmlkdWFsIG9uZVxyXG4gICAgICAgIGNvbm5lY3RlZFRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgLy8gYW5pbWF0ZSB0byBjb2xsYXBzZSBvbnRvIGNsaWNrZWQgdGlsZVxyXG4gICAgICAgICAgICAvLyByZW1vdmUgdGlsZXMgYWZ0ZXIgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgIC8vIGNvdW50IGFuZCBhZGQgcG9pbnRzXHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGdhbWUgb3ZlclxyXG4gICAgICAgICAgICB0aWxlLmFuaW1hdGVDb2xsYXBzZVRvKGNsaWNrZWRPblRpbGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXkoKSB7XHJcbiAgICAgICAgbGV0IGJsb2NrSW5wdXQgPSBmYWxzZTtcclxuICAgICAgICAvLyBUT0RPKGRrZyk6IHJlbW92ZSBkZXN0cm95ZWQgdGlsZXMgYW5kIGFkZCBuZXcgdGlsZXMgZnJvbSBhYm92ZSB0aGUgYm9hcmRcclxuICAgICAgICAvLyAgICAgICAgICAgIHdpdGggZ3Jhdml0eSBwdWxsaW5nIHRoZW0gZG93biBldGMuXHJcbiAgICAgICAgLy8gICAgICAgICAgICBvbmx5IGxldCB0aGUgcGxheWVyIGNvbnRpbnVlIHRvIHBsYXkgYWZ0ZXIgYWxsIGFuaW1hdGlvbnMgYXJlIGRvbmVcclxuICAgICAgICBsZXQgcmVtb3ZlZCA9IDA7XHJcbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhbnkgZGVzdHJveWVkIHRpbGVzLCByZW1vdmUgdGhlbSBmcm9tIHRoZSBhcnJheVxyXG4gICAgICAgIC8vIGFsc28gaW5jcmVhc2UgYW55IG51bWJlcnMgaWYgd2UgbmVlZCB0b1xyXG4gICAgICAgIGZvciAobGV0IGlkeCA9IHRoaXMuYm9hcmQubGVuZ3RoLTE7IGlkeC0tOykge1xyXG4gICAgICAgICAgICBsZXQgdGlsZSA9IHRoaXMuYm9hcmRbaWR4XTtcclxuICAgICAgICAgICAgaWYgKHRpbGUuZGVzdHJveSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib2FyZC5zcGxpY2UoaWR4LCAxKTtcclxuICAgICAgICAgICAgICAgIHJlbW92ZWQrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHRoZSB1c2VyIGNsaWNrZWQgb24gdGhpcyB0aWxlLCBpdCB3YXMgY29ubmVjdGVkIHRvIG90aGVycyBvZlxyXG4gICAgICAgICAgICAvLyB0aGUgc2FtZSBraW5kIHNvIHdlIG5lZWQgdG8gaW5jcmVhc2UgdGhlIG51bWJlclxyXG4gICAgICAgICAgICBpZiAodGlsZS5pbmNyZWFzZU51bWJlciA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHMgKz0gTWF0aC5jZWlsKE1hdGguc3FydCgoKHRpbGUuY29ubmVjdGVkQ291bnQgKyAxKSoqMikgKiAodGlsZS5udW1iZXIqKjIpKSk7XHJcbiAgICAgICAgICAgICAgICB0aWxlLm51bWJlcisrO1xyXG4gICAgICAgICAgICAgICAgdGlsZS5pbmNyZWFzZU51bWJlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgJChcIiNwb2ludHNcIikuaHRtbChgUG9pbnRzOiAke3RoaXMucG9pbnRzfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHdlIGFyZSBzdGlsbCBhbmltYXRpbmdcclxuICAgICAgICAgICAgaWYgKHRpbGUuc3RlcHNNb3ZlZCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGJsb2NrSW5wdXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgd2UgbmVlZCB0byBhcHBseSBncmF2aXR5IHRvIHRoaXMgdGlsZVxyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiB3ZSBhcmUgYXQgdGhlIGJvdHRvbSByb3dcclxuICAgICAgICAgICAgaWYgKHRpbGUuciA+PSBCT0FSRF9IRUlHSFQgLSAxKSBcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiB3ZSBoYXZlIFwiYWlyXCIgdW5kZXJuZWF0aCB1cywgdGhlbiB3ZSBjYW4gYXBwbHkgZ3Jhdml0eSBhbmRcclxuICAgICAgICAgICAgLy8gZmFsbCBkb3duIG9uZSBzcG90XHJcbiAgICAgICAgICAgIC8vIEZJWE1FKGRrZyk6IFNvbWV0aW1lcyB0aGUgdGlsZSBhYm92ZSBkb2Vzbid0IGZhbGwgZG93bi5cclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgSSBmZWVsIHRoYXQgdGhlIGNoZWNrIGZvciAnaXMgcG9zaXRpb24gZW1wdHkgYW5kIGNhbiBJIGZhbGwgZG93bidcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgaGFzIHNvbWUgc2xpZ2h0IGVkZ2UgY2FzZXMgdGhhdCBjYXVzZXMgdGhpcy4gSW52ZXN0aWdhdGUhXHJcbiAgICAgICAgICAgIGxldCB0aWxlVW5kZXJVcyA9IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYywgdGlsZS5yICsgMSk7XHJcbiAgICAgICAgICAgIGlmIChudWxsID09IHRpbGVVbmRlclVzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImFwcGx5IGdyYXZpdHkgbm93XCIsIHRpbGUpO1xyXG4gICAgICAgICAgICAgICAgdGlsZS5mYWxsRG93blRvKG5ldyBUaWxlKHtudW1iZXI6IC0xLCByOiB0aWxlLnIgKyAxLCBjOiB0aWxlLmN9KSk7XHJcbiAgICAgICAgICAgICAgICBibG9ja0lucHV0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSAvLyBlbHNlIHt9IC8vIHRoZXJlIGlzIGEgdGlsZSB1bmRlciB1cywgc28gd2UgY2FuJ3QgZmFsbCBkb3duIG5vd1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmUtYWRkIGVsZW1lbnRzIGF0IHRvcFxyXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IEJPQVJEX1dJRFRIIC0gMTsgY29sKyspIHtcclxuICAgICAgICAgICAgbGV0IHRpbGUgPSB0aGlzLmdldFRpbGVBdChjb2wsIDApO1xyXG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aWxlKSB7XHJcbiAgICAgICAgICAgICAgICBibG9ja0lucHV0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE8oZGtnKTogZmlndXJlIG91dCB3aHkgdGhpcyBkb2Vzbid0IHdvcmsgLSB0aGUgZ3Jhdml0eVxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBpcyBub3QgYXBwbGllZCBpbiB0aGUgbmV4dCBmcmFtZSAuLi5cclxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucHVzaChuZXcgVGlsZSh7bnVtYmVyOiBnZXRSYW5kb21JbnQoNiwgOSksIHI6IDAsIGM6IGNvbH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ibG9ja0lucHV0ID0gYmxvY2tJbnB1dDtcclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuXHJcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnBsYXkuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGltcygpIHtcclxuICAgICAgICByZXR1cm4gW3BhcnNlSW50KHRoaXMuYm9hcmRFbGVtZW50LmNsaWVudFdpZHRoLCAxMCksIHBhcnNlSW50KHRoaXMuYm9hcmRFbGVtZW50LmNsaWVudEhlaWdodCwgMTApXTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiR2FtZTo6ZHJhd1wiKTtcclxuICAgICAgICB0aGlzLmRyYXdpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICAgICAgbGV0IFt3LCBoXSA9IHRoaXMuZ2V0RGltcygpO1xyXG5cclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogaW1wbGVtZW50IHRoaXMhXHJcbiAgICAgICAgLy8gaWYgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXJlIE5PVCBhIG11bHRpcGxlIG9mIGVpdGhlciBCT0FSRF9XSURUSCBvclxyXG4gICAgICAgIC8vIEJPQVJEX0hFSUdIVCB3ZSBuZWVkIHRvIHVzZSB0aGUgdmFsdWVzIHRoYXQgZml0IGFuZCBcIm1vdmVcIiB0aGUgdG9wIFxyXG4gICAgICAgIC8vIGFuZCBsZWZ0IG9mIHRoZSBib2FyZCBhIGJpdCBhbmQgaW50cm9kdWNlIGEgYmxhY2sgYm9yZGVyIHRoYXQgZmlsbHNcclxuICAgICAgICAvLyB1cCB0aGUgZXh0cmFub3VzIFwic3BhY2UhXHJcbiAgICAgICAgLy8gQWxzbywgbW92ZSB0aGUgYm9hcmQgYXJlYSB0byB0aGUgY2VudGVyIGlmIHRoZXJlIGlzIG1vcmUgY2FudmFzIHNwYWNlXHJcbiAgICAgICAgLy8gdGhhbiBuZWVkZWQgdG8gZGlzcGxheSB0aGUgYm9hcmQuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gZHJhdyBpbmRpdmlkdWFsIHRpbGVzIC0gb25seSB0aGUgdHJhY2tlZCBvbmUgc2hvdWxkIGJlIGRyYXduIG92ZXJcclxuICAgICAgICAvLyBhbGwgb3RoZXIgdGlsZXMgbGFzdCwgYmVjYXVzZSBvdGhlcndpc2UgdGhlIGJvcmRlciBvdXRsaW5lIGlzXHJcbiAgICAgICAgLy8gb3ZlcmRyYXduIGJ5IG5laWdoYm91cmluZyB0aWxlc1xyXG4gICAgICAgIGxldCBkZWxheWVkRGlzcGxheSA9IFtdO1xyXG4gICAgICAgIHRoaXMuYm9hcmQuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGlsZS50cmFja2VkKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxheWVkRGlzcGxheS5wdXNoKHRpbGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGlsZS5kcmF3KGN0eCwgdywgaCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBkZWxheWVkRGlzcGxheS5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgIHRpbGUuZHJhdyhjdHgsIHcsIGgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXR1cm5zIHRoZSBuZWlnaGJvdXJpbmcgdGlsZXMgdGhhdCBoYXZlIHRoZSBzYW1lIG51bWJlciBhcyB0aGUgcHJvdmlkZWQgdGlsZVxyXG4gICAgZmluZE5laWdoYm91cnNGb3JUaWxlKHRpbGUpIHtcclxuICAgICAgICBsZXQgbmVpZ2hib3VycyA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgbGVmdCA9IHRpbGUuYyA+IDAgPyB0aGlzLmdldFRpbGVBdCh0aWxlLmMgLSAxLCB0aWxlLnIpIDogbnVsbDtcclxuICAgICAgICBsZXQgdG9wID0gdGlsZS5yID4gMCA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYywgdGlsZS5yIC0gMSkgOiBudWxsO1xyXG4gICAgICAgIGxldCByaWdodCA9IHRpbGUuYyA8IEJPQVJEX1dJRFRILTEgPyB0aGlzLmdldFRpbGVBdCh0aWxlLmMgKyAxLCB0aWxlLnIpIDogbnVsbDtcclxuICAgICAgICBsZXQgYm90dG9tID0gdGlsZS5yIDwgQk9BUkRfSEVJR0hULTEgPyB0aGlzLmdldFRpbGVBdCh0aWxlLmMsIHRpbGUuciArIDEpIDogbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKG51bGwgIT0gbGVmdCAmJiBsZWZ0Lm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaChsZWZ0KTtcclxuICAgICAgICBpZiAobnVsbCAhPSB0b3AgJiYgdG9wLm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaCh0b3ApO1xyXG4gICAgICAgIGlmIChudWxsICE9IHJpZ2h0ICYmIHJpZ2h0Lm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaChyaWdodCk7XHJcbiAgICAgICAgaWYgKG51bGwgIT0gYm90dG9tICYmIGJvdHRvbS5udW1iZXIgPT09IHRpbGUubnVtYmVyKSBuZWlnaGJvdXJzLnB1c2goYm90dG9tKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5laWdoYm91cnM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VGlsZUF0KGNvbHVtbiwgcm93KSB7XHJcbiAgICAgICAgbGV0IHRpbGUgPSB0aGlzLmJvYXJkLmZpbmQoKHQpID0+IHQuYyA9PT0gY29sdW1uICYmIHQuciA9PT0gcm93KTtcclxuICAgICAgICByZXR1cm4gISF0aWxlID8gdGlsZSA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRpbGVzIHRoYXQgc2hhcmUgdGhlIHNhbWUgbnVtYmVyIGFzIHRoZSBvbmUgcHJvdmlkZWRcclxuICAgIC8vIGFuZCB0aGF0IGFyZSBjb250aW5vdXNseSBjb25uZWN0ZWQgdGhyb3VnaG91dCBlYWNoIG90aGVyLlxyXG4gICAgLy8gSW1wb3J0YW50OiBib2FyZCBib3JkZXJzIGFyZSBjdXQgb2ZmIHBvaW50cyFcclxuICAgIGdhdGhlckNvbm5lY3RlZFRpbGVzKHRpbGUpIHtcclxuXHJcbiAgICAgICAgLy8gQSBsaXN0IG9mIGFycmF5IGluZGljZXMgdGhhdCBhcmUgY29ubmVjdGVkIHRvIHRoZSB0aWxlXHJcbiAgICAgICAgLy8gYW5kIGZ1cnRoZXJtb3JlIHRvIG90aGVyIHRpbGVzIHdpdGggdGhlIHNhbWUgdmFsdWUvbnVtYmVyLlxyXG4gICAgICAgIGxldCBjb25uZWN0ZWQgPSBbXTsgXHJcblxyXG4gICAgICAgIC8vIFNlYXJjaGVzIHRocm91Z2ggYWxsIG5laWdoYm91cnMgdG8gZmluZCBhbGwgY29ubmVjdGVkIHRpbGVzLlxyXG4gICAgICAgIGxldCBjcmF3bCA9IChyb290VGlsZSwgY3Jhd2xlZCwgaWdub3JlUm9vdCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocm9vdFRpbGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcInJvb3RUaWxlIG5vdCBzZXRcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG51bSA9IHJvb3RUaWxlLm51bWJlcjtcclxuICAgICAgICAgICAgY3Jhd2xlZC5wdXNoKHJvb3RUaWxlKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBuZWlnaGJvdXJzID0gdGhpcy5maW5kTmVpZ2hib3Vyc0ZvclRpbGUocm9vdFRpbGUpLFxyXG4gICAgICAgICAgICAgICAgY291bnRlZCA9IG5laWdoYm91cnMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudGVkOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCB0ID0gbmVpZ2hib3Vyc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICBpZHhPZiA9IGNyYXdsZWQuaW5kZXhPZih0KTtcclxuICAgICAgICAgICAgICAgIGlmIChpZHhPZiA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjcmF3bCh0LCBjcmF3bGVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgY3Jhd2wodGlsZSwgY29ubmVjdGVkLCB0cnVlKTtcclxuICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGhhdmUgb3VyIGluaXRpYWwgdGlsZSBpbiB0aGUgcmVzdWx0IHNldFxyXG4gICAgICAgIHJldHVybiBjb25uZWN0ZWQuZmlsdGVyKCh0KSA9PiAhKHQuciA9PT0gdGlsZS5yICYmIHQuYyA9PT0gdGlsZS5jKSk7XHJcbiAgICB9XHJcbiAgICBcclxufSAvLyBjbGFzcyBHYW1lXHJcbiIsIi8qXHJcbiAqICBVdGlsaXR5IGZ1bmN0aW9uc1xyXG4gKi9cclxuIFxyXG5sZXQgZ2V0UmFuZG9tSW50ID0gKG1pbiwgbWF4ID0gZmFsc2UpID0+IHtcclxuICAgIGlmIChtYXggPT09IGZhbHNlKSB7XHJcbiAgICAgICAgbWF4ID0gbWluO1xyXG4gICAgICAgIG1pbiA9IDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGFyc2VJbnQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbiwgMTApO1xyXG59O1xyXG5cclxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTIwNDMyMjgvMTkzMTY1XHJcbmZ1bmN0aW9uIGlzRGFya0NvbG9yKGNvbG9yKSB7XHJcbiAgICB2YXIgYyA9IGNvbG9yLmxlbmd0aCA9PT0gNiA/IGNvbG9yIDogY29sb3Iuc3Vic3RyaW5nKDEpOyAvLyBzdHJpcCAjXHJcbiAgICB2YXIgcmdiID0gcGFyc2VJbnQoYywgMTYpOyAgIC8vIGNvbnZlcnQgcnJnZ2JiIHRvIGRlY2ltYWxcclxuICAgIHZhciByID0gKHJnYiA+PiAxNikgJiAweGZmOyAgLy8gZXh0cmFjdCByZWRcclxuICAgIHZhciBnID0gKHJnYiA+PiAgOCkgJiAweGZmOyAgLy8gZXh0cmFjdCBncmVlblxyXG4gICAgdmFyIGIgPSAocmdiID4+ICAwKSAmIDB4ZmY7ICAvLyBleHRyYWN0IGJsdWVcclxuXHJcbiAgICAvLyB1c2UgYSBzdGFuZGFyZCBmb3JtdWxhIHRvIGNvbnZlcnQgdGhlIHJlc3VsdGluZyBSR0IgdmFsdWVzIGludG8gdGhlaXIgcGVyY2VpdmVkIGJyaWdodG5lc3NcclxuICAgIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1JlYy5fNzA5I0x1bWFfY29lZmZpY2llbnRzXHJcbiAgICB2YXIgbHVtYSA9IDAuMjEyNiAqIHIgKyAwLjcxNTIgKiBnICsgMC4wNzIyICogYjsgLy8gcGVyIElUVS1SIEJULjcwOVxyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKFwibHVtYSBmb3IgY29sb3I6XCIsIGNvbG9yLCBsdW1hKTtcclxuXHJcbiAgICByZXR1cm4gbHVtYSA8IDgwOyAvLyB0b28gZGFyayBpZiBsdW1hIGlzIHNtYWxsZXIgdGhhbiBOXHJcbn1cclxuXHJcblxyXG5leHBvcnQgeyBnZXRSYW5kb21JbnQsIGlzRGFya0NvbG9yIH07XHJcbiJdfQ==
