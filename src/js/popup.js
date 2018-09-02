window.onload = () => {
	scale = 8,
	xmlns = "http://www.w3.org/2000/svg";

	showPage("main");
	getData(true).then(data => {
		let div = document.querySelector("#main").querySelector(".screens");
		div.appendChild(createMini(data));
	});
	getData(false).then(data => {
		let div = document.querySelector("#save").querySelector(".screens");
		div.appendChild(createMini(data));
		let input = document.getElementById("save-name");
		input.setAttribute("placeholder", data.name);
		document.getElementById("save-new").addEventListener("click", () => {
			chrome.storage.local.get(["counter","layouts"], results => {
				let name = (input.value) ? input.value : input.placeholder;
				data["name"] = name;
				data = Object.entries(data).filter(entry => entry[0] !== "last").reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
				results.layouts.push(data);
				console.log(results.layouts);
				results.counter++;
				chrome.storage.local.set({ counter: results.counter, layouts: results.layouts });
			});
		});
	});
	document.getElementById("layout-save").addEventListener("click", () => {
		showPage("save");
	});
	document.getElementById("save-back").addEventListener("click", () => {
		showPage("main");
	});
}

const showPage = pageId => {
	let pages = ["main", "save", "load"];
	pages.filter(page => page !== pageId).forEach(page => {
		document.getElementById(page).style.display = "none";
	})
	document.getElementById(pageId).style.display = "block";
}

const getData = getLast => {
	return new Promise(resolve => {
		// getLastFocused needs to be the outermost call
		// otherwise the others mess with it and you don't get the correct window
		chrome.windows.getLastFocused(last => {
			chrome.windows.getAll(windows => {
				chrome.system.display.getInfo(displays => {
					chrome.storage.local.get(["counter"], results => {
						let lastWin = (getLast) ? last : null;
						resolve({
							id: results.counter+1,
							name: `layout-${results.counter+1}`,
							displays: displays.map(display => display.bounds),
							windows: windows,
							last: lastWin
						});
					})
				})
			})
		})
	})
}

const createMini = data => {
	let svg = document.createElementNS(xmlns, "svg"),
		maxH = 0,
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

	data.windows.forEach((win,i) => {
		let color = (data.last && (data.last.id === win.id)) ? "#ff0000" : "#4CAF50";
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
	return svg;
}