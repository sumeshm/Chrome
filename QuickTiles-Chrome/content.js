var bookMarkList = [];
var state = "view";
var editIndex = -1;
const stateView = "view";
const stateEdit = "edit";
const TilesInfoKey = 'TilesInfoKey';

document.addEventListener('DOMContentLoaded', function () {

	logMessage("INIT: ", "Start");

	// populate tiles from cache
	readFromStorage();

	// book-marks list loaded listener
	var select = document.getElementById("selectBookmarks");
	select.addEventListener('change', process_listChange);
	chrome.bookmarks.getTree(process_bookmark);

	const optionsButtonList = document.getElementsByClassName("actionButton");
	for (i = 0; i < optionsButtonList.length; i++) {
		optionsButtonList[i].addEventListener('click', handleMenuButtonClick);
	}

	logMessage("INIT: ", "End");
});


//read storage for tile list and add them to HTML page
function readFromStorage() {
	chrome.storage.local.get([TilesInfoKey], function (jsonArrayStr) {
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
	var jsonArrayStr = JSON.stringify(jsonArray);
	logMessage("Write_Storage: ", "tileInfoStr=" + jsonArrayStr);

	chrome.storage.local.set({
		TilesInfoKey: jsonArrayStr
	}, function () {
		logMessage("Write_Storage: ", "set key done");
	});
}

//read JSON file for tile list and add them to HTML page
function readInputFile() {
	var fileReadRequest = new XMLHttpRequest();
	fileReadRequest.open("GET", 'url.json', true);
	fileReadRequest.onreadystatechange = function () {
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

	for (index = 0; index < jsonArray.length; index++) {
		var tileInfo = jsonArray[index];
		addOneTile(tileInfo.title, tileInfo.url, index);
	}
}

function addOneTile(title, url, index) {
	logMessage("Add_OneTile: ", "tileInfo: " + title + "- " + url);

	if (title.length != 0 && url.length != 0) {
		const gridList = document.getElementsByClassName("gridTiles");

		const buttonList = gridList[0].getElementsByClassName("tileButton");
		if (buttonList.length > 35) {
			logMessage("Add_OneTile: ", "ERROR - Tile limit of 36 reached");
			return;
		}

		var button = document.createElement("button");
		logMessage("Add_OneTile: ", "button=" + button);
		button.className = "tileButton";
		button.value = url;
		button.innerText = title;
		button.addEventListener("click", function () {
			handleTileButtonClick(button, index);
		});

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

		if (trimURL.length == 0) {
			trimURL = url;
		}

		button.style.background = "transparent url('" + trimURL + "/favicon.ico" + "')";
		button.style.backgroundRepeat = "no-repeat";
		button.style.backgroundPosition = "95% 50%";
		button.style.backgroundSize = "30px";

		gridList[0].appendChild(button);
	}
}

// update one tile from HTML page by matching title
function updateOneTile(title, url) {
	logMessage("Update_OneTile: ", "title=" + title + ", url=" + url + ", index=" + editIndex);
	if (title.length != 0 && editIndex > -1) {
		const gridList = document.getElementsByClassName("gridTiles");
		const tileButtomList = gridList[0].getElementsByClassName("tileButton");
		if (tileButtomList.length != 0 && editIndex < tileButtomList.length) {
			logMessage("Update_OneTile: ", "FOUND @ " + editIndex);
			var button = tileButtomList[editIndex];
			button.innerText = title;
			button.value = url;
		}
	}
}

// delte one tile from HTML page by matching title
function deleteOneTile() {
	logMessage("Delete_OneTile: ", "index=" + editIndex);
	if (editIndex > -1) {
		const gridList = document.getElementsByClassName("gridTiles");
		const tileButtomList = gridList[0].getElementsByClassName("tileButton");
		if (tileButtomList.length != 0 && editIndex < tileButtomList.length) {
			logMessage("Delete_OneTile: ", "FOUND @ " + editIndex);
			var button = tileButtomList[editIndex];
			gridList[0].removeChild(button);
		}
	}
}

//fetch list of tiles and build corresponding JSON array
function createTilesJsonArray() {
	var jsonArray = [];
	const gridList = document.getElementsByClassName("gridTiles");
	const buttonList = gridList[0].getElementsByClassName("tileButton");
	for (i = 0; i < buttonList.length; i++) {
		jsonArray.push({
			"title": buttonList[i].innerText,
			"url": buttonList[i].value
		});
	}

	return jsonArray;
}

//fetch the count of tiles
function getTilesArrayLength() {
	const gridList = document.getElementsByClassName("gridTiles");
	const buttonList = gridList[0].getElementsByClassName("tileButton");
	return buttonList.length;
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
function handleTileButtonClick(target, index) {
	//var target = event.target || event.srcElement;
	logMessage("Click_TileButton: ", "target=" + target + ", class="
		+ target.className + ", index=" + index);

	if (state == stateView) {
		// open new tab for the tile's url
		chrome.tabs.create({
			url: target.value,
			active: false
		});
	} else {
		// update edit popup
		var popUpTitle = document.getElementById("popup_edit_title");
		var popUpUrl = document.getElementById("popup_edit_url");
		popUpTitle.value = target.innerText;
		popUpUrl.value = target.value;
		editIndex = index;
	}
}

//handle selection of book-mark from drop down list
function process_listChange() {
	logMessage("BookMark_Selected", "")
	var selectBookmarks = document.querySelector('.bookmarks');
	if (selectBookmarks != null) {
		var urlValue = selectBookmarks.value;
		logMessage("BookMark_Selected: ", "URL:" + urlValue)
		chrome.tabs.create({
			url: urlValue,
			active: false
		});
	}
}

//handle loading of book-marks
function process_bookmark(bookmarks) {
	logMessage("BookMark_Loaded: ", "bookmarks:" + bookmarks.length)

	var select = document.getElementById("selectBookmarks");

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

// handle PopUp menu button clicks --> CANCEL, SUBMIT, DELETE
function handlePopUpButtonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("Click_PopUpButton: ", "target=" + target + ", class="
		+ target.className);

	if (target.id == "actionCancel") {
		//no action
	} else if (target.id == "actionSubmitAdd") {
		// add new tile to end of array
		var inputTitle = document.getElementById("popup_add_title").value;
		var inputUrl = document.getElementById("popup_add_url").value;
		var inputIndex = getTilesArrayLength();
		addOneTile(inputTitle, inputUrl, inputIndex);
	} else if (target.id == "actionSubmitUpdate") {
		// update the tile details
		var updatedTitle = document.getElementById("popup_edit_title").value;
		var updatedUrl = document.getElementById("popup_edit_url").value;
		updateOneTile(updatedTitle, updatedUrl);
	} else if (target.id == "actionDelete") {
		// delete the tile
		var inputTitle = document.getElementById("popup_edit_title").value;
		deleteOneTile();
	}

	// save changes
	var jsonArray = createTilesJsonArray();
	writeToStorage(jsonArray);
	writeToInputFile(jsonArray);

	// close popup
	hidePopUpMenu();
}

// handle right-menu buttons ADD, EDIT, SAVE, CLEAR, RESTORE, EXPORT, CONSOLE
function handleMenuButtonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("Click_MenuButton: ", "target=" + target + ", class="
		+ target.className + ", id=" + target.id);

	var actionContainer = document.getElementById("actionContainer");
	actionContainer.style.visibility = "visible";

	if (target.id == "add") {
		var menu = createAddPopUpMenu();
		showPopUpMenu(menu);
	} else if (target.id == "edit") {
		var menu = createEditPopUpMenu();
		showPopUpMenu(menu);
	} else if (target.id == "save") {
		var jsonArray = createTilesJsonArray();
		writeToStorage(jsonArray);
	} else if (target.id == "clear") {
		const gridList = document.getElementsByClassName("gridTiles");
		while (gridList[0].hasChildNodes()) {
			gridList[0].removeChild(gridList[0].lastChild);
		}
	} else if (target.id == "restore") {
		const gridList = document.getElementsByClassName("gridTiles");
		while (gridList[0].hasChildNodes()) {
			gridList[0].removeChild(gridList[0].lastChild);
		}
		readInputFile();
	} else if (target.id == "console") {
		var consoleTextArea = document.getElementById("console-text")
		if (consoleTextArea.style.display === "block") {
			consoleTextArea.style.display = "none";
		} else {
			consoleTextArea.style.display = "block";
		}
		consoleTextArea.scrollTop = consoleTextArea.scrollHeight + 10;
	} else if (target.id == "export") {
		var jsonArray = createTilesJsonArray();
		writeToInputFile(jsonArray);
	}
}

//show the user input pop-up
function createAddPopUpMenu() {
	logMessage("Create_Add_PopUpMenu: ", "");

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
	cancelButton.className = "formActionButton actionCancel";
	cancelButton.id = "actionCancel";
	cancelButton.addEventListener('click', handlePopUpButtonClick);

	var addButton = document.createElement("button");
	addButton.className = "formActionButton actionSubmit";
	addButton.id = "actionSubmitAdd";
	addButton.addEventListener('click', handlePopUpButtonClick);

	var gridAdd = document.createElement("div");
	gridAdd.className = "grid_popup-add";
	gridAdd.id = "grid_popup-add";

	gridAdd.appendChild(inputTitle);
	gridAdd.appendChild(inputUrl);
	gridAdd.appendChild(cancelButton);
	gridAdd.appendChild(addButton);

	return gridAdd;
}

function createEditPopUpMenu() {
	logMessage("Create_Edit_PopUpMenu: ", "");

	var inputTitle = document.createElement("input");
	inputTitle.className = "input title";
	inputTitle.type = "text";
	inputTitle.id = "popup_edit_title";
	inputTitle.placeholder = "Click on any tile to edit";

	var inputUrl = document.createElement("input");
	inputUrl.className = "input url";
	inputUrl.type = "text";
	inputUrl.id = "popup_edit_url";
	inputUrl.placeholder = "Click on any tile to edit";

	var cancelButton = document.createElement("button");
	cancelButton.className = "formActionButton actionCancel";
	cancelButton.id = "actionCancel";
	cancelButton.addEventListener('click', handlePopUpButtonClick);

	var updateButton = document.createElement("button");
	updateButton.className = "formActionButton actionSubmit";
	updateButton.id = "actionSubmitUpdate";
	updateButton.addEventListener('click', handlePopUpButtonClick);

	var dleteButton = document.createElement("button");
	dleteButton.className = "formActionButton actionDelete";
	dleteButton.id = "actionDelete";
	dleteButton.addEventListener('click', handlePopUpButtonClick);

	var gridEdit = document.createElement("div");
	gridEdit.className = "grid_popup-edit";
	gridEdit.id = "grid_popup-edit";

	gridEdit.appendChild(inputTitle);
	gridEdit.appendChild(inputUrl);
	gridEdit.appendChild(cancelButton);
	gridEdit.appendChild(updateButton);
	gridEdit.appendChild(dleteButton);

	return gridEdit;
}

function showPopUpMenu(newChild) {
	const gridList = document.getElementsByClassName("gridPopup");

	// clear old menus
	while (gridList[0].hasChildNodes()) {
		gridList[0].removeChild(gridList[0].lastChild);
	}

	// add new menu
	gridList[0].appendChild(newChild);

	// bring the state into edit mode
	state = stateEdit;
	editIndex = -1;	
}

function hidePopUpMenu() {
	const gridList = document.getElementsByClassName("gridPopup");

	while (gridList[0].hasChildNodes()) {
		gridList[0].removeChild(gridList[0].lastChild);
	}

	// bring the state out of edit mode
	state = stateView;
	editIndex = -1;
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
