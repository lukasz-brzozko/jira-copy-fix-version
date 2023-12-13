(function () {
  const SELECTORS = {
    linkContainer: "#fixVersions-field",
    infoMessage: ".my-message-copied-info",
  };

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
    const clickedEl = document.elementFromPoint(clientX, clientY);

    if (clickedEl.nodeName !== "A") return;
    if (!clickedEl.closest(SELECTORS.linkContainer)) return;

    e.preventDefault();
    copyLinkIntoClipboard(clickedEl);
  };

  const init = () => {
    linkStyles();
    generateMessage();

    document.addEventListener("contextmenu", handleContextMenu);
  };

  init();
})();
