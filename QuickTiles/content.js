
document.addEventListener('DOMContentLoaded', function() {

	logMessage("INIT: ", "Start");

	// populate tiles from cache
	readFromStorage();

	// create the user action buttons
	showButtonsPopup();

	// book-marks list loaded listener
	chrome.bookmarks.getTree(process_bookmark);
	
	const consoleButtonList = document.getElementsByClassName("footer_button");
	for (i = 0; i < consoleButtonList.length; i++) {
		consoleButtonList[i].addEventListener('click', process_footerButtonClick);
	}

	logMessage("INIT: ", "End");
});

var bookMarkList = [];

//read storage for tile list and add them to HTML page
function readFromStorage() {
	var TilesInfoKey = 'TilesInfoKey';

	chrome.storage.local.get([ TilesInfoKey ], function(jsonArrayStr) {
		if (!jsonArrayStr.TilesInfoKey) {
			logMessage("Read_Storage: ", "get key.TilesInfoKey=UNDEFINED, restore from file");
			readInputFile();
		} else {
			var jsonArray = JSON.parse(jsonArrayStr.TilesInfoKey);
			logMessage("Read_Storage: ", "jsonArray.length="
					+ jsonArray.length);

			addMultipleTiles(jsonArray);
		}
	});
}

//write tiles list (JSON array) to storage
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

//read JSON file for tile list and add them to HTML page
function readInputFile() {
	var fileReadRequest = new XMLHttpRequest();
	fileReadRequest.open("GET", 'url.json', true);
	fileReadRequest.onreadystatechange = function() {
		if (fileReadRequest.readyState === 4) {
			var fileContents = fileReadRequest.responseText;
			var jsonArray = JSON.parse(fileContents);
			logMessage("Read_File: ", "jsonArray=" + jsonArray.length);

			addMultipleTiles(jsonArray);
		} else {
			logMessage("Read_File: ERROR - ", "failed to load");
		}
	}

	fileReadRequest.send();
}

//read JSON file for tile list and add them to HTML page
function writeToInputFile(jsonArray) {
	var jsonArrayStr = JSON.stringify(jsonArray);
	logMessage("Write_file: ", "tileInfoStr:");
	logMessage("", jsonArrayStr);
	// todo: write to a file
}

// add tiles to HTML page, for given JSON array (tile-info objects)
function addMultipleTiles(jsonArray) {
	logMessage("Add_MultipleTiles: ", "jsonArray=" + jsonArray.length);

	for (i = 0; i < jsonArray.length; i++) {
		var tileInfo = jsonArray[i];
		addOneTile(tileInfo.title, tileInfo.url);
	}
}

function addOneTile(title, url) {
	logMessage("Add_OneTile: ", "tileInfo: " + title + "- " + url);

	if (title.length != 0 && url.length != 0) {
		const gridList = document.getElementsByClassName("grid-left");

		const buttonList = gridList[0].getElementsByClassName("tile_button");
		if (buttonList.length > 30) {
			logMessage("addOneTile: ", "ERROR - Tile limit of 30 reached");
			return;
		}

		var button = document.createElement("button");
		logMessage("Add_OneTile: ", "button=" + button);
		button.className = "tile_button";
		button.value = url;
		button.innerText = title;
		button.addEventListener('click', process_tileButtonClick);

		// add icon
		var trimURL = url;

		var index1 = trimURL.indexOf('?');
		if (index1 > 1) {
			// discard '?' onwards
			trimURL = trimURL.substring(0, index1 - 1);
		}

		var index2 = trimURL.indexOf('/', 8);
		if (index2 > 1) {
			// discard '/' onwards
			trimURL = trimURL.substring(0, index2);
		}

		if (trimURL.length == 0)
		{
			trimURL = url;
		}

		button.style.background = "transparent url('" + trimURL + "/favicon.ico" + "')";
		button.style.backgroundRepeat = "no-repeat";
		button.style.backgroundPosition = "95% 50%";
		button.style.backgroundSize = "35px";
		
		gridList[0].appendChild(button);
	}
}

//remove one tile from HTML page by matching title
function removeOneTile(title) {
	logMessage("Remove_OneTile: ", "title=" + title);
	if (title.length != 0) {
		const gridList = document.getElementsByClassName("grid-left");
		const buttonList = gridList[0].getElementsByClassName("tile_button");
		for (i = 0; i < buttonList.length; i++) {
			var button = buttonList[i];
			if (button.innerText.toUpperCase() === title.toUpperCase()) {
				logMessage("removeOneTile: ", "FOUND @ " + i);
				gridList[0].removeChild(button);
				break;
			}
		}
	}
}

