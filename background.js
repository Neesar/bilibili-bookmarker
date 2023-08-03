let preVideoId;
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("bilibili.com/video")) {
    const url = new URL(tab.url);
    const path = url.pathname;

    const bv = path.split("/")[2];

    const p = url.searchParams.get("p") ? url.searchParams.get("p") : 0;

    const videoId = [bv, p].join("+");

    if (preVideoId && preVideoId === videoId) return;

    preVideoId = videoId;

    chrome.tabs.sendMessage(
      tabId,
      {
        type: "NEW",
        videoId,
      },
      function (response) {
        if (chrome.runtime.lastError) {
          // 发生错误，可以在这里处理错误信息
          return;
        }
      }
    );
  }
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action === "updateIcon") {
    if (msg.value) {
      console.log("changing to skyblue");
      chrome.action.setIcon({ path: "/assets/bookmarks-icon.png" });
    } else {
      console.log("changing to gray");
      chrome.action.setIcon({ path: "/assets/bookmarks-icon-gray.png" });
    }
  }
});
