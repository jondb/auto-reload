

function attachToButton() {
    document.getElementById("reset").addEventListener("click", reset);
    document.getElementById("startReloadingButton").addEventListener("click", startReloading);
    chrome.tabs.getSelected(null, function (tab) {
        chrome.storage.local.get("timers", function(data) {
            document.getElementById("targetURL").value = tab.url;
            for (var i = 0; i < data.timers.length; i++) {
                var p = data.timers[i];
                if (p.tab == tab.id) {
                    document.getElementById("targetURL").value = p.targetURL;
                    document.getElementById("reloadTime").value = p.reloadTime/1000;
                }
            }
        });
    });

}

if (document.readyState == "complete") {
    attachToButton();
} else {
    window.addEventListener("load", attachToButton);
}

function reset() {
    chrome.runtime.sendMessage({type: "reset"});
    window.close();
}

function startReloading() {
    var reloadTime = document.getElementById("reloadTime").value * 1000;
    var targetURL = document.getElementById("targetURL").value;
    if (!(targetURL && reloadTime && targetURL.match(/^https?:\/\/.*/i))) {
        document.getElementById("message").innerHTML = "Error - must provide both target URL and time values. URL must begin with http:// or https://.";
        return;
    }
    document.getElementById("message").innerHTML = "Success - reloading.";
    chrome.runtime.sendMessage({targetURL: targetURL, reloadTime: reloadTime, type: "reload"});
    window.close();
}