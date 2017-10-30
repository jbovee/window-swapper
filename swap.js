var currentWindow = null;
var otherWindow = null;

function start(tab) {
	chrome.windows.getLastFocused(getFocusedWindow);
}

function getFocusedWindow(win) {
	currentWindow = win;
	chrome.windows.getAll(swapWindows);
}

function swapWindows(windows) {
	var numWindows = windows.length;
	windows.forEach(function(window) {
		if (currentWindow.id != window.id) {
			otherWindow = window;
		}
	})

	if (currentWindow.state != "minimized" && otherWindow.state != "minimized") {
		chrome.windows.update(currentWindow.id,
			{top: otherWindow.top,
			left: otherWindow.left,
			width: otherWindow.width,
			height: otherWindow.height,
			focused: otherWindow.focused});
		if (otherWindow.state != "normal") {
			chrome.windows.update(currentWindow.id, {state: otherWindow.state});
		}

		chrome.windows.update(otherWindow.id,
			{top: currentWindow.top,
			left: currentWindow.left,
			width: currentWindow.width,
			height: currentWindow.height,
			focused: currentWindow.focused});
		if (currentWindow.state != "normal") {
			chrome.windows.update(otherWindow.id, {state: currentWindow.state});
		}
	}
}

chrome.browserAction.onClicked.addListener(start);