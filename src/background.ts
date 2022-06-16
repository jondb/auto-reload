chrome.storage.local.set({ timers: [] });

async function updateBadge() {
  let allTabs = await chrome.tabs.query({});
  let state = await chrome.storage.local.get("timers");
  let message = state.timers.length > 0 ? String(state.timers.length) : "";
  for (let tab of allTabs) {
    await chrome.action.setBadgeText({ text: message, tabId: tab.id });
  }
}

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.type !== "showcount") return;
  await updateBadge();
});

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.type !== "reload" || !request) return;

  let currentTab = (
    await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  )[0];

  var tabid = currentTab.id || 0;

  async function reloadFunction() {
    await chrome.tabs.update(tabid, { url: request.targetURL });
  }

  var t = setInterval(reloadFunction, request.reloadTime);
  var page = {
    timer: t,
    targetURL: request.targetURL,
    reloadTime: request.reloadTime,
    tab: tabid,
  };
  let state = await chrome.storage.local.get("timers");

  state.timers.push(page);
  await chrome.storage.local.set(state);

  await reloadFunction();
  await updateBadge();
});

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.type !== "reset") return;

  let state = await chrome.storage.local.get("timers");
  await chrome.storage.local.set({ timers: [] });

  for (let t of state.timers) {
    clearInterval(t.timer);
  }
  await updateBadge();
});
