document.addEventListener('DOMContentLoaded', function() {

	// tile_buttons
	var tileButtonList = document.querySelectorAll(".tile_button");
	for (i = 0; i < tileButtonList.length; i++) {
		tileButtonList[i].addEventListener('click', tileButtonClick);
	}

	// add_button
	document.querySelector('.add_button').addEventListener('click',
			addButtonClick);
});

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
}

function tileButtonClick(event) {
	var target = event.target || event.srcElement;
	var console = document.getElementById("console")
	logMessage("TileButton_Click: ", target);
	logMessage("TileButton_Click: ", target.value);
	console.focus();

	chrome.tabs.create({url: target.value, active: false});
}

function addButtonClick(event) {
	var target = event.target || event.srcElement;
	var console = document.getElementById("console")
	logMessage("AddButton_Click: ", target);
	logMessage("AddButton_Click: ", target.value);
	console.focus();
}
