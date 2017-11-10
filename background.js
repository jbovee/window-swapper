// I have this here, but it doesn't actually do anything yet

function swapWindowsT(currentW, targetW) {
	if (currentW.id != targetW.id) {
		if (currentW.state != "minimized" && targetW.state != "minimized") {
			chrome.windows.update(currentW.id,
				{top: targetW.top,
				left: targetW.left,
				width: targetW.width,
				height: targetW.height,
				focused: targetW.focused});
			if (targetW.state != "normal") {
				chrome.windows.update(currentW.id, {state: targetW.state});
			}

			chrome.windows.update(targetW.id,
				{top: currentW.top,
				left: currentW.left,
				width: currentW.width,
				height: currentW.height,
				focused: currentW.focused});
			if (currentW.state != "normal") {
				chrome.windows.update(targetW.id, {state: currentW.state});
			}
			window.close();
		}
	}
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.type == "popup_swap") {
		swapWindowsT(request.fWin, request.cWin);
	}
});

chrome.commands.onCommand.addListener(function(command) {
	console.log("shortcut pressed");
	chrome.windows.getLastFocused(function(fWin) {
		chrome.windows.getAll(function(windows) {
			if (windows.length == 2) {
				windows.forEach(function(win) {
					if (fWin.id != win.id) swapWindowsT(fWin, win);
				});
			}
		});
	});
});