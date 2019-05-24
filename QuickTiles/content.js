var bookMarkList = [];
var stateView = "view";
var stateEdit = "edit";
var state = "view";
var editIndex = -1;

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
		optionsButtonList[i].addEventListener('click', process_actionButtonClick);
	}

	state = stateView;
	logMessage("INIT: ", "End");
});


//read storage for tile list and add them to HTML page
function readFromStorage() {
	var TilesInfoKey = 'TilesInfoKey';

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
	var TilesInfoKey = 'TilesInfoKey';
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

	for (i = 0; i < jsonArray.length; i++) {
		var tileInfo = jsonArray[i];
		addOneTile(tileInfo.title, tileInfo.url, i);
	}
}

function addOneTile(title, url, index) {
	logMessage("Add_OneTile: ", "tileInfo: " + title + "- " + url);

	if (title.length != 0 && url.length != 0) {
		const gridList = document.getElementsByClassName("gridTiles");

		const buttonList = gridList[0].getElementsByClassName("tileButton");
		if (buttonList.length > 30) {
			logMessage("addOneTile: ", "ERROR - Tile limit of 30 reached");
			return;
		}

		var button = document.createElement("button");
		logMessage("Add_OneTile: ", "button=" + button);
		button.className = "tileButton";
		button.value = url;
		button.innerText = title;
		button.addEventListener("click", function() {
			process_tileButtonClick(button, index);
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

//remove one tile from HTML page by matching title
function updateOneTile(title, url) {
	logMessage("Update_OneTile: ", "title=" + title + ", url=" + url + ", index=" + editIndex);
	if (title.length != 0 && editIndex > -1) {
		const gridList = document.getElementsByClassName("gridTiles");
		const tileButtomList = gridList[0].getElementsByClassName("tileButton");
		if (tileButtomList.length != 0 && editIndex < tileButtomList.length) {
			logMessage("updateOneTile: ", "FOUND @ " + editIndex);
			var button = tileButtomList[editIndex];
			button.innerText = title;
			button.value = url;
		}
	}
}

//remove one tile from HTML page by matching title
function removeOneTile() {
	logMessage("Remove_OneTile: ", "index=" + editIndex);
	if (editIndex > -1) {
		const gridList = document.getElementsByClassName("gridTiles");
		const tileButtomList = gridList[0].getElementsByClassName("tileButton");
		if (tileButtomList.length != 0 && editIndex < tileButtomList.length) {
			logMessage("removeOneTile: ", "FOUND @ " + editIndex);
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

function createTilesJsonArrayEditor() {
	var jsonArray = [];

	const gridList = document.getElementsByClassName("gridTiles");

	const buttonList = gridList[0].getElementsByClassName("tileButton");
	for (i = 0; i < buttonList.length; i++) {
		jsonArray.push({
			"title": buttonList[i].innerText,
			"url": buttonList[i].value
		});
	}
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
function process_tileButtonClick(target, index) {
	//var target = event.target || event.srcElement;
	logMessage("process_tileButtonClick: ", "target=" + target + ", class="
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

//handle ADD, REMOVE, SAVE, CLEAR, RESTORE, ADD TILE
function process_buttonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("Button_Click: ", "target=" + target + ", class="
		+ target.className);

	if (target.id == "actionCancel") {
	} else if (target.id == "actionSubmitAdd") {
		var inputTitle = document.getElementById("popup_add_title").value;
		var inputUrl = document.getElementById("popup_add_url").value;
		addOneTile(inputTitle, inputUrl);
	} else if (target.id == "actionSubmitRemove") {
		// update the tile details
		var updatedTitle = document.getElementById("popup_edit_title").value;
		var updatedUrl = document.getElementById("popup_edit_url").value;
		updateOneTile(updatedTitle, updatedUrl, );
		// save changes
		var jsonArray = createTilesJsonArray();
		writeToStorage(jsonArray);
	} else if (target.id == "actionDelete") {
		// delete the tile
		var inputTitle = document.getElementById("popup_edit_title").value;
		removeOneTile();
		// save changes
		var jsonArray = createTilesJsonArray();
		writeToStorage(jsonArray);

	}

	removeChildren();

	// bring the state out of edit mode
	state = stateView;
	editIndex =-1;
}

// handle ADD, REMOVE, EDIT, SAVE, CLEAR, RESTORE, EXPORT, CONSOLE
function process_actionButtonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("HEADER_Button_Click: ", "target=" + target + ", class="
		+ target.className + ", id=" + target.id);

	var actionContainer = document.getElementById("actionContainer");
	actionContainer.style.visibility = "visible";

	if (target.id == "add") {
		showAddPopup();
	} else if (target.id == "remove") {
		showRemovePopup();
	} else if (target.id == "edit") {
		showEditPopup();
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
function showAddPopup() {
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
	cancelButton.addEventListener('click', process_buttonClick);

	var addButton = document.createElement("button");
	addButton.className = "formActionButton actionSubmit";
	addButton.id = "actionSubmitAdd";
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
function showRemovePopup() {
	var inputTitle = document.createElement("input");
	inputTitle.className = "input title";
	inputTitle.type = "text";
	inputTitle.id = "popup_remove_title";
	inputTitle.placeholder = "Title, e.g. Google";

	var cancelButton = document.createElement("button");
	cancelButton.className = "formActionButton actionCancel";
	cancelButton.id = "actionCancel";
	cancelButton.addEventListener('click', process_buttonClick);

	var removeButton = document.createElement("button");
	removeButton.className = "formActionButton actionSubmit";
	removeButton.id = "actionSubmitRemove";
	removeButton.addEventListener('click', process_buttonClick);

	var gridRemove = document.createElement("div");
	gridRemove.className = "grid_popup-remove";
	gridRemove.id = "grid_popup-remove";

	gridRemove.appendChild(inputTitle);
	gridRemove.appendChild(cancelButton);
	gridRemove.appendChild(removeButton);

	replaceChildren(gridRemove);
}

function showEditPopup() {
	logMessage("showEditPopup: ");

	// bring the state into edit mode
	state = stateEdit;
	editIndex =-1;

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
	cancelButton.addEventListener('click', process_buttonClick);

	var removeButton = document.createElement("button");
	removeButton.className = "formActionButton actionSubmit";
	removeButton.id = "actionSubmitRemove";
	removeButton.addEventListener('click', process_buttonClick);

	var dleteButton = document.createElement("button");
	dleteButton.className = "formActionButton actionDelete";
	dleteButton.id = "actionDelete";
	dleteButton.addEventListener('click', process_buttonClick);

	var gridEdit = document.createElement("div");
	gridEdit.className = "grid_popup-edit";
	gridEdit.id = "grid_popup-edit";

	gridEdit.appendChild(inputTitle);
	gridEdit.appendChild(inputUrl);
	gridEdit.appendChild(cancelButton);
	gridEdit.appendChild(removeButton);
	gridEdit.appendChild(dleteButton);

	replaceChildren(gridEdit);
}

function removeChildren() {
	const gridList = document.getElementsByClassName("gridPopup");

	while (gridList[0].hasChildNodes()) {
		gridList[0].removeChild(gridList[0].lastChild);
	}
}

function replaceChildren(newChild) {
	const gridList = document.getElementsByClassName("gridPopup");

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
