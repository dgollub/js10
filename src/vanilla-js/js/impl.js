/*
	10 - A game of numbers.	
*/

(function(win, doc, undefined){

"use strict";
var colors = new Array();
colors.push({'Forest Green': '337722'});
colors.push({'Deep Green': '224433'});
colors.push({'Sage Green': '77AA99'});
colors.push({'Ink Blue': '003344'});
colors.push({'Gray Blue': '557799'});
colors.push({'Violet Blue': '002266'});
colors.push({'Periwinkle Blue': '6688BB'});
colors.push({'Dusty Lavender': '887799'});
colors.push({'Red Violet': '551155'});
colors.push({'Brick Red': '992222'});
colors.push({'Oxblood Red': '660000'});
colors.push({'Camel': 'CCBB88'});
colors.push({'Peridot Yellow': 'DDCC66'});
colors.push({'Taupe': '999977'});
colors.push({'Olive Green': '445511'});
colors.push({'Light Gray': '778888'});
colors.push({'Dark Gray': '666666'});
colors.push({'Violet': '993399'});
colors.push({'Cranberry Red': 'AA1133'});
colors.push({'Azalea Pink': 'FF3366'});
colors.push({'Warm Red': 'FF0000'});
colors.push({'Dark Orange': 'DD4411'});
colors.push({'Yellow Orange': 'FF9900'});
colors.push({'Pumpk in Orange': 'EEAA55'});
colors.push({'Chrome Yellow': 'EEAA00'});
colors.push({'Cream': 'FFDD99'});
colors.push({'Bright Yellow': 'FFDD00'});
colors.push({'Lime Green': 'BBBB00'});
colors.push({'Bright Green': '88DD00'});
colors.push({'Grass Green': '66AA44'});
colors.push({'Aquamarine': '00AA99'});
colors.push({'Sea Green': '008899'});
colors.push({'Pool Blue': '00BBEE'});
colors.push({'Ice Blue': 'AADDEE'});
// colors.push({'Black': '000000'});
// colors.push({'White': 'FFFFFF'});
colors.push({'Saffron Yellow': 'FFB500'});
colors.push({'Warm Red': 'FF0000'});
colors.push({'Kelly Green': '00A000'});
colors.push({'Pool Blue': '00BBEF'});

var body = doc.getElementById("body"),
	domBoard = doc.getElementById("board"),
	board = [],
	tileColors = [],
	WIDTH = 10,   // arbritrary scale, not pixels
	HEIGHT = 10,  // arbritrary scale, not pixels
	NUMBER_OF_TILES = WIDTH * HEIGHT;


// utils

function addEvent(element, event, cb) {
	if (element.addEventListener) {
		element.addEventListener(event, cb, false);
	} else if (element.attachEvent) {
		element.attachEvent("on" + event, cb);
	} else {
		throw new Exception("can not add event to element");
	}
}

// http://stackoverflow.com/a/12043228/193165
function isDarkColor(color) {
	var c = color.length === 6 ? color : color.substring(1); // strip #
	var rgb = parseInt(c, 16);   // convert rrggbb to decimal
	var r = (rgb >> 16) & 0xff;  // extract red
	var g = (rgb >>  8) & 0xff;  // extract green
	var b = (rgb >>  0) & 0xff;  // extract blue

	// use a standard formula to convert the resulting RGB values into their perceived brightness
	// https://en.wikipedia.org/wiki/Rec._709#Luma_coefficients
	var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

	// console.log("luma for color:", color, luma);

	return luma < 80; // too dark if luma is smaller than N
}

function randomInteger(max) {
	return parseInt((Math.random() * max) + 1, 10);
}

function each(list, cb) {
	for (var i = 0; i < list.length; i++) {
		cb(list[i], i);
	}
	return list;
}

function map(list, cb) {
	var newList = []
	for (var i = 0; i < list.length; i++) {
		newList.push(cb(list[i], i));
	}
	return newList;
}

function filter(list, pre, trans) {
	var newList = []
	for (var i = 0; i < list.length; i++) {
		if (pre(list[i], i)) {
			if (typeof trans === "function") {
				newList.push(trans(list[i], i));
			} else {
				newList.push(list[i]);
			}
		}
	}
	return newList;
}

function createList(length, cb) {
	var list = [];
	for (var i = 0; i < length; i++) {
		list.push(cb(i));
	}
	return list;
}

function getWindowWidth() {
	var width = win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth;
	return width;
}

function getWindowHeight() {
	var height = win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight;
	return height;
}

function getBoardSize() {
	var ww = getWindowWidth(),
		wh = getWindowHeight();

	var bw = ww * 0.75,
		bh = wh * 0.75;

	return {
		width: bw,
		height: bh
	};
}
function getTileSize() {
	var bs = getBoardSize();

	return {
		width: bs.width / WIDTH,
		height: bs.height / HEIGHT
	};
}

// game play

function getTileFromEvent(ev) {
	return ev.target.tagName == "SPAN" ? getTileFromElement(ev.target.parentNode) 
									   : getTileFromElement(ev.target)
}

function getTileFromElement(element) {
	return {
		idx: parseInt(element.getAttribute("data-idx"), 10),
		num: parseInt(element.getAttribute("data-number"), 10),
		element: element
	};
}

function getTileFromBoard(idx) {
	if (idx >= board.length) return null;
	if (idx < 0) return null;
	// return board[idx];
	return getTileFromElement(doc.getElementById("tile-"+idx));
}

function replaceStylesPart(style, part, newStyle) {
	var styles = style.split(";");

	styles = map(styles, function(style) {
		// if (style.indexOf("background-color") > -1)
		// 	return "background-color:lime";
		if (style.indexOf(part) > -1) 
			return newStyle;
		return style;
	});

	var result = styles.join(";");
	if (result.indexOf("part") == -1) {
		result += ";" + newStyle;
	}

	return result;
}

function replaceStyles(style, newStyles) {
	each(newStyles.split(";"), function(newStyle) {
		var sn = newStyle.split(":")[0];
		style = replaceStylesPart(style, sn, newStyle);
	})
	return style;
}

function animateTile(tile, newStyle, duration, cb) {
	// console.log("animateTile");

	var dur = parseFloat(duration, 10) || 400,
		style = replaceStyles(tile.element.getAttribute("style"), newStyle);

	setTimeout(function(){
		tile.element.setAttribute("style", style);
		if (typeof cb === "function") {
			setTimeout(function(){
				cb();
			}, dur);
		}
	}, 0);
}

function handleTileClick(ev) {
	ev.preventDefault();
	var tile = getTileFromEvent(ev);

	console.log("clicked on tile ", tile.idx, tile.num);

	// check if tile has neighbour(s) with same number
	// if no, bail
	// if yes, change tile plus all neighbours with same number to
	// next number
	// but not if number is already 10 --> in this case: boom, we got a winner and the game is over
	// or whatever else logic we want to end the game (maybe let them play forever until no more valid moves?)
	// and just add more bonus points?

	if (!checkForNeighbours(tile)) {
		animateTile(tile, "opacity:0.5", 500, function() {
			animateTile(tile, "opacity:1.0", 200)
		});
		return;
	}

	animateTile(tile, "background-color:lime", 500, function() {
		animateTile(tile, "background-color:#"+tileColors[tile.num-1], 200)
	});

	// change number
	if (tile.num == 10) { // TOOD(dkg): not sure what to do in this case - restart from 1? Or keep counting up?
		return;
	}

	var connectedTiles = gatherConnectedTiles(tile);
	each(connectedTiles, function(connected, idx){
		animateTile(connected, "background-color:lime", 500, function() {
			animateTile(connected, "background-color:#"+tileColors[connected.num-1], 200)
		});
	});

	// setTimeout(function(){
	// 	draw();	
	// }, 1500);

	// Collapse tiles into one and advance the number.
	collapseTiles(tile, connectedTiles);
}

// Collapse tiles into one and advance the number.
// Collapse into the tile that was clicked on, however, do apply "gravity", ie
// fall down if there are connected tiles below and collapse further down until
// either the border is reached or no more connected tiles are below.
function collapseTiles(tile, connectedTiles) {
	// NOTE(dkg): Two possible animation ideas for this.
	// 1. Follow the tiles tail and collapse one into another until
	//    all connected tiles reach the clicked-on-tile.
	//    Exception: tiles below the clicked-on-tile, leave those in 
	//    place and move the clicked-on one further down instead.
	// 2. Fly each connected tile directly over the screen onto the 
	//    clicked on tile, while it falls down into place.
	//
	// I think I will go with #2 for now. But first, I'll implement the general
	// logic so things just work and then I'll animate this.
	//

	//  1. Determine the connected tiles below this tile so we can fall it down.
	//  2. Fall down.
	//  3. Let all other tiles pile onto the most bottom tile.
	//  4. Increase number on final tile.
	//  5. Let all other tiles fall down that now may hang in the air.
	//  6. Fill the void from above with random numbered tiles (1 - current max. 
	//     number of any given tile).
	//  7. Award points.
	//  8. Update high score.
	//  9. Figure out if more moves are possible. If not, game over.
	// 10. Enjoy life.

	

}

// Returns an array with indices of the neighbours for the given index if they
// share the same number value.
function getNeighbours(idx, num) {
	// Remember: tiles across rows are not connected at the beginning/end of rows,
	// ie row 2, colum 0 is not connected to row 1, column WIDTH-1, even when they
	// share the same number.
	var neigh = [],
		top = getTileFromBoard(idx - WIDTH),
		bottom = getTileFromBoard(idx + WIDTH),
		left = getTileFromBoard(idx - 1),
		right = getTileFromBoard(idx + 1),
		noLeft = idx % WIDTH === 0, // left side check; only need to check for top, bottom and right neighbour
		noRight = (idx+1) % WIDTH === 0; // right side check; only need to check for top, bottom and left neighbour

	if (!noLeft && left !== null && left.num === num)
		neigh.push(left.idx);
	if (!noRight && right !== null && right.num === num)
		neigh.push(right.idx);
	if (top !== null && top.num === num)
		neigh.push(top.idx);
	if (bottom !== null && bottom.num === num) 
		neigh.push(bottom.idx);

	return neigh;
}

function checkForNeighbours(tile) {
	var neighbours = getNeighbours(tile.idx, tile.num);
	return neighbours.length > 0;
}

function gatherConnectedTiles(tile) {

	// A list of array indices that are connected to the tile
	// and furthermore to other tiles with the same value/number.
	var connected = [];	

	// Searches through all neighbours to find all connected tiles.
	function crawl(root, num, crawled) {
		
		crawled.push(root);

		var foundNeighbours = getNeighbours(root, num),
			counted = foundNeighbours.length;
		
		for (var i = 0; i<counted; i++) {
			var tileIdx = foundNeighbours[i];
			if (crawled.indexOf(tileIdx) === -1) {				
				crawl(tileIdx, num, crawled);
			}
		}
	}

	crawl(tile.idx, tile.num, connected);
	
	return map(connected, function(tileIdx) { return getTileFromBoard(tileIdx) });

}

function draw() {
	// create the DIV elements if they don't exist yet
	var ts = getTileSize();

	function createDiv(tile, idx) {
		var tw = ts.width + "px", 
			th = ts.height + "px",
			br = (idx+1) % WIDTH == 0,
			color = ""+tileColors[tile-1],
			bgColor =";background-color:#" + color,
			textColor = isDarkColor(color) ? ";color:white" : ";color:black" ;

			if (typeof color == "object")
				debugger;

		return  '<div class="tile" id="tile-'+idx+'" data-idx="'+idx+'" data-number="'+tile+'" style="width:'+tw+';height:'+th+bgColor+textColor+'"><span>'+tile+'</span></div>' +
				(br ? '<br style="clear:both" />' : "");
	}

	var elements = map(board, createDiv);

	domBoard.innerHTML = elements.join("\n");

	each(doc.querySelectorAll(".tile"), function(tile) {
		addEvent(tile, "click", handleTileClick);
	});
}

function clearBoard() {
	board = [];
	domBoard.innerHTML = "";
}

// Board layout:
// top left : 0, 0
// top right: WIDTH, 0
// bottom left: 0, HEIGHT
// bottom right: WIDTH, HEIGHT
function setupBoard() {
	tileColors = createList(Math.max(WIDTH, HEIGHT), function(idx) {
		return "";
	});

	// check if the color is already assigned to another number
	var colorFail = true;
	while (colorFail) {
		tileColors = map(tileColors, function(tc) {
			var color = colors[randomInteger(colors.length)],
				c = null;
			for (var key in color) {
				if (color.hasOwnProperty(key)) {
					c = color[key];
					break;
				}
			}
			return c === null ? colors[0]["Forest Green"] : c;
		});
		// check for duplicates now
		var seen = [];
		each(tileColors, function(tc) {
			if (seen.indexOf(tc) == -1) {
				seen.push(tc);	
			}
		});
		colorFail = seen.length != tileColors.length;
	}

	// TODO(dkg): the initial board should have more 1s and 2s than 3s!
	// TODO(dkg): make sure the board is playable!
	board = createList(NUMBER_OF_TILES, function(idx) { return randomInteger(3); });
}

function restart() {
	clearBoard();
	setupBoard();
	draw();
}

addEvent(window, "resize", function(ev) {
	draw();	
});

// let's run it
restart();

})(window, document);
