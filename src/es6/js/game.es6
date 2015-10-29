/*
    The game code and logic, with UI handling.
    TODO(dkg): use the following techniques
        - generators and yield
        - Symbols
*/

import { getRandomInt, isDarkColor } from './utils.es6';

// these are not in pixel, but rather our internal representation of units
// this means N = N number of items, e.g. 10 = 10 items, not 10 pixels
// the draw() call will convert those into proper pixels
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 10;
const BOARD_TILES_COUNT = BOARD_WIDTH * BOARD_HEIGHT;

const COLORS = (() => {
    // TODO(dkg): eliminate colors that are too close to each other and/or duplicates
    let inner = () => {
        let rgb = [];
        for (var i = 0; i < 3; i++) {
            let v = (parseInt(Math.floor(Math.random() * 255), 10)).toString(16);
            if (v.length <= 1) {
                v = `0${v}`;
            }
            rgb.push(v);
        }
        // return 'rgb('+ rgb.join(',') +')';
        return '#' + rgb.join("");
    }
    let ret = [];
    for (let x = 0; x < 1000; x++) {
        ret.push(inner());
    }
    return ret;
})();

let _rndColor = 0;
let getColor = (idx = -1) => {
    if (_rndColor >= COLORS.length)
        _rndColor = 0;
    if (idx > -1 && idx < COLORS.length)
        return COLORS[idx];
    return COLORS[_rndColor++];
};

const MAGIC_COLORS = (() => {
    let ret = [];
    for (let x = 0; x < 50; x++) {
        ret.push(getColor(x));
    }
    return ret;
})();
const MAGIC_COLORS_REVERSE = (() => {
    return [...MAGIC_COLORS].reverse();
})();

const MOVE_STEPS_IN_FRAMES = 30;  // or in 0.5 seconds, assuming 60 frames/sec

// console.log(MAGIC_COLORS);

class Tile {

    constructor({ number = 0, c = 0, r = 0 } = {}) {
        this.number = number || getRandomInt(1, 3);
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

    // called once per frame - only once per frame!
    draw(ctx, sw, sh) {
        // TODO(dkg): randomize color according to this.number
        // TODO(dkg): implement tile destruction and adding new tiles from above
        //            Would be cool if the tile would explode in huge explosion
        //            but only if the number is 9 and it would become a 10.
        if (this.destroy === true) {
            return;
        }

        let [w, h] = this.tileDimensions(sw, sh);
        // these are the original pixel coords - they need to be adjusted
        // when we have to collapse
        let [l, t] = this.canvasCoordinates(sw, sh);
        
        if (this.moveTo !== false) {
            // TODO(dkg): Check if we are already in the correct spot and
            //            if we are, just mark us as destroyed.

            //    stepsMoved is important, as we want to keep track how far
            //    we are into the animation cycle for this move, even when the 
            //    user changes the size of the window and therefore the canvas dimensions
            let step = ++this.stepsMoved;

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

            let [dr, dc] = [this.r - this.moveTo.r, this.c - this.moveTo.c];
            let [tl, tt] = this.moveTo.canvasCoordinates(sw, sh); // hmm, this seems inefficient if we 
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
            let fraction = (step / MOVE_STEPS_IN_FRAMES);

            // this code is not working
            let [fl, ft] = [ fraction * dc, fraction * dr ]; 

            [l, t] = [ tl - fl * l, tt - ft * t ];
            // this code is working
            if (step >= MOVE_STEPS_IN_FRAMES) {
                this.destroy = true;
                this.stepsMoved = 0;
                this.moveTo = false;
            }
        } 

        let fillColor = MAGIC_COLORS[this.number-1];
        let antiColor = isDarkColor(fillColor) ? "lightgray" : "black";

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
        let [x, y] = [
            l + Math.ceil(w / 2.0), 
            t + Math.ceil(h / 2.0)
        ];

        // ctx.fillStyle = MAGIC_COLORS_REVERSE[this.number];
        ctx.fillStyle = antiColor;
        ctx.font = "32px courier";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.number, x, y);
    }

    animateCollapseTo(targetTile) {
        this.moveTo = targetTile;
        this.stepsMoved = 0;
    }

