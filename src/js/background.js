const swapWindowsT = (currentW, targetW) => {
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

const updateLayoutList = (counter,layouts) => {
	let popupDoc = chrome.extension.getViews({ type: "popup" })[0].document;
	if (counter === 0) {
		popupDoc.getElementById("layout-list").style.display = "none";
		popupDoc.getElementById("none-svg").style.display = "block";
	} else {
		popupDoc.getElementById("none-svg").style.display = "none";
		popupDoc.getElementById("layout-list").style.display = "block";
		let list = popupDoc.getElementById("layout-list");
		list.innerHTML = "";
		layouts.forEach((layout,i) => {
			let div = popupDoc.createElement("div");
			div.setAttribute("class", "list-item");
			let titleDiv = popupDoc.createElement("div");
			titleDiv.setAttribute("class", "list-title");
			let title = popupDoc.createElement("h3");
			title.innerText = layout.name;
			let loadBtn = popupDoc.createElement("button");
			loadBtn.innerText = "Load";
			titleDiv.appendChild(title);
			titleDiv.appendChild(loadBtn);
			let screensDiv = popupDoc.createElement("div");
			screensDiv.setAttribute("class", "list-screens");
			screensDiv.appendChild(createMini(layout));
			div.appendChild(titleDiv);
			div.appendChild(screensDiv);
			list.appendChild(div);
			if (i !== layouts.length-1) {
				list.appendChild(popupDoc.createElement("hr"));
			}
		})
	}
}

const createMini = layout => {
	let xmlns = "http://www.w3.org/2000/svg",
		scale = 8,
		svg = document.createElementNS(xmlns, "svg"),
		maxH = 0,
		maxW = 0;
	layout.displays.forEach(display => {
		const w = display.left + display.width;
		const h = display.top + display.height;
		if (w > maxW) {maxW = w;}
		if (h > maxH) {maxH = h;}
		const rect = document.createElementNS(xmlns, "rect");
		rect.setAttribute("x", (display.left/scale));
		rect.setAttribute("y", (display.top/scale));
		rect.setAttribute("width", (display.width/scale));
		rect.setAttribute("height", (display.height/scale));
		rect.setAttribute("fill", "black");
		rect.setAttribute("fill-opacity", 0.1);
		rect.setAttribute("stroke", "black");
		rect.setAttribute("stroke-opacity", 0.2);
		svg.appendChild(rect);
	});
	svg.setAttribute("height", maxH/scale);
	svg.setAttribute("width", maxW/scale);

	layout.windows.forEach((win,i) => {
		let color = "#4CAF50";
		const g = document.createElementNS(xmlns, "g");
		g.setAttribute("id", win.id);
		g.setAttribute("class", "window");
		const rect = document.createElementNS(xmlns, "rect");
		rect.setAttribute("id", win.id);
		rect.setAttribute("x", (win.left/scale));
		rect.setAttribute("y", (win.top/scale));
		rect.setAttribute("width", (win.width/scale));
		rect.setAttribute("height", (win.height/scale));
		rect.setAttribute("fill", color);
		rect.setAttribute("fill-opacity", 0.4);
		rect.setAttribute("stroke", color);
		rect.setAttribute("stroke-width", 0.5);
		rect.setAttribute("stroke-opacity", 0.8);
		g.appendChild(rect);
		const label = document.createElementNS(xmlns, "text");
		label.setAttribute("x", (win.left/scale) + (win.width/scale) / 2);
		label.setAttribute("y", 8 + (win.top/scale) + (win.height/scale)/2);
		label.setAttribute("fill", "#ffffff");
		label.setAttribute("fill-opacity", 1);
		label.setAttribute("stroke", color);
		label.setAttribute("stroke-width", 0.5);
		label.setAttribute("stroke-opacity", 1);
		label.setAttribute("font-size", 24);
		label.setAttribute("font-weight", "bold");
		label.setAttribute("text-anchor", "middle");
		label.setAttribute("alignment-baseline", "center")
		label.textContent = `${i+1}`;
		g.appendChild(label);
		svg.appendChild(g);
	});
	return svg;
}

const updateSavePH = newCounter => {
	let popupDoc = chrome.extension.getViews({ type: "popup" })[0].document;
	let input = popupDoc.getElementById("save-name");
	input.setAttribute("placeholder", `layout-${newCounter+1}`);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === "popup_swap") {
		swapWindowsT(request.fWin, request.cWin);
	} else if (request.type === "update_list") {
		chrome.storage.local.get(["counter","layouts"], results => {
			updateLayoutList(results.counter,results.layouts);
		});
	}
});

chrome.runtime.onInstalled.addListener(details => {
	chrome.storage.local.get({ counter: 0, layouts: [] }, results => {
		chrome.storage.local.set({ counter: results.counter, layouts: results.layouts });
	});
});

chrome.storage.onChanged.addListener((changes,areaName) => {
	updateLayoutList(changes.counter.newValue,changes.layouts.newValue);
	updateSavePH(changes.counter.newValue);
});

chrome.commands.onCommand.addListener(command => {
	switch(command) {
		case "base":
			chrome.windows.getLastFocused(fWin => {
				chrome.windows.getAll(windows => {
					if (windows.length == 2) {
						windows.forEach(win => {
							if (fWin.id != win.id) swapWindowsT(fWin, win);
						});
					}
				});
			});
			break;
		default:
	}
});