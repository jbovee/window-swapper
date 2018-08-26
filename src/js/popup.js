window.onload = () => {
	currentWindow = null,
	otherWindow = null,
	scale = 10;

	createMiniDisplays();
	chrome.windows.getLastFocused(getWindows);
}

const createMiniDisplays = () => {
	chrome.system.display.getInfo(displays => {
		let maxH = 0,
			maxW = 0;
		const svg = document.getElementById("mini-svg");
		displays.forEach(display => {
			const w = display.bounds.left + display.bounds.width;
			const h = display.bounds.top + display.bounds.height;
			if (w > maxW) {maxW = w;}
			if (h > maxH) {maxH = h;}
			const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
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
}

const getWindows = focusedWindow => {
	currentWindow = focusedWindow;
	chrome.windows.getAll(createWindowRects);
}

const createWindowRects = windows => {
	const svg = document.getElementById("mini-svg");
	let color = null;
	windows.forEach((win,i) => {
		color = (currentWindow.id == win.id) ? "#ff0000" : "#4CAF50";
		const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("id", win.id);
		rect.setAttribute("class", "window");
		rect.setAttribute("x", (win.left/scale));
		rect.setAttribute("y", (win.top/scale));
		rect.setAttribute("width", (win.width/scale));
		rect.setAttribute("height", (win.height/scale));
		rect.setAttribute("fill", color);
		rect.setAttribute("stroke", color);
		svg.appendChild(rect);
		const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
		label.setAttribute("x", (win.left/scale) + (win.width/scale) / 2);
		label.setAttribute("y", 8 + (win.top/scale) + (win.height/scale)/2);
		label.setAttribute("fill", color);
		label.setAttribute("font-size", 24);
		label.setAttribute("text-anchor", "middle");
		label.setAttribute("alignment-baseline", "center")
		label.textContent = `${i+1}`;
		svg.appendChild(label);
		document.getElementById(win.id.toString()).addEventListener("click", () => {
			chrome.runtime.sendMessage({type: "popup_swap", fWin: currentWindow, cWin: win});
		});
	});
}