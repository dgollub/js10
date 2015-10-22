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

class Tile {

    constructor({ number = 0, itemIndex = 0 } = {}) {
        this.number = number || getRandomInt(1, 3);
        this.itemIndex = itemIndex || 0; // to be ignored after initial construction
        // in col/row coordinates, that is in our own internal units
        this.orgPos = {
            x: parseInt(this.itemIndex % BOARD_WIDTH, 10),              // position in column
            y: parseInt(Math.floor(this.itemIndex / BOARD_HEIGHT), 10), // position in row
        };
        this.pos = Object.assign({}, this.orgPos);
    }

    draw(ctx, sw, sh) {
        // TODO(dkg): randomize color according to this.number
        // calc tile width and height in pixels for one tile
        let [scol, srow] = [
            parseFloat(BOARD_TILES_COUNT / BOARD_WIDTH),
            parseFloat(BOARD_TILES_COUNT / BOARD_HEIGHT)
        ];

        let [tw, th] = [sw / scol,
                        sh / srow];

        // calc the top and left coordinates (top-left is 0, 0 in our coordinate system
        // and bottom-right is our screen_height-screen_width)
        // this depends on the tiles position (in col/row coords)
        let [l, t] = [
            this.pos.x * tw,
            this.pos.y * th
        ];

        let [w, h] = [tw, th];
        // produce a checker-board pattern
        // TODO(dkg): simplify this code - right now it is stupid
        ctx.fillStyle = this.pos.x % 2 != 0 ? 
                        (this.pos.y % 2 == 0 ? "#FF4500" : "#FFA500") : 
                        (this.pos.x % 2 != 0 ? 
                        (this.pos.y % 2 != 0 ? "#FF4500" : "#FFA500") : 
                        (this.pos.y % 2 != 0 ? "#FF4500" : "#FFA500"));
        ctx.fillRect(l, t, w, h);
    }

    drawHover(ctx) {
        console.log("hover", this);
    }
} // class Tile

export default class Game {

    constructor() {

        let tiles = (() => {
            let tiles = [];
            for (let counter = 0; counter < BOARD_TILES_COUNT; counter++) {
                let tile = new Tile({ number: getRandomInt(1, 3), itemIndex: counter });
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
            // console.log(ww, wh);
            $("#board").height(`${wh-200}px`);
            this.draw();
        }.bind(this)

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

            let mousePos = {
                x: event.pageX,
                y: event.pageY
            };
            
            // console.log("mouse moved", mousePos.x, mousePos.y);
            return mousePos;
        };
        
        let mouseTracker = (ev) => {
            let pos = getMouseCoordinates(ev),
                dims = this.getDims();
            // console.log(pos);
            
            let tilesHovered = this.board.filter((tile) => {
                // the pos is in pixel coords relative to the board div
                // convert them to our internal representation
                let [scol, srow] = [
                    parseFloat(BOARD_TILES_COUNT / BOARD_WIDTH),
                    parseFloat(BOARD_TILES_COUNT / BOARD_HEIGHT)
                ];

                let [sw, sh] = dims;
                let [tw, th] = [sw / scol,
                                sh / srow];
                                
                let tilePosX, tilePosY = [0, 0]; // TODO(dkg): implement this
                
                // convert back to pixels
                let x = tw * tile.pos.x,
                    y = th * tile.pos.y;
                
                if (pos.x >= x && pos.x+x <= sw &&
                    pos.y >= y && pos.y+y <= sh)
                    return true;

                return false;
            });
            
            if (tilesHovered.length > 0) {
                let ctx = this.ctx;
                tilesHovered.forEach((tile) => {
                    tile.drawHover(ctx);
                });
            }
            
        }.bind(this);

        $("#board").on("mousemove", mouseTracker);

        resize();
    }

    play() {
        this.draw();
    }
    
    getDims() {
        return [parseInt(this.boardElement.width, 10), parseInt(this.boardElement.height, 10)];
    }
    
    draw() {
        console.log("Game::draw");

        let ctx = this.ctx;
        let [w, h] = this.getDims();
        
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, w, h);
        
        // draw individual tiles
        this.board.forEach((tile) => {
           console.log("drawing tile", tile.itemIndex, tile.number);
           tile.draw(ctx, w, h);
        });
        
    }
    
}
