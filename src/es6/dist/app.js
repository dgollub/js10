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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiQzovVXNlcnMvZGtnL1Byb2pla3RlL2dhbWVzL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNHQSxZQUFZLENBQUM7O0FBRWIsU0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7QUFBRSxXQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUFFOztBQUVqRyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUwsWUFBWSxDQUFBLENBQUE7O0FBRTdCLElBQUksU0FBUyxHQUFHLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQU5qRCxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUE7O0FBRXZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBSXJCLElBQUksSUFBSSxHQUFHLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFVLENBQUM7QUFDdEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUdaLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxFQUFFLEVBQUs7O0FBRXBDLFdBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFbEMsUUFBSSxHQUFHLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFVLENBQUM7QUFDbEIsUUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0NBRWYsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FDYkgs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QVBnQixXQUFXLEdBQVgsV0FBVyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXHJcbiAgICBFUzYgY29kZSBlbnRyeSBwb2ludFxyXG4qL1xyXG5jb25zdCBWRVJTSU9OID0gXCIwLjAuMlwiXHJcblxyXG5jb25zb2xlLmxvZyhWRVJTSU9OKTtcclxuXHJcbmltcG9ydCBHYW1lIGZyb20gJy4vZ2FtZS5lczYnO1xyXG5cclxubGV0IGdhbWUgPSBuZXcgR2FtZSgpO1xyXG5nYW1lLnBsYXkoKTtcclxuXHJcblxyXG4kKFwiI2J1dHRvblJlc3RhcnRcIikub24oXCJjbGlja1wiLCAoZXYpID0+IHtcclxuXHJcbiAgICBjb25zb2xlLmluZm8oXCI9PT0+IFJFU1RBUlQgR0FNRVwiKTtcclxuXHJcbiAgICBnYW1lID0gbmV3IEdhbWUoKTtcclxuICAgIGdhbWUucGxheSgpO1xyXG5cclxufSk7XHJcblxyXG4iLCIvKlxyXG4gICAgVGhlIGdhbWUgY29kZSBhbmQgbG9naWMsIHdpdGggVUkgaGFuZGxpbmcuXHJcbiAgICBUT0RPKGRrZyk6IHVzZSB0aGUgZm9sbG93aW5nIHRlY2huaXF1ZXNcclxuICAgICAgICAtIGdlbmVyYXRvcnMgYW5kIHlpZWxkXHJcbiAgICAgICAgLSBTeW1ib2xzXHJcbiovXHJcblxyXG5pbXBvcnQgeyBnZXRSYW5kb21JbnQsIGlzRGFya0NvbG9yIH0gZnJvbSAnLi91dGlscy5lczYnO1xyXG5cclxuLy8gdGhlc2UgYXJlIG5vdCBpbiBwaXhlbCwgYnV0IHJhdGhlciBvdXIgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgdW5pdHNcclxuLy8gdGhpcyBtZWFucyBOID0gTiBudW1iZXIgb2YgaXRlbXMsIGUuZy4gMTAgPSAxMCBpdGVtcywgbm90IDEwIHBpeGVsc1xyXG4vLyB0aGUgZHJhdygpIGNhbGwgd2lsbCBjb252ZXJ0IHRob3NlIGludG8gcHJvcGVyIHBpeGVsc1xyXG5jb25zdCBCT0FSRF9XSURUSCA9IDEwO1xyXG5jb25zdCBCT0FSRF9IRUlHSFQgPSAxMDtcclxuY29uc3QgQk9BUkRfVElMRVNfQ09VTlQgPSBCT0FSRF9XSURUSCAqIEJPQVJEX0hFSUdIVDtcclxuXHJcbmNvbnN0IENPTE9SUyA9ICgoKSA9PiB7XHJcbiAgICAvLyBUT0RPKGRrZyk6IGVsaW1pbmF0ZSBjb2xvcnMgdGhhdCBhcmUgdG9vIGNsb3NlIHRvIGVhY2ggb3RoZXIgYW5kL29yIGR1cGxpY2F0ZXNcclxuICAgIGxldCBpbm5lciA9ICgpID0+IHtcclxuICAgICAgICBsZXQgcmdiID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHYgPSAocGFyc2VJbnQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU1KSwgMTApKS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICAgIGlmICh2Lmxlbmd0aCA8PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB2ID0gYDAke3Z9YDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZ2IucHVzaCh2KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmV0dXJuICdyZ2IoJysgcmdiLmpvaW4oJywnKSArJyknO1xyXG4gICAgICAgIHJldHVybiAnIycgKyByZ2Iuam9pbihcIlwiKTtcclxuICAgIH1cclxuICAgIGxldCByZXQgPSBbXTtcclxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgMTAwMDsgeCsrKSB7XHJcbiAgICAgICAgcmV0LnB1c2goaW5uZXIoKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59KSgpO1xyXG5cclxubGV0IF9ybmRDb2xvciA9IDA7XHJcbmxldCBnZXRDb2xvciA9IChpZHggPSAtMSkgPT4ge1xyXG4gICAgaWYgKF9ybmRDb2xvciA+PSBDT0xPUlMubGVuZ3RoKVxyXG4gICAgICAgIF9ybmRDb2xvciA9IDA7XHJcbiAgICBpZiAoaWR4ID4gLTEgJiYgaWR4IDwgQ09MT1JTLmxlbmd0aClcclxuICAgICAgICByZXR1cm4gQ09MT1JTW2lkeF07XHJcbiAgICByZXR1cm4gQ09MT1JTW19ybmRDb2xvcisrXTtcclxufTtcclxuXHJcbmNvbnN0IE1BR0lDX0NPTE9SUyA9ICgoKSA9PiB7XHJcbiAgICBsZXQgcmV0ID0gW107XHJcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IDUwOyB4KyspIHtcclxuICAgICAgICByZXQucHVzaChnZXRDb2xvcih4KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59KSgpO1xyXG5jb25zdCBNQUdJQ19DT0xPUlNfUkVWRVJTRSA9ICgoKSA9PiB7XHJcbiAgICByZXR1cm4gWy4uLk1BR0lDX0NPTE9SU10ucmV2ZXJzZSgpO1xyXG59KSgpO1xyXG5cclxuY29uc3QgTU9WRV9TVEVQU19JTl9GUkFNRVMgPSAzMDsgIC8vIDMwIG9yIGluIDAuNSBzZWNvbmRzLCBhc3N1bWluZyA2MCBmcmFtZXMvc2VjXHJcblxyXG4vLyBjb25zb2xlLmxvZyhNQUdJQ19DT0xPUlMpO1xyXG5cclxuY2xhc3MgVGlsZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoeyBudW1iZXIgPSAwLCBjID0gMCwgciA9IDAgfSA9IHt9KSB7XHJcbiAgICAgICAgdGhpcy5udW1iZXIgPSBudW1iZXIgfHwgZ2V0UmFuZG9tSW50KDEsIDMpO1xyXG4gICAgICAgIC8vIGluIGNvbC9yb3cgY29vcmRpbmF0ZXMsIHRoYXQgaXMgaW4gb3VyIG93biBpbnRlcm5hbCB1bml0c1xyXG4gICAgICAgIHRoaXMuYyA9IGM7XHJcbiAgICAgICAgdGhpcy5yID0gcjtcclxuICAgICAgICB0aGlzLm1vdmVUbyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFBvc2l0aW9uID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IDQ7IC8vIHJhbmRvbSBudW1iZXIsIGhpZGRlbiB4a2NkIHJlZmVyZW5jZVxyXG4gICAgICAgIHRoaXMuc3RlcHNNb3ZlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZlSW5GcmFtZXMgPSAwO1xyXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudHJhY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaW5jcmVhc2VOdW1iZXIgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzQ29sbGFwc2UgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbm5lY3RlZENvdW50ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYWxsZWQgb25jZSBwZXIgZnJhbWUgLSBvbmx5IG9uY2UgcGVyIGZyYW1lIVxyXG4gICAgZHJhdyhjdHgsIHN3LCBzaCkge1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogcmFuZG9taXplIGNvbG9yIGFjY29yZGluZyB0byB0aGlzLm51bWJlclxyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogaW1wbGVtZW50IHRpbGUgZGVzdHJ1Y3Rpb24gYW5kIGFkZGluZyBuZXcgdGlsZXMgZnJvbSBhYm92ZVxyXG4gICAgICAgIC8vICAgICAgICAgICAgV291bGQgYmUgY29vbCBpZiB0aGUgdGlsZSB3b3VsZCBleHBsb2RlIGluIGh1Z2UgZXhwbG9zaW9uXHJcbiAgICAgICAgLy8gICAgICAgICAgICBidXQgb25seSBpZiB0aGUgbnVtYmVyIGlzIDkgYW5kIGl0IHdvdWxkIGJlY29tZSBhIDEwLlxyXG4gICAgICAgIGlmICh0aGlzLmRlc3Ryb3kgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5udW1iZXIgPD0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IFt3LCBoXSA9IHRoaXMudGlsZURpbWVuc2lvbnMoc3csIHNoKTtcclxuICAgICAgICAvLyB0aGVzZSBhcmUgdGhlIG9yaWdpbmFsIHBpeGVsIGNvb3JkcyAtIHRoZXkgbmVlZCB0byBiZSBhZGp1c3RlZFxyXG4gICAgICAgIC8vIHdoZW4gd2UgaGF2ZSB0byBjb2xsYXBzZVxyXG4gICAgICAgIGxldCBbbCwgdF0gPSB0aGlzLmNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubW92ZVRvKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE8oZGtnKTogQ2hlY2sgaWYgd2UgYXJlIGFscmVhZHkgaW4gdGhlIGNvcnJlY3Qgc3BvdCBhbmRcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICBpZiB3ZSBhcmUsIGp1c3QgbWFyayB1cyBhcyBkZXN0cm95ZWQuXHJcblxyXG4gICAgICAgICAgICAvLyBOT1RFKGRrZyk6IGFuaW1hdGlvbiBpZGVhIC0gaGF2ZSB0aGUgdGlsZXMgc2hyaW5rIGFuZCBkaXNhcHBlYXIgaW5zdGVhZCBtYXliZT9cclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE8oZGtnKTogZmlndXJlIG91dCBob3cgdG8gYWRkIHZlbG9jaXR5IGludG8gdGhlIGNvZGUgYmVsb3dcclxuXHJcbiAgICAgICAgICAgIC8vIHN0ZXBzTW92ZWQgaXMgaW1wb3J0YW50LCBhcyB3ZSB3YW50IHRvIGtlZXAgdHJhY2sgaG93IGZhclxyXG4gICAgICAgICAgICAvLyB3ZSBhcmUgaW50byB0aGUgYW5pbWF0aW9uIGN5Y2xlIGZvciB0aGlzIG1vdmUsIGV2ZW4gd2hlbiB0aGUgXHJcbiAgICAgICAgICAgIC8vIHVzZXIgY2hhbmdlcyB0aGUgc2l6ZSBvZiB0aGUgd2luZG93IGFuZCB0aGVyZWZvcmUgdGhlIGNhbnZhcyBkaW1lbnNpb25zXHJcbiAgICAgICAgICAgIGxldCBzdGVwID0gKyt0aGlzLnN0ZXBzTW92ZWQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgW2RyLCBkY10gPSBbdGhpcy5tb3ZlVG8uciAtIHRoaXMuciwgdGhpcy5tb3ZlVG8uYyAtIHRoaXMuY107XHJcbiAgICAgICAgICAgIGxldCBbZHNyLCBkc2NdID0gW2RyIC8gTU9WRV9TVEVQU19JTl9GUkFNRVMsIGRjIC8gTU9WRV9TVEVQU19JTl9GUkFNRVNdO1xyXG4gICAgICAgICAgICBsZXQgW3N0ZXBzRnJhY3Rpb25Sb3dzLCBzdGVwc0ZyYWN0aW9uQ29sdW1uc10gPSBbIHN0ZXAgKiBkc3IsIHN0ZXAgKiBkc2MgXTsgXHJcbiAgICAgICAgICAgIGxldCBbbW92ZVJvd3NJblBpeGVsLCBtb3ZlQ29sc0luUGl4ZWxdID0gW2ggKiBzdGVwc0ZyYWN0aW9uUm93cywgdyAqIHN0ZXBzRnJhY3Rpb25Db2x1bW5zXTtcclxuXHJcbiAgICAgICAgICAgIFtsLCB0XSA9IFtsICsgbW92ZUNvbHNJblBpeGVsLCB0ICsgbW92ZVJvd3NJblBpeGVsXTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE8oZGtnKTogYWRkIGNoZWNrIGZvciBcImlzIHRoZSB0aWxlIGFscmVhZHkgb24gdGhlIHBvc2l0aW9uIHdoZXJlIGl0IHNob3VsZCBiZVwiXHJcbiAgICAgICAgICAgIGlmIChzdGVwID49IHRoaXMubW92ZUluRnJhbWVzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgW2wsIHRdID0gdGhpcy5tb3ZlVG8uY2FudmFzQ29vcmRpbmF0ZXMoc3csIHNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnIgPSB0aGlzLm1vdmVUby5yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jID0gdGhpcy5tb3ZlVG8uYztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNDb2xsYXBzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZVRvLmluY3JlYXNlTnVtYmVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3kgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNDb2xsYXBzZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc3RlcHNNb3ZlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVUbyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgbGV0IGZpbGxDb2xvciA9IE1BR0lDX0NPTE9SU1t0aGlzLm51bWJlci0xXTtcclxuICAgICAgICBsZXQgYW50aUNvbG9yID0gaXNEYXJrQ29sb3IoZmlsbENvbG9yKSA/IFwibGlnaHRncmF5XCIgOiBcImJsYWNrXCI7XHJcblxyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAxO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3I7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KGwsIHQsIHcsIGgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy50cmFja2VkKSB7XHJcbiAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSA0O1xyXG4gICAgICAgICAgICAvLyBjdHguc3Ryb2tlU3R5bGUgPSBNQUdJQ19DT0xPUlNfUkVWRVJTRVt0aGlzLm51bWJlci0xXTtcclxuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gYW50aUNvbG9yO1xyXG4gICAgICAgICAgICBjdHguc3Ryb2tlUmVjdChsLCB0LCB3LCBoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHdyaXRlIHRoZSBudW1iZXIgaW4gdGhlIGNlbnRlciBvZiB0aGUgdGlsZVxyXG4gICAgICAgIGxldCBbeCwgeV0gPSBbXHJcbiAgICAgICAgICAgIGwgKyBNYXRoLmNlaWwodyAvIDIuMCksIFxyXG4gICAgICAgICAgICB0ICsgTWF0aC5jZWlsKGggLyAyLjApXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgLy8gY3R4LmZpbGxTdHlsZSA9IE1BR0lDX0NPTE9SU19SRVZFUlNFW3RoaXMubnVtYmVyXTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gYW50aUNvbG9yO1xyXG4gICAgICAgIGN0eC5mb250ID0gXCIzMnB4IGNvdXJpZXJcIjtcclxuICAgICAgICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcclxuICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcclxuICAgICAgICBjdHguZmlsbFRleHQodGhpcy5udW1iZXIsIHgsIHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZhbGxEb3duVG8odGFyZ2V0VGlsZSkge1xyXG4gICAgICAgIHRoaXMubW92ZVRvID0gdGFyZ2V0VGlsZTtcclxuICAgICAgICB0aGlzLnN0ZXBzTW92ZWQgPSAwO1xyXG4gICAgICAgIHRoaXMubW92ZUluRnJhbWVzID0gTU9WRV9TVEVQU19JTl9GUkFNRVMgLyAzO1xyXG4gICAgICAgIHRoaXMuaXNDb2xsYXBzZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGFuaW1hdGVDb2xsYXBzZVRvKHRhcmdldFRpbGUpIHtcclxuICAgICAgICB0aGlzLm1vdmVUbyA9IHRhcmdldFRpbGU7XHJcbiAgICAgICAgdGhpcy5zdGVwc01vdmVkID0gMDtcclxuICAgICAgICB0aGlzLm1vdmVJbkZyYW1lcyA9IE1PVkVfU1RFUFNfSU5fRlJBTUVTIC8gNDtcclxuICAgICAgICB0aGlzLmlzQ29sbGFwc2UgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCkge1xyXG4gICAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudCB0aWxlIHBvc2l0aW9uIGluIHBpeGVsXHJcbiAgICAgICAgbGV0IFt0dywgdGhdID0gdGhpcy50aWxlRGltZW5zaW9ucyhzdywgc2gpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGNhbGMgdGhlIHRvcCBhbmQgbGVmdCBjb29yZGluYXRlcyBpbiBwaXhlbCAodG9wLWxlZnQgaXMgMCwgMCBpbiBvdXIgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICAgICAgICAvLyBhbmQgYm90dG9tLXJpZ2h0IGlzIG91ciBzY3JlZW5faGVpZ2h0LXNjcmVlbl93aWR0aClcclxuICAgICAgICAvLyB0aGlzIGRlcGVuZHMgb24gdGhlIHRpbGVzIHBvc2l0aW9uIChpbiBjb2wvcm93IGNvb3JkcylcclxuICAgICAgICAvLyBJbiBjYXNlIHdlIGFyZSBtb3ZpbmcvY29sbGFwc2luZyBvbnRvIGFub3RoZXIgdGlsZSwgd2Ugd2lsbCBuZWVkXHJcbiAgICAgICAgLy8gdG8gbW92ZSBvbmNlIHBlciBmcmFtZSBpbnRvIGEgY2VydGFpbiBkaXJlY3Rpb24uXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IFtsLCB0XSA9IFtcclxuICAgICAgICAgICAgdGhpcy5jICogdHcsXHJcbiAgICAgICAgICAgIHRoaXMuciAqIHRoXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgLy8gd2Ugd2VyZSBhZGRlZCBhdCB0aGUgdG9wIGFmdGVyIG90aGVyIHRpbGVzIGZlbGwgZG93blxyXG4gICAgICAgIC8vIHNvIGxldCdzIGNvbWUgaW4gZ2VudGx5IGZyb20gdGhlIHRvcFxyXG4gICAgICAgIGlmICh0aGlzLnIgPT0gLTEpIHtcclxuICAgICAgICAgICAgdCA9IHRoIC8gNS4wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIFtsLCB0XTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGlsZURpbWVuc2lvbnMoc3csIHNoKSB7XHJcbiAgICAgICAgLy8gY2FsYyB0aWxlIHdpZHRoIGFuZCBoZWlnaHQgaW4gcGl4ZWxzIGZvciBvbmUgdGlsZVxyXG4gICAgICAgIC8vIERFUEVORElORyBvbiB0aGUgY3VycmVudCBzY3JlZW4gb3IgYm9hcmQgZGltZW5zaW9uIVxyXG4gICAgICAgIC8vIHN3OiBzY3JlZW4gb3IgYm9hcmQgd2lkdGggaW4gcGl4ZWxcclxuICAgICAgICAvLyBzaDogc2NyZWVuIG9yIGJvYXJkIGhlaWdodCBpbiBwaXhlbFxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBbdHcsIHRoXSA9IFtNYXRoLmNlaWwoc3cgLyBCT0FSRF9XSURUSCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY2VpbChzaCAvIEJPQVJEX0hFSUdIVCldO1xyXG4gICAgICAgIHJldHVybiBbdHcsIHRoXTtcclxuICAgIH1cclxufSAvLyBjbGFzcyBUaWxlXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmJsb2NrSW5wdXQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnBvaW50cyA9IDA7XHJcbiAgICAgICAgJChcIiNwb2ludHNcIikuaHRtbChgTm8gcG9pbnRzIDotKGApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB0aWxlcyA9ICgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB0aWxlcyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb3VudGVyID0gMDsgY291bnRlciA8IEJPQVJEX1RJTEVTX0NPVU5UOyBjb3VudGVyKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgW2NvbHVtbiwgcm93XSA9IFtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChjb3VudGVyICUgQk9BUkRfV0lEVEgsIDEwKSwgICAgICAgICAgICAgIC8vIHBvc2l0aW9uIGluIGNvbHVtblxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KE1hdGguZmxvb3IoY291bnRlciAvIEJPQVJEX0hFSUdIVCksIDEwKSwgLy8gcG9zaXRpb24gaW4gcm93XHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0aWxlID0gbmV3IFRpbGUoeyBudW1iZXI6IGdldFJhbmRvbUludCgxLCAzKSwgYzogY29sdW1uLCByOiByb3cgfSk7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aWxlcztcclxuICAgICAgICB9KSgpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSB0aWxlcztcclxuICAgIFxyXG4gICAgICAgIGxldCBib2FyZEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkXCIpO1xyXG4gICAgICAgIGxldCBjb250ZXh0ID0gYm9hcmRFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHggPSBjb250ZXh0O1xyXG4gICAgICAgIHRoaXMuYm9hcmRFbGVtZW50ID0gYm9hcmRFbGVtZW50O1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHJlc2l6ZSA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgW3d3LCB3aF0gPSBbJCh3aW5kb3cpLndpZHRoKCksICQod2luZG93KS5oZWlnaHQoKV07XHJcbiAgICAgICAgICAgIGxldCBtYXJnaW4gPSAyMDA7XHJcbiAgICAgICAgICAgIGxldCAkYm9hcmQgPSAkKFwiI2JvYXJkXCIpO1xyXG4gICAgICAgICAgICAkYm9hcmQuaGVpZ2h0KGAke3doLW1hcmdpbn1weGApO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0ID0gd2gtbWFyZ2luO1xyXG4gICAgICAgICAgICB0aGlzLmN0eC5jYW52YXMud2lkdGggPSAkYm9hcmQud2lkdGgoKTsgLy8gdGhpcyBzaG91bGQgdGFrZSBtYXJnaW5zIGFuZCBDU1MgaW50byBhY2NvdW50XHJcbiAgICAgICAgICAgIC8vIHRoaXMuZHJhdygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHJlc2l6ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGdldE1vdXNlQ29vcmRpbmF0ZXMgPSAoZXYpID0+IHtcclxuICAgICAgICAgICAgbGV0IGV2ZW50ID0gZXYgfHwgd2luZG93LmV2ZW50OyAvLyBJRS1pc21cclxuICAgICAgICAgICAgLy8gSWYgcGFnZVgvWSBhcmVuJ3QgYXZhaWxhYmxlIGFuZCBjbGllbnRYL1kgYXJlLFxyXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgcGFnZVgvWSAtIGxvZ2ljIHRha2VuIGZyb20galF1ZXJ5LlxyXG4gICAgICAgICAgICBpZiAoZXZlbnQucGFnZVggPT0gbnVsbCAmJiBldmVudC5jbGllbnRYICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBldmVudERvYyA9IChldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0Lm93bmVyRG9jdW1lbnQpIHx8IGRvY3VtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGRvYyA9IGV2ZW50RG9jLmRvY3VtZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gZXZlbnREb2MuYm9keTtcclxuXHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWdlWCA9IGV2ZW50LmNsaWVudFggK1xyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5zY3JvbGxMZWZ0IHx8IGJvZHkgJiYgYm9keS5zY3JvbGxMZWZ0IHx8IDApIC1cclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2MuY2xpZW50TGVmdCB8fCBib2R5ICYmIGJvZHkuY2xpZW50TGVmdCB8fCAwKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhZ2VZID0gZXZlbnQuY2xpZW50WSArXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLnNjcm9sbFRvcCAgfHwgYm9keSAmJiBib2R5LnNjcm9sbFRvcCAgfHwgMCkgLVxyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5jbGllbnRUb3AgIHx8IGJvZHkgJiYgYm9keS5jbGllbnRUb3AgIHx8IDAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHBhcmVudE9mZnNldCA9ICQoZXZlbnQudGFyZ2V0KS5wYXJlbnQoKS5vZmZzZXQoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBtb3VzZVBvcyA9IHtcclxuICAgICAgICAgICAgICAgIHg6IGV2ZW50LnBhZ2VYIC0gcGFyZW50T2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgICAgICAgICB5OiBldmVudC5wYWdlWSAtIHBhcmVudE9mZnNldC50b3BcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwibW91c2UgbW92ZWRcIiwgbW91c2VQb3MueCwgbW91c2VQb3MueSk7XHJcbiAgICAgICAgICAgIHJldHVybiBtb3VzZVBvcztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgbW91c2VUcmFja2VyID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBtb3VzZVBvcyA9IGdldE1vdXNlQ29vcmRpbmF0ZXMoZXYpLFxyXG4gICAgICAgICAgICAgICAgZGltcyA9IHRoaXMuZ2V0RGltcygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5ib2FyZC5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aWxlLnRyYWNrZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGlsZS5kZXN0cm95KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHRoZSBtb3VzZVBvcyBpcyBpbiBwaXhlbCBjb29yZHNcclxuICAgICAgICAgICAgICAgIGxldCBbc3csIHNoXSA9IGRpbXM7XHJcbiAgICAgICAgICAgICAgICBsZXQgW3R3LCB0aF0gPSB0aWxlLnRpbGVEaW1lbnNpb25zKHN3LCBzaCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgW3RsLCB0dF0gPSB0aWxlLmNhbnZhc0Nvb3JkaW5hdGVzKHN3LCBzaCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlUG9zLnggPj0gdGwgJiYgbW91c2VQb3MueCA8PSAodGwgKyB0dykgJiZcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZVBvcy55ID49IHR0ICYmIG1vdXNlUG9zLnkgPD0gKHR0ICsgdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGlsZS50cmFja2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgJChcIiNib2FyZFwiKS5vbihcIm1vdXNlbW92ZVwiLCBtb3VzZVRyYWNrZXIpO1xyXG5cclxuICAgICAgICBsZXQgbW91c2VDbGljayA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmxvY2tJbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJpbnB1dCBibG9ja2VkXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBpZiAodGhpcy5kcmF3aW5nICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIklnbm9yZWQgbW91c2UgY2xpY2sgYmVjYXVzZSBJIHdhcyBkcmF3aW5nLlwiKTtcclxuICAgICAgICAgICAgICAgIC8vIHJldHVybjtcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0gZ2V0TW91c2VDb29yZGluYXRlcyhldiksXHJcbiAgICAgICAgICAgICAgICBkaW1zID0gdGhpcy5nZXREaW1zKCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2xpY2tlZCBoZXJlXCIsIG1vdXNlUG9zKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjbGlja2VkT25UaWxlcyA9IHRoaXMuYm9hcmQuZmlsdGVyKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGlsZS50cmFja2VkOyAvLyB3ZSBhcmUgY2hlYXRpbmcgaGVyZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlVGlsZUNsaWNrZWQoY2xpY2tlZE9uVGlsZXMubGVuZ3RoID4gMCA/IGNsaWNrZWRPblRpbGVzWzBdIDogbnVsbCk7XHJcblxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgJChcIiNib2FyZFwiKS5vbihcImNsaWNrXCIsIG1vdXNlQ2xpY2spO1xyXG5cclxuICAgICAgICByZXNpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVUaWxlQ2xpY2tlZChjbGlja2VkT25UaWxlKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJoYW5kbGVUaWxlQ2xpY2tlZFwiLCBjbGlja2VkT25UaWxlKTtcclxuICAgICAgICBpZiAobnVsbCA9PT0gY2xpY2tlZE9uVGlsZSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBUT0RPKGRrZyk6IGNoZWNrIGlmIHRpbGUgaGFzIG5laWdoYm91cnMgd2l0aCB0aGUgc2FtZSBudW1iZXJcclxuICAgICAgICAvLyBpZiB5ZXMsIGluY3JlYXNlIGN1cnJlbnQgdGlsZSdzIG51bWJlciBhbmQgY29sbGFwc2UgYWxsIGNvbm5lY3RlZFxyXG4gICAgICAgIC8vIG5laWdoYm91cnMgd2l0aCB0aGUgc2FtZSBudW1iZXIgb250byB0aGUgdGlsZSAoYW5pbWF0ZSB0aGlzIGFzIHdlbGwpLlxyXG4gICAgICAgIC8vIFRoZW4gbGV0IGdyYXZpdHkgZHJvcCBkb3duIGFsbCB0aWxlcyB0aGF0IGFyZSBoYW5naW5nIGluIHRoZSBhaXIuXHJcbiAgICAgICAgLy8gQWZ0ZXIgdGhhdCBhZGQgZnJlc2ggdGlsZXMgdG8gdGhlIGJvYXJkIHVudGlsIGFsbCBlbXB0eSBzcGFjZXMgYXJlXHJcbiAgICAgICAgLy8gZmlsbGVkIHVwIGFnYWluIC0gbGV0IHRoZXNlIGRyb3AgZnJvbSB0aGUgdG9wIGFzIHdlbGwuXHJcblxyXG4gICAgICAgIGxldCBjb25uZWN0ZWRUaWxlcyA9IHRoaXMuZ2F0aGVyQ29ubmVjdGVkVGlsZXMoY2xpY2tlZE9uVGlsZSk7XHJcbiAgICAgICAgY2xpY2tlZE9uVGlsZS5jb25uZWN0ZWRDb3VudCA9IGNvbm5lY3RlZFRpbGVzLmxlbmd0aDtcclxuICAgICAgICAvLyBUT0RPKGRrZyk6IGZvciBkZWJ1Z2dpbmcgcHVycG9zZXMgZGlzcGxheSBhIG92ZXJsYXkgb3IgXHJcbiAgICAgICAgLy8gICAgICAgICAgICBkaWZmZXJlbnQgYm9yZGVyIGNvbG9yIGZvciBhbGwgY29ubmVjdGVkIHRpbGVzXHJcbiAgICAgICAgLy8gICAgICAgICAgICBhcyBhIHdob2xlLCBub3QgZm9yIGVhY2ggaW5kaXZpZHVhbCBvbmVcclxuICAgICAgICBjb25uZWN0ZWRUaWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGFuaW1hdGUgdG8gY29sbGFwc2Ugb250byBjbGlja2VkIHRpbGVcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIHRpbGVzIGFmdGVyIGFuaW1hdGlvblxyXG4gICAgICAgICAgICAvLyBjb3VudCBhbmQgYWRkIHBvaW50c1xyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiBnYW1lIG92ZXJcclxuICAgICAgICAgICAgdGlsZS5hbmltYXRlQ29sbGFwc2VUbyhjbGlja2VkT25UaWxlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5KCkge1xyXG4gICAgICAgIGxldCBibG9ja0lucHV0ID0gZmFsc2U7XHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiByZW1vdmUgZGVzdHJveWVkIHRpbGVzIGFuZCBhZGQgbmV3IHRpbGVzIGZyb20gYWJvdmUgdGhlIGJvYXJkXHJcbiAgICAgICAgLy8gICAgICAgICAgICB3aXRoIGdyYXZpdHkgcHVsbGluZyB0aGVtIGRvd24gZXRjLlxyXG4gICAgICAgIC8vICAgICAgICAgICAgb25seSBsZXQgdGhlIHBsYXllciBjb250aW51ZSB0byBwbGF5IGFmdGVyIGFsbCBhbmltYXRpb25zIGFyZSBkb25lXHJcbiAgICAgICAgbGV0IHJlbW92ZWQgPSAwO1xyXG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYW55IGRlc3Ryb3llZCB0aWxlcywgcmVtb3ZlIHRoZW0gZnJvbSB0aGUgYXJyYXlcclxuICAgICAgICAvLyBhbHNvIGluY3JlYXNlIGFueSBudW1iZXJzIGlmIHdlIG5lZWQgdG9cclxuICAgICAgICBmb3IgKGxldCBpZHggPSB0aGlzLmJvYXJkLmxlbmd0aC0xOyBpZHgtLTspIHtcclxuICAgICAgICAgICAgbGV0IHRpbGUgPSB0aGlzLmJvYXJkW2lkeF07XHJcbiAgICAgICAgICAgIGlmICh0aWxlLmRlc3Ryb3kgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVkKys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB0aGUgdXNlciBjbGlja2VkIG9uIHRoaXMgdGlsZSwgaXQgd2FzIGNvbm5lY3RlZCB0byBvdGhlcnMgb2ZcclxuICAgICAgICAgICAgLy8gdGhlIHNhbWUga2luZCBzbyB3ZSBuZWVkIHRvIGluY3JlYXNlIHRoZSBudW1iZXJcclxuICAgICAgICAgICAgaWYgKHRpbGUuaW5jcmVhc2VOdW1iZXIgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzICs9IE1hdGguY2VpbChNYXRoLnNxcnQoKCh0aWxlLmNvbm5lY3RlZENvdW50ICsgMSkqKjIpICogKHRpbGUubnVtYmVyKioyKSkpO1xyXG4gICAgICAgICAgICAgICAgdGlsZS5udW1iZXIrKztcclxuICAgICAgICAgICAgICAgIHRpbGUuaW5jcmVhc2VOdW1iZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICQoXCIjcG9pbnRzXCIpLmh0bWwoYFBvaW50czogJHt0aGlzLnBvaW50c31gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB3ZSBhcmUgc3RpbGwgYW5pbWF0aW5nXHJcbiAgICAgICAgICAgIGlmICh0aWxlLnN0ZXBzTW92ZWQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBibG9ja0lucHV0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHdlIG5lZWQgdG8gYXBwbHkgZ3Jhdml0eSB0byB0aGlzIHRpbGVcclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgd2UgYXJlIGF0IHRoZSBib3R0b20gcm93XHJcbiAgICAgICAgICAgIGlmICh0aWxlLnIgPj0gQk9BUkRfSEVJR0hUIC0gMSkgXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgd2UgaGF2ZSBcImFpclwiIHVuZGVybmVhdGggdXMsIHRoZW4gd2UgY2FuIGFwcGx5IGdyYXZpdHkgYW5kXHJcbiAgICAgICAgICAgIC8vIGZhbGwgZG93biBvbmUgc3BvdFxyXG4gICAgICAgICAgICAvLyBGSVhNRShka2cpOiBTb21ldGltZXMgdGhlIHRpbGUgYWJvdmUgZG9lc24ndCBmYWxsIGRvd24uXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIEkgZmVlbCB0aGF0IHRoZSBjaGVjayBmb3IgJ2lzIHBvc2l0aW9uIGVtcHR5IGFuZCBjYW4gSSBmYWxsIGRvd24nXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgIGhhcyBzb21lIHNsaWdodCBlZGdlIGNhc2VzIHRoYXQgY2F1c2VzIHRoaXMuIEludmVzdGlnYXRlIVxyXG4gICAgICAgICAgICBsZXQgdGlsZVVuZGVyVXMgPSB0aGlzLmdldFRpbGVBdCh0aWxlLmMsIHRpbGUuciArIDEpO1xyXG4gICAgICAgICAgICBpZiAobnVsbCA9PSB0aWxlVW5kZXJVcykge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJhcHBseSBncmF2aXR5IG5vd1wiLCB0aWxlKTtcclxuICAgICAgICAgICAgICAgIHRpbGUuZmFsbERvd25UbyhuZXcgVGlsZSh7bnVtYmVyOiAtMSwgcjogdGlsZS5yICsgMSwgYzogdGlsZS5jfSkpO1xyXG4gICAgICAgICAgICAgICAgYmxvY2tJbnB1dCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gLy8gZWxzZSB7fSAvLyB0aGVyZSBpcyBhIHRpbGUgdW5kZXIgdXMsIHNvIHdlIGNhbid0IGZhbGwgZG93biBub3dcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlLWFkZCBlbGVtZW50cyBhdCB0b3BcclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCBCT0FSRF9XSURUSCAtIDE7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0aWxlID0gdGhpcy5nZXRUaWxlQXQoY29sLCAwKTtcclxuICAgICAgICAgICAgaWYgKG51bGwgPT0gdGlsZSkge1xyXG4gICAgICAgICAgICAgICAgYmxvY2tJbnB1dCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPKGRrZyk6IGZpZ3VyZSBvdXQgd2h5IHRoaXMgZG9lc24ndCB3b3JrIC0gdGhlIGdyYXZpdHlcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgaXMgbm90IGFwcGxpZWQgaW4gdGhlIG5leHQgZnJhbWUgLi4uXHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvYXJkLnB1c2gobmV3IFRpbGUoe251bWJlcjogMCwgcjogMCwgYzogY29sfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJsb2NrSW5wdXQgPSBibG9ja0lucHV0O1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG5cclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucGxheS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXREaW1zKCkge1xyXG4gICAgICAgIHJldHVybiBbcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50V2lkdGgsIDEwKSwgcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuY2xpZW50SGVpZ2h0LCAxMCldO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJHYW1lOjpkcmF3XCIpO1xyXG4gICAgICAgIHRoaXMuZHJhd2luZyA9IHRydWU7XHJcblxyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLmN0eDtcclxuICAgICAgICBsZXQgW3csIGhdID0gdGhpcy5nZXREaW1zKCk7XHJcblxyXG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdywgaCk7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgdywgaCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBpbXBsZW1lbnQgdGhpcyFcclxuICAgICAgICAvLyBpZiB0aGUgd2lkdGggYW5kIGhlaWdodCBhcmUgTk9UIGEgbXVsdGlwbGUgb2YgZWl0aGVyIEJPQVJEX1dJRFRIIG9yXHJcbiAgICAgICAgLy8gQk9BUkRfSEVJR0hUIHdlIG5lZWQgdG8gdXNlIHRoZSB2YWx1ZXMgdGhhdCBmaXQgYW5kIFwibW92ZVwiIHRoZSB0b3AgXHJcbiAgICAgICAgLy8gYW5kIGxlZnQgb2YgdGhlIGJvYXJkIGEgYml0IGFuZCBpbnRyb2R1Y2UgYSBibGFjayBib3JkZXIgdGhhdCBmaWxsc1xyXG4gICAgICAgIC8vIHVwIHRoZSBleHRyYW5vdXMgXCJzcGFjZSFcclxuICAgICAgICAvLyBBbHNvLCBtb3ZlIHRoZSBib2FyZCBhcmVhIHRvIHRoZSBjZW50ZXIgaWYgdGhlcmUgaXMgbW9yZSBjYW52YXMgc3BhY2VcclxuICAgICAgICAvLyB0aGFuIG5lZWRlZCB0byBkaXNwbGF5IHRoZSBib2FyZC5cclxuICAgICAgICBcclxuICAgICAgICAvLyBkcmF3IGluZGl2aWR1YWwgdGlsZXMgLSBvbmx5IHRoZSB0cmFja2VkIG9uZSBzaG91bGQgYmUgZHJhd24gb3ZlclxyXG4gICAgICAgIC8vIGFsbCBvdGhlciB0aWxlcyBsYXN0LCBiZWNhdXNlIG90aGVyd2lzZSB0aGUgYm9yZGVyIG91dGxpbmUgaXNcclxuICAgICAgICAvLyBvdmVyZHJhd24gYnkgbmVpZ2hib3VyaW5nIHRpbGVzXHJcbiAgICAgICAgbGV0IGRlbGF5ZWREaXNwbGF5ID0gW107XHJcbiAgICAgICAgdGhpcy5ib2FyZC5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aWxlLnRyYWNrZWQpIHtcclxuICAgICAgICAgICAgICAgIGRlbGF5ZWREaXNwbGF5LnB1c2godGlsZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlLmRyYXcoY3R4LCB3LCBoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGRlbGF5ZWREaXNwbGF5LmZvckVhY2goKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgdGlsZS5kcmF3KGN0eCwgdywgaCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd2luZyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJldHVybnMgdGhlIG5laWdoYm91cmluZyB0aWxlcyB0aGF0IGhhdmUgdGhlIHNhbWUgbnVtYmVyIGFzIHRoZSBwcm92aWRlZCB0aWxlXHJcbiAgICBmaW5kTmVpZ2hib3Vyc0ZvclRpbGUodGlsZSkge1xyXG4gICAgICAgIGxldCBuZWlnaGJvdXJzID0gW107XHJcblxyXG4gICAgICAgIGxldCBsZWZ0ID0gdGlsZS5jID4gMCA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYyAtIDEsIHRpbGUucikgOiBudWxsO1xyXG4gICAgICAgIGxldCB0b3AgPSB0aWxlLnIgPiAwID8gdGhpcy5nZXRUaWxlQXQodGlsZS5jLCB0aWxlLnIgLSAxKSA6IG51bGw7XHJcbiAgICAgICAgbGV0IHJpZ2h0ID0gdGlsZS5jIDwgQk9BUkRfV0lEVEgtMSA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYyArIDEsIHRpbGUucikgOiBudWxsO1xyXG4gICAgICAgIGxldCBib3R0b20gPSB0aWxlLnIgPCBCT0FSRF9IRUlHSFQtMSA/IHRoaXMuZ2V0VGlsZUF0KHRpbGUuYywgdGlsZS5yICsgMSkgOiBudWxsO1xyXG5cclxuICAgICAgICBpZiAobnVsbCAhPSBsZWZ0ICYmIGxlZnQubnVtYmVyID09PSB0aWxlLm51bWJlcikgbmVpZ2hib3Vycy5wdXNoKGxlZnQpO1xyXG4gICAgICAgIGlmIChudWxsICE9IHRvcCAmJiB0b3AubnVtYmVyID09PSB0aWxlLm51bWJlcikgbmVpZ2hib3Vycy5wdXNoKHRvcCk7XHJcbiAgICAgICAgaWYgKG51bGwgIT0gcmlnaHQgJiYgcmlnaHQubnVtYmVyID09PSB0aWxlLm51bWJlcikgbmVpZ2hib3Vycy5wdXNoKHJpZ2h0KTtcclxuICAgICAgICBpZiAobnVsbCAhPSBib3R0b20gJiYgYm90dG9tLm51bWJlciA9PT0gdGlsZS5udW1iZXIpIG5laWdoYm91cnMucHVzaChib3R0b20pO1xyXG5cclxuICAgICAgICByZXR1cm4gbmVpZ2hib3VycztcclxuICAgIH1cclxuXHJcbiAgICBnZXRUaWxlQXQoY29sdW1uLCByb3cpIHtcclxuICAgICAgICBsZXQgdGlsZSA9IHRoaXMuYm9hcmQuZmluZCgodCkgPT4gdC5jID09PSBjb2x1bW4gJiYgdC5yID09PSByb3cpO1xyXG4gICAgICAgIHJldHVybiAhIXRpbGUgPyB0aWxlIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGlsZXMgdGhhdCBzaGFyZSB0aGUgc2FtZSBudW1iZXIgYXMgdGhlIG9uZSBwcm92aWRlZFxyXG4gICAgLy8gYW5kIHRoYXQgYXJlIGNvbnRpbm91c2x5IGNvbm5lY3RlZCB0aHJvdWdob3V0IGVhY2ggb3RoZXIuXHJcbiAgICAvLyBJbXBvcnRhbnQ6IGJvYXJkIGJvcmRlcnMgYXJlIGN1dCBvZmYgcG9pbnRzIVxyXG4gICAgZ2F0aGVyQ29ubmVjdGVkVGlsZXModGlsZSkge1xyXG5cclxuICAgICAgICAvLyBBIGxpc3Qgb2YgYXJyYXkgaW5kaWNlcyB0aGF0IGFyZSBjb25uZWN0ZWQgdG8gdGhlIHRpbGVcclxuICAgICAgICAvLyBhbmQgZnVydGhlcm1vcmUgdG8gb3RoZXIgdGlsZXMgd2l0aCB0aGUgc2FtZSB2YWx1ZS9udW1iZXIuXHJcbiAgICAgICAgbGV0IGNvbm5lY3RlZCA9IFtdOyBcclxuXHJcbiAgICAgICAgLy8gU2VhcmNoZXMgdGhyb3VnaCBhbGwgbmVpZ2hib3VycyB0byBmaW5kIGFsbCBjb25uZWN0ZWQgdGlsZXMuXHJcbiAgICAgICAgbGV0IGNyYXdsID0gKHJvb3RUaWxlLCBjcmF3bGVkLCBpZ25vcmVSb290KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyb290VGlsZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwicm9vdFRpbGUgbm90IHNldFwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbnVtID0gcm9vdFRpbGUubnVtYmVyO1xyXG4gICAgICAgICAgICBjcmF3bGVkLnB1c2gocm9vdFRpbGUpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5laWdoYm91cnMgPSB0aGlzLmZpbmROZWlnaGJvdXJzRm9yVGlsZShyb290VGlsZSksXHJcbiAgICAgICAgICAgICAgICBjb3VudGVkID0gbmVpZ2hib3Vycy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50ZWQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHQgPSBuZWlnaGJvdXJzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkeE9mID0gY3Jhd2xlZC5pbmRleE9mKHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkeE9mID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNyYXdsKHQsIGNyYXdsZWQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICBjcmF3bCh0aWxlLCBjb25uZWN0ZWQsIHRydWUpO1xyXG4gICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gaGF2ZSBvdXIgaW5pdGlhbCB0aWxlIGluIHRoZSByZXN1bHQgc2V0XHJcbiAgICAgICAgcmV0dXJuIGNvbm5lY3RlZC5maWx0ZXIoKHQpID0+ICEodC5yID09PSB0aWxlLnIgJiYgdC5jID09PSB0aWxlLmMpKTtcclxuICAgIH1cclxuICAgIFxyXG59IC8vIGNsYXNzIEdhbWVcclxuIiwiLypcclxuICogIFV0aWxpdHkgZnVuY3Rpb25zXHJcbiAqL1xyXG4gXHJcbmxldCBnZXRSYW5kb21JbnQgPSAobWluLCBtYXggPSBmYWxzZSkgPT4ge1xyXG4gICAgaWYgKG1heCA9PT0gZmFsc2UpIHtcclxuICAgICAgICBtYXggPSBtaW47XHJcbiAgICAgICAgbWluID0gMDtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXJzZUludChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluLCAxMCk7XHJcbn07XHJcblxyXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMjA0MzIyOC8xOTMxNjVcclxuZnVuY3Rpb24gaXNEYXJrQ29sb3IoY29sb3IpIHtcclxuICAgIHZhciBjID0gY29sb3IubGVuZ3RoID09PSA2ID8gY29sb3IgOiBjb2xvci5zdWJzdHJpbmcoMSk7IC8vIHN0cmlwICNcclxuICAgIHZhciByZ2IgPSBwYXJzZUludChjLCAxNik7ICAgLy8gY29udmVydCBycmdnYmIgdG8gZGVjaW1hbFxyXG4gICAgdmFyIHIgPSAocmdiID4+IDE2KSAmIDB4ZmY7ICAvLyBleHRyYWN0IHJlZFxyXG4gICAgdmFyIGcgPSAocmdiID4+ICA4KSAmIDB4ZmY7ICAvLyBleHRyYWN0IGdyZWVuXHJcbiAgICB2YXIgYiA9IChyZ2IgPj4gIDApICYgMHhmZjsgIC8vIGV4dHJhY3QgYmx1ZVxyXG5cclxuICAgIC8vIHVzZSBhIHN0YW5kYXJkIGZvcm11bGEgdG8gY29udmVydCB0aGUgcmVzdWx0aW5nIFJHQiB2YWx1ZXMgaW50byB0aGVpciBwZXJjZWl2ZWQgYnJpZ2h0bmVzc1xyXG4gICAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUmVjLl83MDkjTHVtYV9jb2VmZmljaWVudHNcclxuICAgIHZhciBsdW1hID0gMC4yMTI2ICogciArIDAuNzE1MiAqIGcgKyAwLjA3MjIgKiBiOyAvLyBwZXIgSVRVLVIgQlQuNzA5XHJcblxyXG4gICAgLy8gY29uc29sZS5sb2coXCJsdW1hIGZvciBjb2xvcjpcIiwgY29sb3IsIGx1bWEpO1xyXG5cclxuICAgIHJldHVybiBsdW1hIDwgODA7IC8vIHRvbyBkYXJrIGlmIGx1bWEgaXMgc21hbGxlciB0aGFuIE5cclxufVxyXG5cclxuXHJcbmV4cG9ydCB7IGdldFJhbmRvbUludCwgaXNEYXJrQ29sb3IgfTtcclxuIl19