//fetch list of tiles and build corresponding JSON array
function createTilesJsonArray()
{
	var jsonArray = [];
	
	const gridList = document.getElementsByClassName("grid-left");

	const buttonList = gridList[0].getElementsByClassName("tile_button");
	for (i = 0; i < buttonList.length; i++) {
		jsonArray.push({
			"title" : buttonList[i].innerText,
			"url" : buttonList[i].value
		});
	}

	return jsonArray;
}

//handle loading of book-marks
function addBookmark(select) {
	logMessage("BookMark_Add: ", "bookmarks:" + bookMarkList.length)

	for (var i = 0; i < bookMarkList.length; i++) {
		var bookmark = bookMarkList[i];
		if (bookmark.url) {
			var option = document.createElement("option");
			option.text = bookmark.title;
			option.value = bookmark.url;
			select.add(option);
		}
	}
}

//handle tile-button press
function process_tileButtonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("process_tileButtonClick: ", "target=" + target + ", class="
			+ target.className);

	chrome.tabs.create({
		url : target.value,
		active : false
	});
}

//handle selection of book-mark from drop down list
function process_listChange() {
	var urlValue = document.querySelector('.select').value;
	logMessage("BookMark_Selected: ", "URL:" + urlValue)
	chrome.tabs.create({
		url : urlValue,
		active : false
	});
}