    canvasCoordinates(sw, sh) {
        // return the current tile position in pixel
        let [tw, th] = this.tileDimensions(sw, sh);
        
        // calc the top and left coordinates in pixel (top-left is 0, 0 in our coordinate system
        // and bottom-right is our screen_height-screen_width)
        // this depends on the tiles position (in col/row coords)
        // In case we are moving/collapsing onto another tile, we will need
        // to move once per frame into a certain direction.
        
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

        this.drawing = false;

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

        let mouseClick = (ev) => {
            ev.preventDefault();

            // if (this.drawing !== true) {
                // console.log("Ignored mouse click because I was drawing.");
                // return;
            // }

            let mousePos = getMouseCoordinates(ev),
                dims = this.getDims();
            // console.log("clicked here", mousePos);

            let clickedOnTiles = this.board.filter((tile) => {
                return tile.tracked; // we are cheating here
            });

            this.handleTileClicked(clickedOnTiles.length > 0 ? clickedOnTiles[0] : null);

        }.bind(this);

        $("#board").on("click", mouseClick);

        resize();
    }

    handleTileClicked(clickedOnTile) {
        // console.log("handleTileClicked", clickedOnTile);
        if (null === clickedOnTile)
            return;

        // TODO(dkg): check if tile has neighbours with the same number
        // if yes, increase current tile's number and collapse all connected
        // neighbours with the same number onto the tile (animate this as well).
        // Then let gravity drop down all tiles that are hanging in the air.
        // After that add fresh tiles to the board until all empty spaces are
        // filled up again - let these drop from the top as well.

        let connectedTiles = this.gatherConnectedTiles(clickedOnTile);
        // TODO(dkg): for debugging purposes display a overlay or 
        //            different border color for all connected tiles
        //            as a whole, not for each individual one
        connectedTiles.forEach((tile) => {
            // animate to collapse onto clicked tile
            // remove tiles after animation
            // count and add points
            // check if game over
            tile.animateCollapseTo(clickedOnTile);
        });
    }

    play() {
        this.draw();
        // TODO(dkg): remove destroyed tiles and add new tiles from above the board
        //            with gravity pulling them down etc.
        //            only let the player continue to play after all animations are done
        window.requestAnimationFrame(this.play.bind(this));
    }

    getDims() {
        return [parseInt(this.boardElement.clientWidth, 10), parseInt(this.boardElement.clientHeight, 10)];
    }

    draw() {
        console.log("Game::draw");
        this.drawing = true;

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
        
        // draw individual tiles - only the tracked one should be drawn over
        // all other tiles last, because otherwise the border outline is
        // overdrawn by neighbouring tiles
        let delayedDisplay = [];
        this.board.forEach((tile) => {
            if (tile.tracked) {
                delayedDisplay.push(tile);
            } else {
                tile.draw(ctx, w, h);
            }
        });
        delayedDisplay.forEach((tile) => {
            tile.draw(ctx, w, h);
        });

        this.drawing = false;
    }

    // returns the neighbouring tiles that have the same number as the provided tile
    findNeighboursForTile(tile) {
        let neighbours = [];

        let left = tile.c > 0 ? this.getTileAt(tile.c - 1, tile.r) : null;
        let top = tile.r > 0 ? this.getTileAt(tile.c, tile.r - 1) : null;
        let right = tile.c < BOARD_WIDTH-1 ? this.getTileAt(tile.c + 1, tile.r) : null;
        let bottom = tile.r < BOARD_HEIGHT-1 ? this.getTileAt(tile.c, tile.r + 1) : null;

        if (null != left && left.number === tile.number) neighbours.push(left);
        if (null != top && top.number === tile.number) neighbours.push(top);
        if (null != right && right.number === tile.number) neighbours.push(right);
        if (null != bottom && bottom.number === tile.number) neighbours.push(bottom);

        return neighbours;
    }

    getTileAt(column, row) {
        let tile = this.board.find((t) => t.c === column && t.r === row);
        return !!tile ? tile : null;
    }

    // Returns a list of all tiles that share the same number as the one provided
    // and that are continously connected throughout each other.
    // Important: board borders are cut off points!
    gatherConnectedTiles(tile) {

        // A list of array indices that are connected to the tile
        // and furthermore to other tiles with the same value/number.
        let connected = []; 

        // Searches through all neighbours to find all connected tiles.
        let crawl = (rootTile, crawled, ignoreRoot) => {
            if (rootTile === null) {
                console.warn("rootTile not set");
                return null;
            }

            let num = rootTile.number;
            crawled.push(rootTile);

            let neighbours = this.findNeighboursForTile(rootTile),
                counted = neighbours.length;

            for (let i = 0; i < counted; i++) {
                let t = neighbours[i],
                    idxOf = crawled.indexOf(t);
                if (idxOf === -1) {
                    crawl(t, crawled);
                }
            }
        }.bind(this);

        crawl(tile, connected, true);
        // we don't want to have our initial tile in the result set
        return connected.filter((t) => !(t.r === tile.r && t.c === tile.c));
    }
    
} // class Game
