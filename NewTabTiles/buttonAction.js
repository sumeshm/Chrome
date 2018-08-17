document.addEventListener('DOMContentLoaded', function() {

	// populate tiles
	// readInputFile();
	readFromStorage();

	// add, remove,  and home_button click listener
	document.querySelector('.add').addEventListener('click', process_buttonClick);
	document.querySelector('.remove').addEventListener('click', process_buttonClick);
	var otherButtons = document.querySelectorAll('.other');
	for (i = 0; i < otherButtons.length; i++) {
		otherButtons[i].addEventListener('click', process_buttonClick);
	}

	// book-marks list select listener
	document.querySelector('.book_mark').addEventListener('change', process_listChange);

	// book-marks list loaded listener
	chrome.bookmarks.getTree(process_bookmark);
});

// write tiles list (JSON array) to storage
function writeToStorage(jsonArray) {
	var TilesInfoKey = 'TilesInfoKey';
	var jsonArrayStr = JSON.stringify(jsonArray);
	logMessage("writeToStorage: ", "tileInfoStr=" + jsonArrayStr);

	chrome.storage.local.set({
		TilesInfoKey : jsonArrayStr
	}, function() {
		logMessage("writeToStorage: ", "set key done");
	});
}

// read storage for tile list and add them to HTML page
function readFromStorage() {
	var TilesInfoKey = 'TilesInfoKey';

	chrome.storage.local.get([ TilesInfoKey ], function(jsonArrayStr) {
		if (!jsonArrayStr.TilesInfoKey) {
			logMessage("readFromStorage: ", "get key.TilesInfoKey=UNDEFINED");
		} else {
			var jsonArray = JSON.parse(jsonArrayStr.TilesInfoKey);
			logMessage("readFromStorage: ", "jsonArray.length="
					+ jsonArray.length);

			addMultipleTiles(jsonArray);
		}
	});
}

// add tiles to HTML page, for given JSON array (tile-info objects)
function addMultipleTiles(jsonArray) {
	logMessage("addMultipleTiles: ", "jsonArray=" + jsonArray.length);

	for (i = 0; i < jsonArray.length; i++) {
		var tileInfo = jsonArray[i];
		addOneTile(tileInfo.title, tileInfo.url);
	}
}

// add a tile to HTML page
function addOneTile(title, url) {
	logMessage("addOneTile: ", "tileInfo: " + title + "- " + url);

	if (title.length != 0 && url.length != 0) {

		var tiles_grid = document.getElementById("tiles_grid");
		var currButtons = tiles_grid.getElementsByClassName('tile_button');
		logMessage("addOneTile: ", "currButtons=" + currButtons.length);

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
	logMessage("removeOneTile: ", "title=" + title);
	if (title.length != 0) {
		var tiles_grid = document.getElementById("tiles_grid");
		var currButtons = tiles_grid.getElementsByClassName('tile_button');
		if (currButtons.length > 0) {
			for (i = 0; i < currButtons.length; i++) {
				var button = currButtons[i];
				if (button.innerText == title) {
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
	logMessage("TileButton_Click: ", target);
	logMessage("TileButton_Click: ", target.value);

	chrome.tabs.create({
		url : target.value,
		active : false
	});
}

// handle ADD, REMOVE button press
function process_buttonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("process_buttonClick: ", target);
	logMessage("process_buttonClick: ", target.value);

	if (target.value == "add") {
		var inputTitle = document.getElementById("add_title").value;
		var inputUrl = document.getElementById("add_url").value;
		addOneTile(inputTitle, inputUrl);
	} else if (target.value == "remove") {
		var inputTitle = document.getElementById("add_title").value;
		removeOneTile(inputTitle);
	} else if (target.value == "save") {
		var jsonArrayStr = "["
		var tiles_grid = document.getElementById("tiles_grid");

		var jsonArray = [];
		var currButtons = tiles_grid.getElementsByClassName('tile_button');
		for (i = 0; i < currButtons.length; i++) {
			jsonArray.push({
				"title" : currButtons[i].innerText,
				"url" : currButtons[i].value
			});
		}

		writeToStorage(jsonArray);
	} else if (target.value == "clear") {
		var tiles_grid = document.getElementById("tiles_grid");
		while (tiles_grid.hasChildNodes()) {
			tiles_grid.removeChild(tiles_grid.lastChild);
		}
	} else if (target.value == "restore") {
		var tiles_grid = document.getElementById("tiles_grid");
		while (tiles_grid.hasChildNodes()) {
			tiles_grid.removeChild(tiles_grid.lastChild);
		}
		readInputFile();
	}
}

// handle loading of book-marks
function process_bookmark(bookmarks) {
	var select = document.querySelector('.book_mark');

	for (var i = 0; i < bookmarks.length; i++) {
		var bookmark = bookmarks[i];
		if (bookmark.url) {
			var option = document.createElement("option");
			option.text = bookmark.title;
			select.add(option);
		}

		if (bookmark.children) {
			process_bookmark(bookmark.children);
		}
	}
}

// handle selection of book-mark from drop down list
function process_listChange() {
	var item = document.querySelector('.book_mark').value;
	logMessage("List_Selected: ", item, "")
}

// read JSON file for tile list and add them to HTML page
function readInputFile() {
	var fileReadRequest = new XMLHttpRequest();
	fileReadRequest.open("GET", 'url.json', true);
	fileReadRequest.onreadystatechange = function() {
		if (fileReadRequest.readyState === 4) {
			var fileContents = fileReadRequest.responseText;
			var jsonArray = JSON.parse(fileContents);
			logMessage("readInputFile: ", "jsonArray=" + jsonArray.length);

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
