document.addEventListener('DOMContentLoaded', function() {

	// populate tiles from cache
	readFromStorage();

	// register click listener for ADD, REMOVE, SAVE, CLEAR, RESTORE, ADD TILE
	var buttons = document.querySelectorAll('.button');
	for (i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', process_buttonClick);
	}

	// book-marks list select listener
	document.querySelector('.select').addEventListener('change',
			process_listChange);

	// book-marks list loaded listener
	chrome.bookmarks.getTree(process_bookmark);
});

// write tiles list (JSON array) to storage
function writeToStorage(jsonArray) {
	var TilesInfoKey = 'TilesInfoKey';
	var jsonArrayStr = JSON.stringify(jsonArray);
	logMessage("Write_Storage: ", "tileInfoStr=" + jsonArrayStr);

	chrome.storage.local.set({
		TilesInfoKey : jsonArrayStr
	}, function() {
		logMessage("Write_Storage: ", "set key done");
	});
}

// read storage for tile list and add them to HTML page
function readFromStorage() {
	var TilesInfoKey = 'TilesInfoKey';

	chrome.storage.local.get([ TilesInfoKey ], function(jsonArrayStr) {
		if (!jsonArrayStr.TilesInfoKey) {
			logMessage("Read_Storage: ", "get key.TilesInfoKey=UNDEFINED");
		} else {
			var jsonArray = JSON.parse(jsonArrayStr.TilesInfoKey);
			logMessage("Read_Storage: ", "jsonArray.length="
					+ jsonArray.length);

			addMultipleTiles(jsonArray);
		}
	});
}

// add tiles to HTML page, for given JSON array (tile-info objects)
function addMultipleTiles(jsonArray) {
	logMessage("Add_MultipleTiles: ", "jsonArray=" + jsonArray.length);

	for (i = 0; i < jsonArray.length; i++) {
		var tileInfo = jsonArray[i];
		addOneTile(tileInfo.title, tileInfo.url);
	}
}

// add a tile to HTML page
function addOneTile(title, url) {
	logMessage("Add_OneTile: ", "tileInfo: " + title + "- " + url);

	if (title.length != 0 && url.length != 0) {
		var tiles_grid = document.getElementById("tiles_grid");
		var currButtons = tiles_grid.getElementsByClassName('tile_button');

		if (currButtons.length < 30) {
			var button = document.createElement("button");
			button.className = "tile_button";
			button.value = url;
			button.innerText = title;
			button.addEventListener('click', process_tileButtonClick);

			tiles_grid.appendChild(button);
		} else {
			logMessage("addOneTile: ", "ERROR - Tile limit of 30 reached");
		}
	}
}

// remove one tile from HTML page by matching title
function removeOneTile(title) {
	logMessage("Remove_OneTile: ", "title=" + title);
	if (title.length != 0) {
		var tiles_grid = document.getElementById("tiles_grid");
		var currButtons = tiles_grid.getElementsByClassName('tile_button');
		if (currButtons.length > 0) {
			for (i = 0; i < currButtons.length; i++) {
				var button = currButtons[i];
				if (button.innerText.toUpperCase() === title.toUpperCase()) {
					logMessage("removeOneTile: ", "FOUND @ " + i);
					tiles_grid.removeChild(button);
					break;
				}
			}
		} else {
			logMessage("removeOneTile: ", "ERROR - There are no tiles on page");
		}
	}
}

// handle tile-button press
function process_tileButtonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("process_buttonClick: ", "target=" + target + ", class="
			+ target.className);

	chrome.tabs.create({
		url : target.value,
		active : false
	});
}

