var currentWindow = null,
	otherWindow = null,
	scale = 16;

chrome.system.display.getInfo(function(displays) {
	var maxH = 0,
		maxW = 0;
	var svg = document.getElementById("mini-svg");
	displays.forEach(function(display) {
		var w = display.bounds.left + display.bounds.width;
		var h = display.bounds.top + display.bounds.height;
		if (w > maxW) {maxW = w;}
		if (h > maxH) {maxH = h;}
		var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("x", (display.bounds.left/scale));
		rect.setAttribute("y", (display.bounds.top/scale));
		rect.setAttribute("width", (display.bounds.width/scale));
		rect.setAttribute("height", (display.bounds.height/scale));
		rect.setAttribute("fill", "black");
		rect.setAttribute("fill-opacity", 0.1);
		rect.setAttribute("stroke", "black");
		rect.setAttribute("stroke-opacity", 0.2);
		svg.appendChild(rect);
	});
	svg.setAttribute("height", maxH/scale);
	svg.setAttribute("width", maxW/scale);
});

chrome.windows.getLastFocused(getWindows);

function getWindows(focusedWindow) {
	currentWindow = focusedWindow;
	chrome.windows.getAll(createWindowRects);
}

function createWindowRects(windows) {
	var svg = document.getElementById("mini-svg"),
		color = null;
	windows.forEach(function(window) {
		if (currentWindow.id == window.id) {
			color = "#ff0000";
		} else {
			color = "#4CAF50";
		}
		var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("id", window.id);
		rect.setAttribute("class", "window");
		rect.setAttribute("x", (window.left/scale));
		rect.setAttribute("y", (window.top/scale));
		rect.setAttribute("width", (window.width/scale));
		rect.setAttribute("height", (window.height/scale));
		rect.setAttribute("fill", color);
		rect.setAttribute("stroke", color);
		svg.appendChild(rect);
		document.getElementById(window.id.toString()).addEventListener("click", function() {
			swapWindows(window);
		});
	});
}

function swapWindows(win) {
	otherWindow = win;
	if (currentWindow.id != otherWindow.id) {
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
}