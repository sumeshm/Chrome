'use strict';

chrome.browserAction.onClicked.addListener(function(activeTab)
  {
    chrome.tabs.create({ url: "http://www.google.com/" });
  }
);

