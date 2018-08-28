window.onload = () => {
	scale = 10,
	xmlns = "http://www.w3.org/2000/svg";

	document.getElementById("root").innerHTML = "";
	loadBasePage();
}

const loadBasePage = () => {
	const root = document.getElementById("root");

	const buttons = document.createElement("div");
	buttons.setAttribute("id", "layout-buttons");

	const save = document.createElement("button");
	save.setAttribute("id", "layout-save");
	save.innerHTML = "Save Layout";

	const load = document.createElement("button");
	load.setAttribute("id", "layout-load");
	load.innerHTML = "Load Layout";

	const manage = document.createElement("button");
	manage.setAttribute("id", "layout-manage");
	manage.innerHTML = "Manage Layout";

	buttons.appendChild(save);
	buttons.appendChild(load);
	buttons.appendChild(manage);

	const screens = document.createElement("div");
	screens.setAttribute("id", "screens");

	const svg = document.createElementNS(xmlns, "svg");
	createMiniDisplays(svg);
	createMiniWindows(svg);
	screens.appendChild(svg);

	root.appendChild(buttons);
	root.appendChild(screens);
}

const createMiniDisplays = svg => {
	chrome.system.display.getInfo(displays => {
		let maxH = 0,
			maxW = 0;
		displays.forEach(display => {
			const w = display.bounds.left + display.bounds.width;
			const h = display.bounds.top + display.bounds.height;
			if (w > maxW) {maxW = w;}
			if (h > maxH) {maxH = h;}
			const rect = document.createElementNS(xmlns, "rect");
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

const createMiniWindows = svg => {
	chrome.windows.getLastFocused(current => {
		chrome.windows.getAll(windows => {
			let color = null;
			windows.forEach((win,i) => {
				color = (current.id == win.id) ? "#ff0000" : "#4CAF50";
				const g = document.createElementNS(xmlns, "g");
				g.setAttribute("id", win.id);
				g.setAttribute("class", "window");
				g.addEventListener("click", () => {
					chrome.runtime.sendMessage({type: "popup_swap", fWin: current, cWin: win});
				});
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
		});
	});
}