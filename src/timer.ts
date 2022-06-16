(async function () {
  //   if (document.readyState == "complete") {
  //     await updateBadge();
  //   } else {
  //     window.addEventListener("load", updateBadge);
  //   }

  await updateBadge();
  async function updateBadge() {
    await chrome.runtime.sendMessage({ type: "showcount" });
  }
})();
