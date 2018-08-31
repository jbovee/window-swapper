window.onload = () => {
	scale = 10,
	xmlns = "http://www.w3.org/2000/svg";

	showPage("main");
	chrome.system.display.getInfo(displays => {
		chrome.windows.getAll(windows => {
			chrome.windows.getLastFocused(last => {
				let data = {
					id: "1",
					name: "basic",
					displays: [...displays].map(display => display.bounds),
					windows: windows,
					last: last
				};
				createMini("#main",data);
			})
		})
	});
	document.getElementById("layout-save").addEventListener("click", () => showPage("save"));
}

const showPage = pageId => {
	console.log(`Showing ${pageId}`);
	let pages = ["main", "save", "load"];
	pages.filter(page => page !== pageId).forEach(page => {
		document.getElementById(page).style.display = "none";
	})
	document.getElementById(pageId).style.display = "block";
}

const createMini = (target,data) => {
	let div = document.querySelector(target).querySelector(".screens");
	let svg = document.createElementNS(xmlns, "svg");
	createMiniDisplays(data,svg);
	createMiniWindows(data,svg);
	div.appendChild(svg);
}

const createMiniDisplays = (data,svg) => {
	let maxH = 0,
		maxW = 0;
	data.displays.forEach(display => {
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
}

const createMiniWindows = (data,svg) => {
	data.windows.forEach((win,i) => {
		let color = (data.last && data.last.id == win.id) ? "#ff0000" : "#4CAF50";
		const g = document.createElementNS(xmlns, "g");
		g.setAttribute("id", win.id);
		g.setAttribute("class", "window");
		if (data.last) {
			g.addEventListener("click", () => {
				chrome.runtime.sendMessage({type: "popup_swap", fWin: data.last, cWin: win});
			});
		}
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
}