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


function Tile(index, number, element) {
	this.idx = index;
	this.number = number;
	this.element = element || null;
	this.collapsed = false;
	this.originalPosition = {
		top: -1,
		left: -1
	};
}
Tile.prototype.isEmpty = function() {
	return this.number === null || this.number === 0;
}
Tile.prototype.draw = function(tileSize) {
	var ts = tileSize;
	function createDiv(num, idx, position, isEmpty) {
		var tw = ts.width + "px", 
			th = ts.height + "px",
			row = Math.floor(idx / WIDTH),
			column = idx % WIDTH,
			br = (idx + 1) % WIDTH == 0, // check if row ended
			color = isEmpty ? "" : ""+tileColors[num-1],
			bgColor = isEmpty ? "" : ";background-color:#" + color,
			textColor = isEmpty ? "" : isDarkColor(color) ? ";color:white" : ";color:black",
			text = isEmpty ? "" : ''+num,
			padding = 0,
			left = (padding + ts.width) * column,
			top = ts.height * row;

		if (position.top === -1) {
			position.top = top;
			position.left = left;
		} else {
			left = position.left;
			top = position.top;
		}
		var leftpx = left + "px",
			toppx = top + "px";

		// TODO(dkg): maybe encode the properties like color and position in data attributes as well?
		var div = '<div class="tile" id="tile-'+idx+'" data-idx="'+idx+'" data-number="'+text+'" style="width:'+tw+';height:'+th+bgColor+textColor+';left:'+leftpx+';top:'+toppx+';"><span>'+text+'</span></div>' +
				(br ? '<br style="clear:both" />' : "");
		return div;
	}
	return createDiv(this.number, this.idx, this.originalPosition, this.isEmpty());
}
Tile.prototype.reset = function() {
	this.collapsed = false;
	this.number = null;
	this.element.attributes["style"] = "";
};

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
	var length = list.length;
	for (var i = 0; i < length; i++) {
		cb(list[i], i);
	}
	return list;
}

function map(list, cb) {
	var newList = [],
		length = list.length;
	for (var i = 0; i < length; i++) {
		newList.push(cb(list[i], i));
	}
	return newList;
}