//handle loading of book-marks
function process_bookmark(bookmarks) {
	logMessage("BookMark_Loaded: ", "bookmarks:" + bookmarks.length)
	var select = document.querySelector('.select');

	for (var i = 0; i < bookmarks.length; i++) {
		var bookmark = bookmarks[i];
		if (bookmark.url) {
			bookMarkList.push(bookmark);
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

//handle ADD, REMOVE, SAVE, CLEAR, RESTORE, ADD TILE
function process_buttonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("Button_Click: ", "target=" + target + ", class="
			+ target.className);

	if (target.className == "button add") {
		showAddPopup();
	} else if (target.className == "button remove") {
		showRemovePopup();
	} else if (target.className == "button save") {
		var jsonArray = createTilesJsonArray();
		writeToStorage(jsonArray);
	} else if (target.className == "button clear") {
		const gridList = document.getElementsByClassName("grid-left");
		while (gridList[0].hasChildNodes()) {
			gridList[0].removeChild(gridList[0].lastChild);
		}
	} else if (target.className == "button restore") {
		const gridList = document.getElementsByClassName("grid-left");
		while (gridList[0].hasChildNodes()) {
			gridList[0].removeChild(gridList[0].lastChild);
		}
		readInputFile();
	} else if (target.className == "button cancel") {
		showButtonsPopup();
	} else if (target.className == "button addTile") {
		var inputTitle = document.getElementById("popup_add_title").value;
		var inputUrl = document.getElementById("popup_add_url").value;
		addOneTile(inputTitle, inputUrl);
		showButtonsPopup();
	} else if (target.className == "button removeTile") {
		var inputTitle = document.getElementById("popup_remove_title").value;
		removeOneTile(inputTitle);
		showButtonsPopup();
	}
}

//handle CONSOLE, EXPORT
function process_footerButtonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("Footer_Button_Click: ", "target=" + target + ", class="
			+ target.className + ", id=" + target.id);

	if (target.id == "console-button") {
		var consoleTextArea = document.getElementById("console-text")
		if (consoleTextArea.style.display === "block") {
			consoleTextArea.style.display = "none";
		} else {
			consoleTextArea.style.display = "block";
		}
		consoleTextArea.scrollTop = consoleTextArea.scrollHeight + 10;
	} else if (target.id == "export-button") {
		var jsonArray = createTilesJsonArray();
		writeToInputFile(jsonArray);
	}
}

// show the user input pop-up
function showButtonsPopup(action)
{
	var addButton = document.createElement("button");
	addButton.innerText = "ADD";
	addButton.className = "button add";
	addButton.addEventListener('click', process_buttonClick);

	var delButton = document.createElement("button");
	delButton.innerText = "DEL";
	delButton.className = "button remove";
	delButton.addEventListener('click', process_buttonClick);

	var saveButton = document.createElement("button");
	saveButton.innerText = "Save";
	saveButton.className = "button save";
	saveButton.addEventListener('click', process_buttonClick);

	var clearButton = document.createElement("button");
	clearButton.innerText = "Clear";
	clearButton.className = "button clear";
	clearButton.addEventListener('click', process_buttonClick);

	var restoreButton = document.createElement("button");
	restoreButton.innerText = "Restore";
	restoreButton.className = "button restore";
	restoreButton.addEventListener('click', process_buttonClick);

	var select = document.createElement("select");
	select.className = "button select";
	select.id = "add_bookmark";
	select.addEventListener('change', process_listChange);
	addBookmark(select);

	var gridButtons = document.createElement("div");
	gridButtons.className = "grid-right-buttons";
	gridButtons.id = "grid-right-buttons";

	gridButtons.appendChild(addButton);
	gridButtons.appendChild(delButton);
	gridButtons.appendChild(saveButton);
	gridButtons.appendChild(clearButton);
	gridButtons.appendChild(restoreButton);
	gridButtons.appendChild(select);

	replaceChildren(gridButtons);
}

//show the user input pop-up
function showAddPopup(action)
{
	var inputTitle = document.createElement("input");
	inputTitle.className = "input title";
	inputTitle.type = "text";
	inputTitle.id = "popup_add_title";
	inputTitle.placeholder = "Title, e.g. Google";

	var inputUrl = document.createElement("input");
	inputUrl.className = "input url";
	inputUrl.type = "text";
	inputUrl.id = "popup_add_url";
	inputUrl.placeholder = "Url, e.g. http://www.google.com";

	var cancelButton = document.createElement("button");
	cancelButton.innerText = "Cancel";
	cancelButton.className = "button cancel";
	cancelButton.id = "cancelTileButton";
	cancelButton.addEventListener('click', process_buttonClick);

	var addButton = document.createElement("button");
	addButton.innerText = "Add Tile";
	addButton.className = "button addTile";
	addButton.id = "addTileButton";
	addButton.addEventListener('click', process_buttonClick);

	var gridAdd = document.createElement("div");
	gridAdd.className = "grid_popup-add";
	gridAdd.id = "grid_popup-add";

	gridAdd.appendChild(inputTitle);
	gridAdd.appendChild(inputUrl);
	gridAdd.appendChild(cancelButton);
	gridAdd.appendChild(addButton);

	replaceChildren(gridAdd);
}

//show the user input pop-up
function showRemovePopup(action)
{
	var inputTitle = document.createElement("input");
	inputTitle.className = "input title";
	inputTitle.type = "text";
	inputTitle.id = "popup_remove_title";
	inputTitle.placeholder = "Title, e.g. Google";

	var cancelButton = document.createElement("button");
	cancelButton.innerText = "Cancel";
	cancelButton.className = "button cancel";
	cancelButton.id = "cancelTileButton";
	cancelButton.addEventListener('click', process_buttonClick);

	var removeButton = document.createElement("button");
	removeButton.innerText = "Remove Tile";
	removeButton.className = "button removeTile";
	removeButton.id = "removeTileButton";
	removeButton.addEventListener('click', process_buttonClick);

	var gridRemove = document.createElement("div");
	gridRemove.className = "grid_popup-remove";
	gridRemove.id = "grid_popup-remove";

	gridRemove.appendChild(inputTitle);
	gridRemove.appendChild(cancelButton);
	gridRemove.appendChild(removeButton);

	replaceChildren(gridRemove);
}

function replaceChildren(newChild)
{
	const gridList = document.getElementsByClassName("grid-right");

	while (gridList[0].hasChildNodes()) {
		gridList[0].removeChild(gridList[0].lastChild);
	}

	gridList[0].appendChild(newChild);
}

//simple logger
function logMessage(prefix, postfix) {
	var consoleTextArea = document.getElementById("console-text")
	if (consoleTextArea != null) {
		var date = new Date();
		var timeStamp = "";
		timeStamp += date.getHours();
		timeStamp += ":";
		timeStamp += date.getMinutes();
		timeStamp += ":";
		timeStamp += date.getSeconds();
		timeStamp += " --> ";
		timeStamp += prefix;
		timeStamp += ": ";
		timeStamp += postfix;
		timeStamp += "\n";

		consoleTextArea.value += timeStamp;
		consoleTextArea.scrollTop = consoleTextArea.scrollHeight + 10;
	}
}
