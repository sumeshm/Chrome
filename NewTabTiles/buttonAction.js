document.addEventListener('DOMContentLoaded', function() {

	// populate tiles
	init();

	// tile_buttons
	var tileButtonList = document.querySelectorAll(".tile_button");
	for (i = 0; i < tileButtonList.length; i++) {
		tileButtonList[i].addEventListener('click', tileButtonClick);
	}

	// add_button and home_button
	document.querySelector('.home_button').addEventListener('click',
			buttonClick);
	document.querySelector('.add_button')
			.addEventListener('click', buttonClick);

	// book-marks list
	document.getElementById("select_bookmarks").addEventListener('change',
			process_listChange);

	chrome.bookmarks.getTree(process_bookmark);
});

function init() {
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", 'url.json', true);
	rawFile.onreadystatechange = function() {
		if (rawFile.readyState === 4) {
			var fileContents = rawFile.responseText;
			var jsonArray = JSON.parse(fileContents);
			logMessage("Init: ", "jsonArray=" + jsonArray.length);

			var tiles_grid = document.getElementById("tiles_grid");

			for (i = 0; i < jsonArray.length; i++) {
				var tileInfo = jsonArray[i];
				logMessage("Init: ", "tileInfo.title=" + tileInfo.title);
				logMessage("Init: ", "tileInfo.url=" + tileInfo.url);

				var button = document.createElement("button");
				button.className = "tile_button";
				button.value = tileInfo.url;
				button.innerText = tileInfo.title;
				button.addEventListener('click', tileButtonClick);

				tiles_grid.appendChild(button);
				logMessage("Init: ", "updated HTML");
			}
		}
	}

	rawFile.send();
}

function tileButtonClick(event) {
	var target = event.target || event.srcElement;
	logMessage("TileButton_Click: ", target);
	logMessage("TileButton_Click: ", target.value);

	chrome.tabs.create({
		url : target.value,
		active : false
	});
}

function buttonClick(event) {
	var target = event.target || event.srcElement;

	if (target.value == "add") {
		var form = document.getElementById("add_bookmark_form")
		var text = document.createElement("textarea");
		var button = document.createElement("button");
		// form.add(text);
		// form.add(button);
		// add_bookmark_form
	}

	logMessage("Button_Click: ", target);
	logMessage("Button_Click: ", target.value);
}

function process_bookmark(bookmarks) {
	var select = document.getElementById("select_bookmarks")

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

function process_listChange() {
	var item = document.getElementById("select_bookmarks").value;
	logMessage("List_Selected: ", item, "")
}

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
