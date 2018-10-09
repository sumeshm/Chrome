//Add a listener for the browser action
chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
	chrome.tabs.create({
		url : chrome.extension.getURL('NewTab.html')
	});
}
