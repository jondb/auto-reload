chrome.storage.local.set({ timers: [] });

function updateBadge() {
  chrome.tabs.query({}, function (tabs) {
    chrome.storage.local.get("timers", function (data) {
      var timers = data.timers;
      var message = timers.length > 0 ? String(timers.length) : "";

      for (var i = 0; i < tabs.length; i++) {
        var tabid = tabs[i].id;
        chrome.action.setBadgeText({
          text: message,
          tabId: tabid,
        });
      }
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type !== "showcount") return;
  updateBadge();
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

  function reloadFunction() {
    chrome.tabs.update(tabid, { url: request.targetURL });
  }

  var t = setInterval(reloadFunction, request.reloadTime);
  var page = {
    timer: t,
    targetURL: request.targetURL,
    reloadTime: request.reloadTime,
    tab: tabid,
  };
  chrome.storage.local.get("timers", function (data) {
    data.timers.push(page);
    chrome.storage.local.set(data, function () {
      reloadFunction();
      updateBadge();
    });
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type !== "reset") return;

  chrome.storage.local.get("timers", function (data) {
    var timers = data.timers;
    for (var i = timers.length - 1; i >= 0; i--) {
      clearInterval(timers[i].timer);
      timers.pop();
    }
    chrome.storage.local.set({ timers: timers }, function () {
      updateBadge();
    });
  });
});
