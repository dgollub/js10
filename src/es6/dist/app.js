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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _utilsEs6 = require('./utils.es6');

// these are not in pixel, but rather our internal representation of units
// this means N = N number of items, e.g. 10 = 10 items, not 10 pixels
// the draw() call will convert those into proper pixels
var BOARD_WIDTH = 10;
var BOARD_HEIGHT = 10;
var BOARD_TILES_COUNT = BOARD_WIDTH * BOARD_HEIGHT;

var Tile = (function () {
    function Tile() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref$number = _ref.number;
        var number = _ref$number === undefined ? 0 : _ref$number;
        var _ref$itemIndex = _ref.itemIndex;
        var itemIndex = _ref$itemIndex === undefined ? 0 : _ref$itemIndex;

        _classCallCheck(this, Tile);

        this.number = number || (0, _utilsEs6.getRandomInt)(1, 3);
        this.itemIndex = itemIndex || 0; // to be ignored after initial construction
        // in col/row coordinates, that is in our own internal units
        this.orgPos = {
            x: parseInt(this.itemIndex % BOARD_WIDTH, 10), // position in column
            y: parseInt(Math.floor(this.itemIndex / BOARD_HEIGHT), 10) };
        // position in row
        this.pos = Object.assign({}, this.orgPos);
    }

    // class Tile

    _createClass(Tile, [{
        key: "draw",
        value: function draw(ctx, sw, sh) {
            // TODO(dkg): randomize color according to this.number
            var scol = parseFloat(BOARD_TILES_COUNT / BOARD_WIDTH);
            var srow = parseFloat(BOARD_TILES_COUNT / BOARD_HEIGHT);
            var tw = sw / scol;
            var th = sh / srow;

            // calc the top and left coordinates (top-left is 0, 0 in our coordinate system
            // and bottom-right is our screen_height-screen_width)
            // this depends on the tiles position (in col/row coords)
            var l = this.pos.x * tw;
            var t = this.pos.y * th;
            var w = tw;
            var h = th;

            // produce a checker-board pattern
            // TODO(dkg): simplify this code - right now it is stupid
            ctx.fillStyle = this.pos.x % 2 != 0 ? this.pos.y % 2 == 0 ? "#FF4500" : "#FFA500" : this.pos.x % 2 != 0 ? this.pos.y % 2 != 0 ? "#FF4500" : "#FFA500" : this.pos.y % 2 != 0 ? "#FF4500" : "#FFA500";
            ctx.fillRect(l, t, w, h);
        }
    }, {
        key: "drawHover",
        value: function drawHover(ctx) {
            console.log("hover", this);
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
                var tile = new Tile({ number: (0, _utilsEs6.getRandomInt)(1, 3), itemIndex: counter });
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

            // console.log(ww, wh);
            $("#board").height(wh - 200 + "px");
            _this.draw();
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

            var mousePos = {
                x: event.pageX,
                y: event.pageY
            };

            // console.log("mouse moved", mousePos.x, mousePos.y);
            return mousePos;
        };

        var mouseTracker = (function (ev) {
            var pos = getMouseCoordinates(ev),
                dims = _this.getDims();
            // console.log(pos);

            var tilesHovered = _this.board.filter(function (tile) {
                // the pos is in pixel coords relative to the board div
                var scol = parseFloat(BOARD_TILES_COUNT / BOARD_WIDTH);
                var srow = parseFloat(BOARD_TILES_COUNT / BOARD_HEIGHT);

                var _dims = _slicedToArray(dims, 2);

                var sw = _dims[0];
                var sh = _dims[1];
                var tw = sw / scol;
                var th = sh / srow;

                // convert back to pixels
                var x = tw * tile.pos.x,
                    y = th * tile.pos.y;

                if (pos.x >= x && pos.x + x <= sw && pos.y >= y && pos.y + y <= sh) return true;

                return false;
            });

            if (tilesHovered.length > 0) {
                (function () {
                    var ctx = _this.ctx;
                    tilesHovered.forEach(function (tile) {
                        tile.drawHover(ctx);
                    });
                })();
            }
        }).bind(this);

        $("#board").on("mousemove", mouseTracker);

        resize();
    }

    _createClass(Game, [{
        key: "play",
        value: function play() {
            this.draw();
        }
    }, {
        key: "getDims",
        value: function getDims() {
            return [parseInt(this.boardElement.width, 10), parseInt(this.boardElement.height, 10)];
        }
    }, {
        key: "draw",
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

            // draw individual tiles
            this.board.forEach(function (tile) {
                console.log("drawing tile", tile.itemIndex, tile.number);
                tile.draw(ctx, w, h);
            });
        }
    }]);

    return Game;
})();

