(function () {
  const SELECTORS = {
    linkContainer: "#fixVersions-field",
    infoMessage: ".my-message-copied-info",
  };

  const MAX_ATTEMPTS = 5;

  let attempts = 0;

  const linkStyles = async () => {
    const myCss = GM_getResourceText("styles");
    const styleTag = document.createElement("style");
    styleTag.textContent = myCss;

    document.body.prepend(styleTag);
  };

  const createClipBoardItem = ({ href, textContent }) => {
    const clipboardItem = new ClipboardItem({
      "text/plain": new Blob([textContent], { type: "text/plain" }),
      "text/html": new Blob([`<a href="${href}">${textContent}</a>`], {
        type: "text/html",
      }),
    });

    return clipboardItem;
  };

  const generateMessage = () => {
    const divEl = document.createElement("div");
    divEl.className = "my-message-copied-info";
    divEl.textContent = "Fix version link copied to clipboard";
    document.body.appendChild(divEl);
  };

  const showMessage = () => {
    const info = document.querySelector(SELECTORS.infoMessage);

    info.classList.remove("active");
    void info.offsetWidth; // force reflow
    info.classList.add("active");
  };

  const copyLinkIntoClipboard = async (link) => {
    const clipboardItem = createClipBoardItem(link);

    await navigator.clipboard.write([clipboardItem]);

    showMessage();
  };

  const handleContextMenu = (e) => {
    const { clientX, clientY } = e;
    const linkEl = document.elementFromPoint(clientX, clientY);

    if (!linkEl.search) return;

    e.preventDefault();
    copyLinkIntoClipboard(linkEl);
  };

  const init = () => {
    const linkContainer = document.querySelector(SELECTORS.linkContainer);
    if (linkContainer) {
      linkStyles();
      generateMessage();

      linkContainer.addEventListener("contextmenu", handleContextMenu);
    } else if (attempts === MAX_ATTEMPTS) {
      return console.error("Brak kontenera fix version.");
    } else {
      attempts++;
      setTimeout(init, 1000);
    }
  };

  init();
})();