function filter(list, pre, trans) {
	var newList = [],
		length = list.length;
	for (var i = 0; i < length; i++) {
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

function find(list, pre) {
	var item = null,
		length = list.length;
	for (var i = 0; i < length; i++) {
		if (pre(list[i], i)) {
			item = list[i];
			break;
		}
	}
	return item;
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
	var idx = parseInt(element.getAttribute("data-idx"), 10) || -1;
	if (idx === -1) {
		console.error("No such tile for element. Or element is not a tile.", element);
		return null;
	}
	return find(board, function(tile) { return tile.idx === idx; });
}

function getTileFromBoard(idx) {
	if (idx >= board.length) return null;
	if (idx < 0) return null;
	return find(board, function(tile) { return tile.idx == idx; });
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

	console.log("clicked on tile ", tile);

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

	// change number
	if (tile.num == 10) { // TOOD(dkg): not sure what to do in this case - restart from 1? Or keep counting up?
		return;
	}

	var connectedTiles = gatherConnectedTiles(tile),
		count = connectedTiles.length;
	each(connectedTiles, function(connected, idx){
		animateTile(connected, "background-color:lime", 150, function() {
			animateTile(connected, "background-color:#"+tileColors[connected.num-1], 150, function(){
				if (--count == 0) { // this should be correct even with out of order execution
					// Collapse tiles into one and advance the number.
					collapseTiles(tile, connectedTiles);
				}
			})
		});
	});
}

// Collapse tiles into one and advance the number.
// Collapse into the tile that was clicked on, however, do apply "gravity", ie
// fall down if there are connected tiles below and collapse further down until
// either the border is reached or no more connected tiles are below.
function collapseTiles(clickedOnTile, connectedTiles) {
	console.log("collapseTiles", clickedOnTile);
	// NOTE(dkg): Two possible animation ideas for this.
	// 1. Follow the tiles tail and collapse one into another until
	//    all connected tiles reach the clicked-on-tile.
	//    Exception: tiles below the clicked-on-tile, leave those in 
	//    place and move the clicked-on one further down instead.
	// 2. Fly each connected tile directly over the screen onto the 
	//    clicked on tile, while it falls down into place. This is the 
	//    actual game behavior of the original game.
	//
	// I think I will go with #2 for now. But first, I'll implement the general
	// logic so things just work and then I'll animate this.
	//

	//  1. Determine the connected tiles below this tile so we can fall it down.
	//  2. Fall down. 
	//  Actually, in the original game, this happens last.

	//  3. Let all other tiles pile onto the most bottom tile.
	//  4. Increase number on final tile.
	//  5. Let all other tiles fall down that now may hang in the air.
	//  6. Fill the void from above with random numbered tiles (1 - current max. 
	//     number of any given tile).
	//  7. Award points.
	//  8. Update high score.
	//  9. Figure out if more moves are possible. If not, game over.
	// 10. Enjoy life.

	var clickedElement = clickedOnTile.element;
	each(connectedTiles, function(tile) {
		var element = tile.element;
		if (clickedElement.id == element.id)
			return;
		var opts = {
			// TODO(dkg): fix this
			// offsetTop and offsetLeft are rounded to the nearest int, which gives us
			// some off-by-1/2-pixel look in same cases
			"top": clickedElement.offsetTop+"px",
			"left": clickedElement.offsetLeft+"px",
			"position": "absolute"
		};
		// right now no real animations happen
		// if we want to change this, we need to make it work async
		// with setTimeout or something, in which case we need to
		// have a callback run after the last element was animated
		animate(element, opts);
		// remove tile from the board - mark tile as "removable" so it will be removed from our storage
		tile.collapsed = true;
	});

	// increase value of clicked element
	clickedOnTile.number++;
	clickedElement.attributes["data-number"] = clickedOnTile.number;
	clickedElement.children[0].innerHTML = clickedOnTile.number;

	draw(collapseTilesPart2);
}
function collapseTilesPart2() {
	// reset all collapsed tiles to their original position and remove all styling
	// so that they can be reused again

	each(board, function(tile) {
		if (tile.collapsed) {
			tile.reset();
		}
	});

	// draw();

	// apply gravity now
	applyGravity();
	
	// drop new tiles and let the player click again
	
}

function applyGravity() {

	function applyGravityOneStep() {
		// find the elements that are hanging in the air and have them drop down
		var airedPairs = filter(map(board, function(tile) {
			if (tile.isEmpty()) return false;
			var bottom = getTileFromBoard(tile.idx + WIDTH);
			if (!bottom) return false;
			if (!bottom.isEmpty()) return false;
			return [tile, bottom];
		}), function(tile) { return tile !== false; });

		// drop down one field - we are using side-effects here, because 
		// it is easy
		each(airedPairs, function(tuple) {
			var tile = tuple[0],
				bottomTile = tuple[1],
				element = tile.element,
				bottomElement = bottomTile.element,
				opts = {
					"top": bottomElement.offsetTop+"px",
					"left": bottomElement.offsetLeft+"px"
				};
			// right now no real animations happen
			// if we want to change this, we need to make it work async
			// with setTimeout or something, in which case we need to
			// have a callback run after the last element was animated
			animate(element, opts);
			
			// the bottom tile should now become the tile, and the tile
			// should become an empty one
			bottomTile.number = tile.number;
			tile.number = null;
		});
		
		return airedPairs.length > 0;
	}
	
	while (applyGravityOneStep()) {
		// draw(); // add small pause after each draw call
	}
	
	draw();
}

function animate(element, options) {
	// console.log("animate", element, options);
	for (var key in options) {
		var val = options[key];
		element.style[key] = val;
	}
	element.attributes["style"] = "display:none;";
}

// Returns an array with indices of the neighbours for the given index if they
// share the same number value.
function getNeighbours(tile) {
	// Remember: tiles across rows are not connected at the beginning/end of rows,
	// ie row 2, colum 0 is not connected to row 1, column WIDTH-1, even when they
	// share the same number.
	var neigh = [],
		top = getTileFromBoard(tile.idx - WIDTH),
		bottom = getTileFromBoard(tile.idx + WIDTH),
		left = getTileFromBoard(tile.idx - 1),
		right = getTileFromBoard(tile.idx + 1),
		noLeft = tile.idx % WIDTH === 0, // left side check; only need to check for top, bottom and right neighbour
		noRight = (tile.idx+1) % WIDTH === 0; // right side check; only need to check for top, bottom and left neighbour

	if (!noLeft && left !== null && left.number === tile.number)
		neigh.push(left.idx);
	if (!noRight && right !== null && right.number === tile.number)
		neigh.push(right.idx);
	if (top !== null && top.number === tile.number)
		neigh.push(top.idx);
	if (bottom !== null && bottom.number === tile.number)
		neigh.push(bottom.idx);

	return neigh;
}

function checkForNeighbours(tile) {
	var neighbours = getNeighbours(tile);
	return neighbours.length > 0;
}

function gatherConnectedTiles(tile) {

	// A list of array indices that are connected to the tile
	// and furthermore to other tiles with the same value/number.
	var connected = [];	

	// Searches through all neighbours to find all connected tiles.
	function crawl(rootTile, crawled) {
		if (rootTile === null) {
			console.warn("rootTile not set");
			return null;
		} 
		var root = rootTile.idx, 
			num = rootTile.number;
		crawled.push(root);

		var foundNeighbours = getNeighbours(rootTile),
			counted = foundNeighbours.length;
		
		for (var i = 0; i<counted; i++) {
			var tileIdx = foundNeighbours[i];
			if (crawled.indexOf(tileIdx) === -1) {
				var tile = find(board, function(t) { return tileIdx === t.idx; });
				crawl(tile, crawled);
			}
		}
	}

	crawl(tile, connected);

	return map(connected, function(tileIdx) { return getTileFromBoard(tileIdx) });
}

function draw(cb) {
	console.log("draw");
	// create the DIV elements if they don't exist yet
	var ts = getTileSize();

	function drawTile(tile) {
		// if (tile.collapsed)
			// return "";
		return tile.draw(ts);
	}
	
	var elements = map(board, drawTile);

	domBoard.innerHTML = elements.join("\n");

	each(doc.querySelectorAll(".tile"), function(tileElement) {
		addEvent(tileElement, "click", handleTileClick);
	});
	each(board, function(tile) {
		// if (tile.element === null) {
			tile.element = doc.getElementById("tile-" + tile.idx);
		// }
	});

	var totalHeight = HEIGHT * ts.height;
	domBoard.setAttribute("style", "height:"+(totalHeight+10)+"px");

	if (typeof cb == "function") {
		setTimeout(cb, 0);
	}
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
	board = createList(NUMBER_OF_TILES, function(idx) { 
		return new Tile(idx, randomInteger(3), null); 
	});
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