exports["default"] = Game;
module.exports = exports["default"];
// calc tile width and height in pixels for one tile
// convert them to our internal representation

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2FwcC5lczYiLCJDOi9Vc2Vycy9ka2cvUHJvamVrdGUvZ2FtZXMvanMxMC9zcmMvZXM2L2pzL2dhbWUuZXM2IiwiQzovVXNlcnMvZGtnL1Byb2pla3RlL2dhbWVzL2pzMTAvc3JjL2VzNi9qcy91dGlscy5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O3VCQ09pQixZQUFZOzs7O0FBSjdCLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQTs7QUFFdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFJckIsSUFBSSxJQUFJLEdBQUcsMEJBQVUsQ0FBQztBQUN0QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JDTmlCLGFBQWE7Ozs7O0FBSzFDLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN2QixJQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDeEIsSUFBTSxpQkFBaUIsR0FBRyxXQUFXLEdBQUcsWUFBWSxDQUFDOztJQUUvQyxJQUFJO0FBRUssYUFGVCxJQUFJLEdBRTBDO3lFQUFKLEVBQUU7OytCQUFoQyxNQUFNO1lBQU4sTUFBTSwrQkFBRyxDQUFDO2tDQUFFLFNBQVM7WUFBVCxTQUFTLGtDQUFHLENBQUM7OzhCQUZyQyxJQUFJOztBQUdGLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxJQUFJLDRCQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsSUFBSSxDQUFDLENBQUM7O0FBRWhDLFlBQUksQ0FBQyxNQUFNLEdBQUc7QUFDVixhQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxFQUFFLEVB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QixnQkFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDMUIsdUJBQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3pELG9CQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDdkIsQ0FBQyxDQUFDO1NBRU47OztXQTFIZ0IsSUFBSTs7O3FCQUFKLElBQUk7Ozs7Ozs7Ozs7Ozs7OztBQ3pEekIsSUFBSSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksR0FBRyxFQUFrQjtRQUFoQixHQUFHLHlEQUFHLEtBQUs7O0FBQ2hDLFFBQUksR0FBRyxLQUFLLEtBQUssRUFBRTtBQUNmLFdBQUcsR0FBRyxHQUFHLENBQUM7QUFDVixXQUFHLEdBQUcsQ0FBQyxDQUFDO0tBQ1g7QUFDRCxXQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQSxBQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDMUUsQ0FBQzs7UUFFTyxZQUFZLEdBQVosWUFBWSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxyXG4gICAgRVM2IGNvZGUgZW50cnkgcG9pbnRcclxuKi9cclxuY29uc3QgVkVSU0lPTiA9IFwiMC4wLjFcIlxyXG5cclxuY29uc29sZS5sb2coVkVSU0lPTik7XHJcblxyXG5pbXBvcnQgR2FtZSBmcm9tICcuL2dhbWUuZXM2JztcclxuXHJcbmxldCBnYW1lID0gbmV3IEdhbWUoKTtcclxuZ2FtZS5wbGF5KCk7XHJcbiIsIi8qXHJcbiAgICBUaGUgZ2FtZSBjb2RlIGFuZCBsb2dpYywgd2l0aCBVSSBoYW5kbGluZy5cclxuKi9cclxuXHJcbmltcG9ydCB7IGdldFJhbmRvbUludCB9IGZyb20gJy4vdXRpbHMuZXM2JztcclxuXHJcbi8vIHRoZXNlIGFyZSBub3QgaW4gcGl4ZWwsIGJ1dCByYXRoZXIgb3VyIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHVuaXRzXHJcbi8vIHRoaXMgbWVhbnMgTiA9IE4gbnVtYmVyIG9mIGl0ZW1zLCBlLmcuIDEwID0gMTAgaXRlbXMsIG5vdCAxMCBwaXhlbHNcclxuLy8gdGhlIGRyYXcoKSBjYWxsIHdpbGwgY29udmVydCB0aG9zZSBpbnRvIHByb3BlciBwaXhlbHNcclxuY29uc3QgQk9BUkRfV0lEVEggPSAxMDtcclxuY29uc3QgQk9BUkRfSEVJR0hUID0gMTA7XHJcbmNvbnN0IEJPQVJEX1RJTEVTX0NPVU5UID0gQk9BUkRfV0lEVEggKiBCT0FSRF9IRUlHSFQ7XHJcblxyXG5jbGFzcyBUaWxlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih7IG51bWJlciA9IDAsIGl0ZW1JbmRleCA9IDAgfSA9IHt9KSB7XHJcbiAgICAgICAgdGhpcy5udW1iZXIgPSBudW1iZXIgfHwgZ2V0UmFuZG9tSW50KDEsIDMpO1xyXG4gICAgICAgIHRoaXMuaXRlbUluZGV4ID0gaXRlbUluZGV4IHx8IDA7IC8vIHRvIGJlIGlnbm9yZWQgYWZ0ZXIgaW5pdGlhbCBjb25zdHJ1Y3Rpb25cclxuICAgICAgICAvLyBpbiBjb2wvcm93IGNvb3JkaW5hdGVzLCB0aGF0IGlzIGluIG91ciBvd24gaW50ZXJuYWwgdW5pdHNcclxuICAgICAgICB0aGlzLm9yZ1BvcyA9IHtcclxuICAgICAgICAgICAgeDogcGFyc2VJbnQodGhpcy5pdGVtSW5kZXggJSBCT0FSRF9XSURUSCwgMTApLCAgICAgICAgICAgICAgLy8gcG9zaXRpb24gaW4gY29sdW1uXHJcbiAgICAgICAgICAgIHk6IHBhcnNlSW50KE1hdGguZmxvb3IodGhpcy5pdGVtSW5kZXggLyBCT0FSRF9IRUlHSFQpLCAxMCksIC8vIHBvc2l0aW9uIGluIHJvd1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5wb3MgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9yZ1Bvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjdHgsIHN3LCBzaCkge1xyXG4gICAgICAgIC8vIFRPRE8oZGtnKTogcmFuZG9taXplIGNvbG9yIGFjY29yZGluZyB0byB0aGlzLm51bWJlclxyXG4gICAgICAgIC8vIGNhbGMgdGlsZSB3aWR0aCBhbmQgaGVpZ2h0IGluIHBpeGVscyBmb3Igb25lIHRpbGVcclxuICAgICAgICBsZXQgW3Njb2wsIHNyb3ddID0gW1xyXG4gICAgICAgICAgICBwYXJzZUZsb2F0KEJPQVJEX1RJTEVTX0NPVU5UIC8gQk9BUkRfV0lEVEgpLFxyXG4gICAgICAgICAgICBwYXJzZUZsb2F0KEJPQVJEX1RJTEVTX0NPVU5UIC8gQk9BUkRfSEVJR0hUKVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGxldCBbdHcsIHRoXSA9IFtzdyAvIHNjb2wsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoIC8gc3Jvd107XHJcblxyXG4gICAgICAgIC8vIGNhbGMgdGhlIHRvcCBhbmQgbGVmdCBjb29yZGluYXRlcyAodG9wLWxlZnQgaXMgMCwgMCBpbiBvdXIgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICAgICAgICAvLyBhbmQgYm90dG9tLXJpZ2h0IGlzIG91ciBzY3JlZW5faGVpZ2h0LXNjcmVlbl93aWR0aClcclxuICAgICAgICAvLyB0aGlzIGRlcGVuZHMgb24gdGhlIHRpbGVzIHBvc2l0aW9uIChpbiBjb2wvcm93IGNvb3JkcylcclxuICAgICAgICBsZXQgW2wsIHRdID0gW1xyXG4gICAgICAgICAgICB0aGlzLnBvcy54ICogdHcsXHJcbiAgICAgICAgICAgIHRoaXMucG9zLnkgKiB0aFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIGxldCBbdywgaF0gPSBbdHcsIHRoXTtcclxuICAgICAgICAvLyBwcm9kdWNlIGEgY2hlY2tlci1ib2FyZCBwYXR0ZXJuXHJcbiAgICAgICAgLy8gVE9ETyhka2cpOiBzaW1wbGlmeSB0aGlzIGNvZGUgLSByaWdodCBub3cgaXQgaXMgc3R1cGlkXHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucG9zLnggJSAyICE9IDAgPyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHRoaXMucG9zLnkgJSAyID09IDAgPyBcIiNGRjQ1MDBcIiA6IFwiI0ZGQTUwMFwiKSA6IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAodGhpcy5wb3MueCAlIDIgIT0gMCA/IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAodGhpcy5wb3MueSAlIDIgIT0gMCA/IFwiI0ZGNDUwMFwiIDogXCIjRkZBNTAwXCIpIDogXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGlzLnBvcy55ICUgMiAhPSAwID8gXCIjRkY0NTAwXCIgOiBcIiNGRkE1MDBcIikpO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdChsLCB0LCB3LCBoKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3SG92ZXIoY3R4KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJob3ZlclwiLCB0aGlzKTtcclxuICAgIH1cclxufSAvLyBjbGFzcyBUaWxlXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAgICAgbGV0IHRpbGVzID0gKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRpbGVzID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvdW50ZXIgPSAwOyBjb3VudGVyIDwgQk9BUkRfVElMRVNfQ09VTlQ7IGNvdW50ZXIrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGUgPSBuZXcgVGlsZSh7IG51bWJlcjogZ2V0UmFuZG9tSW50KDEsIDMpLCBpdGVtSW5kZXg6IGNvdW50ZXIgfSk7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aWxlcztcclxuICAgICAgICB9KSgpO1xyXG4gICAgICAgIHRoaXMuYm9hcmQgPSB0aWxlcztcclxuICAgIFxyXG4gICAgICAgIGxldCBib2FyZEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvYXJkXCIpO1xyXG4gICAgICAgIGxldCBjb250ZXh0ID0gYm9hcmRFbGVtZW50LmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdHggPSBjb250ZXh0O1xyXG4gICAgICAgIHRoaXMuYm9hcmRFbGVtZW50ID0gYm9hcmRFbGVtZW50O1xyXG5cclxuICAgICAgICBsZXQgcmVzaXplID0gKGV2KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBbd3csIHdoXSA9IFskKHdpbmRvdykud2lkdGgoKSwgJCh3aW5kb3cpLmhlaWdodCgpXTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2cod3csIHdoKTtcclxuICAgICAgICAgICAgJChcIiNib2FyZFwiKS5oZWlnaHQoYCR7d2gtMjAwfXB4YCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKVxyXG5cclxuICAgICAgICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgcmVzaXplKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZ2V0TW91c2VDb29yZGluYXRlcyA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQgPSBldiB8fCB3aW5kb3cuZXZlbnQ7IC8vIElFLWlzbVxyXG4gICAgICAgICAgICAvLyBJZiBwYWdlWC9ZIGFyZW4ndCBhdmFpbGFibGUgYW5kIGNsaWVudFgvWSBhcmUsXHJcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBwYWdlWC9ZIC0gbG9naWMgdGFrZW4gZnJvbSBqUXVlcnkuXHJcbiAgICAgICAgICAgIC8vIChUaGlzIGlzIHRvIHN1cHBvcnQgb2xkIElFKVxyXG4gICAgICAgICAgICBpZiAoZXZlbnQucGFnZVggPT0gbnVsbCAmJiBldmVudC5jbGllbnRYICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBldmVudERvYyA9IChldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0Lm93bmVyRG9jdW1lbnQpIHx8IGRvY3VtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGRvYyA9IGV2ZW50RG9jLmRvY3VtZW50RWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICBib2R5ID0gZXZlbnREb2MuYm9keTtcclxuXHJcbiAgICAgICAgICAgICAgICBldmVudC5wYWdlWCA9IGV2ZW50LmNsaWVudFggK1xyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5zY3JvbGxMZWZ0IHx8IGJvZHkgJiYgYm9keS5zY3JvbGxMZWZ0IHx8IDApIC1cclxuICAgICAgICAgICAgICAgICAgKGRvYyAmJiBkb2MuY2xpZW50TGVmdCB8fCBib2R5ICYmIGJvZHkuY2xpZW50TGVmdCB8fCAwKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnBhZ2VZID0gZXZlbnQuY2xpZW50WSArXHJcbiAgICAgICAgICAgICAgICAgIChkb2MgJiYgZG9jLnNjcm9sbFRvcCAgfHwgYm9keSAmJiBib2R5LnNjcm9sbFRvcCAgfHwgMCkgLVxyXG4gICAgICAgICAgICAgICAgICAoZG9jICYmIGRvYy5jbGllbnRUb3AgIHx8IGJvZHkgJiYgYm9keS5jbGllbnRUb3AgIHx8IDAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1vdXNlUG9zID0ge1xyXG4gICAgICAgICAgICAgICAgeDogZXZlbnQucGFnZVgsXHJcbiAgICAgICAgICAgICAgICB5OiBldmVudC5wYWdlWVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJtb3VzZSBtb3ZlZFwiLCBtb3VzZVBvcy54LCBtb3VzZVBvcy55KTtcclxuICAgICAgICAgICAgcmV0dXJuIG1vdXNlUG9zO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG1vdXNlVHJhY2tlciA9IChldikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcG9zID0gZ2V0TW91c2VDb29yZGluYXRlcyhldiksXHJcbiAgICAgICAgICAgICAgICBkaW1zID0gdGhpcy5nZXREaW1zKCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHBvcyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgdGlsZXNIb3ZlcmVkID0gdGhpcy5ib2FyZC5maWx0ZXIoKHRpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBwb3MgaXMgaW4gcGl4ZWwgY29vcmRzIHJlbGF0aXZlIHRvIHRoZSBib2FyZCBkaXZcclxuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlbSB0byBvdXIgaW50ZXJuYWwgcmVwcmVzZW50YXRpb25cclxuICAgICAgICAgICAgICAgIGxldCBbc2NvbCwgc3Jvd10gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChCT0FSRF9USUxFU19DT1VOVCAvIEJPQVJEX1dJRFRIKSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KEJPQVJEX1RJTEVTX0NPVU5UIC8gQk9BUkRfSEVJR0hUKVxyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgW3N3LCBzaF0gPSBkaW1zO1xyXG4gICAgICAgICAgICAgICAgbGV0IFt0dywgdGhdID0gW3N3IC8gc2NvbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaCAvIHNyb3ddO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IGJhY2sgdG8gcGl4ZWxzXHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IHR3ICogdGlsZS5wb3MueCxcclxuICAgICAgICAgICAgICAgICAgICB5ID0gdGggKiB0aWxlLnBvcy55O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAocG9zLnggPj0geCAmJiBwb3MueCt4IDw9IHN3ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zLnkgPj0geSAmJiBwb3MueSt5IDw9IHNoKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGlsZXNIb3ZlcmVkLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBjdHggPSB0aGlzLmN0eDtcclxuICAgICAgICAgICAgICAgIHRpbGVzSG92ZXJlZC5mb3JFYWNoKCh0aWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5kcmF3SG92ZXIoY3R4KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgJChcIiNib2FyZFwiKS5vbihcIm1vdXNlbW92ZVwiLCBtb3VzZVRyYWNrZXIpO1xyXG5cclxuICAgICAgICByZXNpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5KCkge1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXREaW1zKCkge1xyXG4gICAgICAgIHJldHVybiBbcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQud2lkdGgsIDEwKSwgcGFyc2VJbnQodGhpcy5ib2FyZEVsZW1lbnQuaGVpZ2h0LCAxMCldO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiR2FtZTo6ZHJhd1wiKTtcclxuXHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuY3R4O1xyXG4gICAgICAgIGxldCBbdywgaF0gPSB0aGlzLmdldERpbXMoKTtcclxuICAgICAgICBcclxuICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHcsIGgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGRyYXcgaW5kaXZpZHVhbCB0aWxlc1xyXG4gICAgICAgIHRoaXMuYm9hcmQuZm9yRWFjaCgodGlsZSkgPT4ge1xyXG4gICAgICAgICAgIGNvbnNvbGUubG9nKFwiZHJhd2luZyB0aWxlXCIsIHRpbGUuaXRlbUluZGV4LCB0aWxlLm51bWJlcik7XHJcbiAgICAgICAgICAgdGlsZS5kcmF3KGN0eCwgdywgaCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxufVxyXG4iLCIvKlxyXG4gKiAgVXRpbGl0eSBmdW5jdGlvbnNcclxuICovXHJcbiBcclxubGV0IGdldFJhbmRvbUludCA9IChtaW4sIG1heCA9IGZhbHNlKSA9PiB7XHJcbiAgICBpZiAobWF4ID09PSBmYWxzZSkge1xyXG4gICAgICAgIG1heCA9IG1pbjtcclxuICAgICAgICBtaW4gPSAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhcnNlSW50KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW4sIDEwKTtcclxufTtcclxuXHJcbmV4cG9ydCB7IGdldFJhbmRvbUludCB9O1xyXG4iXX0=
