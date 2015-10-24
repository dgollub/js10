/*
    The game code and logic, with UI handling.
*/

import { getRandomInt } from './utils.es6';

// these are not in pixel, but rather our internal representation of units
// this means N = N number of items, e.g. 10 = 10 items, not 10 pixels
// the draw() call will convert those into proper pixels
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 10;
const BOARD_TILES_COUNT = BOARD_WIDTH * BOARD_HEIGHT;
const COLORS = (() => {
    let inner = () => {
        let rgb = [];
        for(var i = 0; i < 3; i++)
            rgb.push(Math.floor(Math.random() * 255));
        return 'rgb('+ rgb.join(',') +')';
    }
    let ret = [];
    for (let x = 0; x < 1000; x++) {
        ret.push(inner());
    }
    return ret;
})();

let _rndColor = 0;
let getRandomColor = () => {
    if (_rndColor >= COLORS.length)
        _rndColor = 0;
    return COLORS[_rndColor++];
};

class Tile {

    constructor({ number = 0, c = 0, r = 0 } = {}) {
        this.number = number || getRandomInt(1, 3);
        // in col/row coordinates, that is in our own internal units
        this.c = c;
        this.r = r;
        this.tracked = false;
    }

    draw(ctx, sw, sh) {
        // TODO(dkg): randomize color according to this.number

        let [w, h] = this.tileDimensions(sw, sh);
        let [l, t] = this.canvasCoordinates(sw, sh);

        ctx.lineWidth = 1;
        ctx.fillStyle = (this.c + this.r) % 2 != 0 ? "#FF4500" : "#FFA500";
        // ctx.fillStyle = COLORS[this.c + this.r];
        // ctx.fillStyle = getRandomColor();
        ctx.fillRect(l, t, w, h);
        
        if (this.tracked) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = (this.c + this.r) % 2 != 0 ? "magenta" : "yellow";
            ctx.strokeRect(l, t, w, h);
        }

        // this.tracked = false;
    }

    canvasCoordinates(sw, sh) {
        // return the current tile position in pixel
        let [tw, th] = this.tileDimensions(sw, sh);
        
        // calc the top and left coordinates in pixel (top-left is 0, 0 in our coordinate system
        // and bottom-right is our screen_height-screen_width)
        // this depends on the tiles position (in col/row coords)
        let [l, t] = [
            this.c * tw,
            this.r * th
        ];

        return [l, t];
    }
    
    tileDimensions(sw, sh) {
        // calc tile width and height in pixels for one tile
        // DEPENDING on the current screen or board dimension!
        // sw: screen or board width in pixel
        // sh: screen or board height in pixel
        
        let [tw, th] = [Math.ceil(sw / BOARD_WIDTH),
                        Math.ceil(sh / BOARD_HEIGHT)];
        return [tw, th];
    }
} // class Tile

export default class Game {

    constructor() {

        let tiles = (() => {
            let tiles = [];
            for (let counter = 0; counter < BOARD_TILES_COUNT; counter++) {
                // let [columns, rows] = [
                    // parseFloat(BOARD_TILES_COUNT / BOARD_WIDTH),
                    // parseFloat(BOARD_TILES_COUNT / BOARD_HEIGHT)
                // ];
                let [column, row] = [
                    parseInt(counter % BOARD_WIDTH, 10),              // position in column
                    parseInt(Math.floor(counter / BOARD_HEIGHT), 10), // position in row
                ];

                let tile = new Tile({ number: getRandomInt(1, 3), c: column, r: row });
                tiles.push(tile);
            }
            return tiles;
        })();
        this.board = tiles;
    
        let boardElement = document.getElementById("board");
        let context = boardElement.getContext("2d");

        this.ctx = context;
        this.boardElement = boardElement;

        let resize = (ev) => {
            let [ww, wh] = [$(window).width(), $(window).height()];
            let margin = 200;
            let $board = $("#board");
            $board.height(`${wh-margin}px`);
            this.ctx.canvas.height = wh-margin;
            this.ctx.canvas.width = $board.width(); // this should take margins and CSS into account
            // this.draw();
        }.bind(this);

        $(window).on("resize", resize);
        
        let getMouseCoordinates = (ev) => {
            let event = ev || window.event; // IE-ism
            // If pageX/Y aren't available and clientX/Y are,
            // calculate pageX/Y - logic taken from jQuery.
            // (This is to support old IE)
            if (event.pageX == null && event.clientX != null) {
                let eventDoc = (event.target && event.target.ownerDocument) || document,
                    doc = eventDoc.documentElement,
                    body = eventDoc.body;

                event.pageX = event.clientX +
                  (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                  (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY +
                  (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                  (doc && doc.clientTop  || body && body.clientTop  || 0 );
            }
            
            let parentOffset = $(event.target).parent().offset();

            let mousePos = {
                x: event.pageX - parentOffset.left,
                y: event.pageY - parentOffset.top
            };
            
            // console.log("mouse moved", mousePos.x, mousePos.y);
            return mousePos;
        };
        
        let mouseTracker = (ev) => {
            let mousePos = getMouseCoordinates(ev),
                dims = this.getDims();

            this.board.forEach((tile) => {
                tile.tracked = false;

                // the mousePos is in pixel coords
                let [sw, sh] = dims;
                let [tw, th] = tile.tileDimensions(sw, sh);
                let [tl, tt] = tile.canvasCoordinates(sw, sh);

                if (mousePos.x >= tl && mousePos.x <= (tl + tw) &&
                    mousePos.y >= tt && mousePos.y <= (tt + th)) {
                    tile.tracked = true;
                }
            });
            
        }.bind(this);

        $("#board").on("mousemove", mouseTracker);

        resize();
    }

    play() {
        this.draw();

        window.requestAnimationFrame(this.play.bind(this));
    }
    
    getDims() {
        return [parseInt(this.boardElement.clientWidth, 10), parseInt(this.boardElement.clientHeight, 10)];
    }
    
    draw() {
        console.log("Game::draw");

        let ctx = this.ctx;
        let [w, h] = this.getDims();
        
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
        this.board.forEach((tile) => {
           tile.draw(ctx, w, h);
        });
    }
    
}
