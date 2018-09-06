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

const updateLayoutList = () => {
	chrome.storage.local.get(["counter","layouts"], results => {
		let popupDoc = chrome.extension.getViews({ type: "popup" })[0].document;
		if (results.counter === 0) {
			popupDoc.getElementById("layout-list").style.display = "none";
			popupDoc.getElementById("none-svg").style.display = "block";
		} else {
			popupDoc.getElementById("none-svg").style.display = "none";
			popupDoc.getElementById("layout-list").style.display = "block";
			let list = popupDoc.getElementById("layout-list");
			list.innerHTML = "";
			results.layouts.forEach(layout => {
				let div = popupDoc.createElement("div");
				div.setAttribute("class", "list-item");
				let titleDiv = popupDoc.createElement("div");
				titleDiv.setAttribute("class", "list-title");
				let title = popupDoc.createElement("h3");
				title.innerText = layout.name;
				titleDiv.appendChild(title);
				let screensDiv = popupDoc.createElement("div");
				screensDiv.setAttribute("class", "list-screens");
				let buttonsDiv = popupDoc.createElement("div");
				buttonsDiv.setAttribute("class", "list-buttons");
				div.appendChild(titleDiv);
				div.appendChild(screensDiv);
				div.appendChild(buttonsDiv);
				list.appendChild(div);
			})
		}
	});
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
		updateLayoutList();
	}
});

chrome.runtime.onInstalled.addListener(details => {
	chrome.storage.local.get({ counter: 0, layouts: [] }, results => {
		chrome.storage.local.set({ counter: results.counter, layouts: results.layouts });
	});
});

chrome.storage.onChanged.addListener((changes,areaName) => {
	updateLayoutList();
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