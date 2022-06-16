async function attachToButton() {
  let elReset = document.getElementById("reset");
  let elStart = document.getElementById("startReloadingButton");
  let elTarget = document.getElementById("targetURL") as HTMLInputElement;
  let elReload = document.getElementById("reloadTime") as HTMLInputElement;
  if (!(elReset && elStart && elTarget && elReload)) {
    console.error("DOM elements not found.");

    return;
  }
  elReset.addEventListener("click", reset);
  elStart.addEventListener("click", startReloading);
  let currentTab = (
    await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  )[0];
  // let currentTab = await chrome.tabs.getSelected();
  let state = await chrome.storage.local.get("timers");
  // data = state; tab = currentTab
  // (<HTMLInputElement>document.getElementById(elementId)).value
  elTarget.value = currentTab.url || "";
  for (let t of state.timers) {
    if (t.tab == currentTab.id) {
      elTarget.value = t.targetURL;
      elReload.value = (t.reloadTime / 1000).toString();
    }
  }
}

function reset() {
  chrome.runtime.sendMessage({ type: "reset" });
  window.close();
}

function startReloading() {
  let elMessage = document.getElementById("message");
  let elTarget = document.getElementById("targetURL") as HTMLInputElement;
  let elReload = document.getElementById("reloadTime") as HTMLInputElement;
  if (!(elMessage && elTarget && elReload)) {
    console.error("DOM elements not found.");
    return;
  }
  var reloadTime = parseInt(elReload.value) * 1000;
  var targetURL = elTarget.value;
  if (!(targetURL && reloadTime && targetURL.match(/^https?:\/\/.*/i))) {
    elMessage.innerHTML =
      "Error - must provide both target URL and time values. URL must begin with http:// or https://.";
    return;
  }
  elMessage.innerHTML = "Success - reloading.";
  chrome.runtime.sendMessage({
    targetURL: targetURL,
    reloadTime: reloadTime,
    type: "reload",
  });
  window.close();
}

if (document.readyState == "complete") {
  attachToButton();
} else {
  window.addEventListener("load", attachToButton);
}
