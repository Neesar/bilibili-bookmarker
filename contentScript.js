(() => {
  let biliLeftControls, biliPlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      biliPlayer.currentTime = value;
    } else if (type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter(
        (b) => b.time != value
      );
      chrome.runtime.sendMessage({
        action: "updateIcon",
        value: currentVideoBookmarks.length,
      });

      chrome.storage.local.set({
        [currentVideo]: JSON.stringify(currentVideoBookmarks),
      });
      response(currentVideoBookmarks);
    }
  });

  const fetchBookmarks = () => {
    return new Promise((resolve) =>
      chrome.storage.local.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      })
    );
  };

  const newVideoLoaded = async () => {
    if (!currentVideo) {
      const url = new URL(window.location.href);

      const path = url.pathname;

      const bv = path.split("/")[2];

      const p = url.searchParams.get("p") ? url.searchParams.get("p") : 0;

      currentVideo = [bv, p].join("+");
    }

    currentVideoBookmarks = await fetchBookmarks();

    chrome.runtime.sendMessage({
      action: "updateIcon",
      value: currentVideoBookmarks.length,
    });

    //video bookmark
    const bookmarkBtnExists = document.getElementsByClassName("blp-button")[0];

    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("div");
      bookmarkBtn.className = "bpx-player-ctrl-btn " + "blp-button";

      const bookmarkBtnIcon = document.createElement("div");
      bookmarkBtnIcon.className = "bpx-player-ctrl-btn-icon";

      const bookmarkBtnSVG = document.createElement("span");
      bookmarkBtnSVG.className = "bpx-common-svq-icon ";

      bookmarkBtnSVG.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="skyblue"><path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clip-rule="evenodd" /> </svg>';

      bookmarkBtn.appendChild(bookmarkBtnIcon);
      bookmarkBtnIcon.append(bookmarkBtnSVG);

      biliLeftControls = document.getElementsByClassName(
        "bpx-player-control-bottom-right"
      )[0];
      biliPlayer = document.getElementsByTagName("video")[0];

      biliLeftControls.append(bookmarkBtn);
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  const addNewBookmarkEventHandler = async () => {
    const currentTime = biliPlayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
    };

    currentVideoBookmarks = [...currentVideoBookmarks, newBookmark].sort(
      (a, b) => a.time - b.time
    );

    chrome.runtime.sendMessage({
      action: "updateIcon",
      value: currentVideoBookmarks.length,
    });

    chrome.storage.local.set({
      [currentVideo]: JSON.stringify(currentVideoBookmarks),
    });
  };

  newVideoLoaded();
})();

const getTime = (t) => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().slice(11, -5);
};