// handle ADD, REMOVE, SAVE, CLEAR, RESTORE, ADD TILE
function process_buttonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("Button_Click: ", "target=" + target + ", class="
			+ target.className);

	if (target.className == "button add") {
		showPopup("add");
	} else if (target.className == "button remove") {
		showPopup("remove");
	} else if (target.className == "button save") {
		var jsonArray = createTilesJsonArray();
		writeToStorage(jsonArray);
	} else if (target.className == "button clear") {
		var tiles_grid = document.getElementById("tiles_grid");
		while (tiles_grid.hasChildNodes()) {
			tiles_grid.removeChild(tiles_grid.lastChild);
		}
	} else if (target.className == "button restore") {
		var tiles_grid = document.getElementById("tiles_grid");
		while (tiles_grid.hasChildNodes()) {
			tiles_grid.removeChild(tiles_grid.lastChild);
		}
		readInputFile();
	} else if (target.className == "button cancel") {
		hidePopup();
	} else if (target.className == "button addTile") {
		var inputTitle = document.getElementById("input_title").value;
		var inputUrl = document.getElementById("input_url").value;
		addOneTile(inputTitle, inputUrl);
		hidePopup();
	} else if (target.className == "button removeTile") {
		var inputTitle = document.getElementById("input_title").value;
		removeOneTile(inputTitle);
		hidePopup();
	}
}

// fetch list of tiles and build corresponding JSON array
function createTilesJsonArray()
{
	var jsonArray = [];
	var currButtons = document.getElementsByClassName("tile_button");

	for (i = 0; i < currButtons.length; i++) {
		jsonArray.push({
			"title" : currButtons[i].innerText,
			"url" : currButtons[i].value
		});
	}

	return jsonArray;
}

// show the user input pop-up
function showPopup(action)
{
	document.getElementById("input_title").value = "";
	document.getElementById("input_url").value = "";
	document.getElementById("input_title").style.visibility = 'visible';

	if (action == "add") {
		// reset text input fields
		document.getElementById("addTileButton").style.visibility = 'visible';
		document.getElementById("removeTileButton").style.visibility = 'hidden';
		document.getElementById("input_url").style.visibility = 'visible';
	} else if (action == "remove") {
		document.getElementById("addTileButton").style.visibility = 'hidden';
		document.getElementById("removeTileButton").style.visibility = 'visible';
		document.getElementById("input_url").style.visibility = 'hidden';
	}

	var gridInput = document.getElementById("grid_input");
	gridInput.style.visibility = 'visible';
}

// hide the user input pop-up
function hidePopup()
{
	document.getElementById("addTileButton").style.visibility = 'hidden';
	document.getElementById("removeTileButton").style.visibility = 'hidden';
	document.getElementById("input_title").style.visibility = 'hidden';
	document.getElementById("input_url").style.visibility = 'hidden';

	var gridInput = document.getElementById("grid_input");
	gridInput.style.visibility = 'hidden';
}

// handle loading of book-marks
function process_bookmark(bookmarks) {
	logMessage("BookMark_Loaded: ", "bookmarks:" + bookmarks.length)
	var select = document.querySelector('.select');

	for (var i = 0; i < bookmarks.length; i++) {
		var bookmark = bookmarks[i];
		if (bookmark.url) {
			var option = document.createElement("option");
			option.text = bookmark.title;
			option.value = bookmark.url;
			select.add(option);
		}

		if (bookmark.children) {
			process_bookmark(bookmark.children);
		}
	}
}

// handle selection of book-mark from drop down list
function process_listChange() {
	var urlValue = document.querySelector('.select').value;
	logMessage("BookMark_Selected: ", "URL:" + urlValue)
	chrome.tabs.create({
		url : urlValue,
		active : false
	});
}

// read JSON file for tile list and add them to HTML page
function readInputFile() {
	var fileReadRequest = new XMLHttpRequest();
	fileReadRequest.open("GET", 'url.json', true);
	fileReadRequest.onreadystatechange = function() {
		if (fileReadRequest.readyState === 4) {
			var fileContents = fileReadRequest.responseText;
			var jsonArray = JSON.parse(fileContents);
			logMessage("Read_File: ", "jsonArray=" + jsonArray.length);

			addMultipleTiles(jsonArray);
		}
	}

	fileReadRequest.send();
}

// simple logger
function logMessage(prefix, postfix) {
	var date = new Date();
	var timeStamp = "";
	timeStamp += prefix;
	timeStamp += ": ";
	timeStamp += date.getHours();
	timeStamp += ":";
	timeStamp += date.getMinutes();
	timeStamp += ":";
	timeStamp += date.getSeconds();
	timeStamp += " --> ";
	timeStamp += postfix;
	timeStamp += "\n";

	var console = document.getElementById("console")
	console.value += timeStamp;
	console.focus();
}
