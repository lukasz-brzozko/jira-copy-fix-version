(function () {
  const SELECTORS = {
    linkContainer: "#fixVersions-field",
    versionTableContainer: "#versions-table",
    infoMessage: ".my-message-copied-info",
  };

  const linkStyles = async () => {
    const myCss = GM_getResourceText("styles");
    const styleTag = document.createElement("style");
    styleTag.textContent = myCss;

    document.body.prepend(styleTag);
  };

  const createClipBoardItem = ({ href, textContent }, textOnly) => {
    const clipboardItem = new ClipboardItem({
      "text/plain": new Blob([textContent], { type: "text/plain" }),
      ...(!textOnly && {
        "text/html": new Blob([`<a href="${href}">${textContent}</a>`], {
          type: "text/html",
        }),
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

  const copyLinkIntoClipboard = async (link, textOnly = false) => {
    const clipboardItem = createClipBoardItem(link, textOnly);

    await navigator.clipboard.write([clipboardItem]);

    showMessage();
  };

  const handleContextMenu = (e) => {
    const { target } = e;
    const isStandardFixVersion = target.closest(SELECTORS.linkContainer);
    const isTableFixVersion = target.closest(SELECTORS.versionTableContainer);
    const isFixVersion = isStandardFixVersion || isTableFixVersion;
    const shouldCopyLink = target.nodeName === "A" && isFixVersion;

    if (!shouldCopyLink) return;

    e.preventDefault();
    copyLinkIntoClipboard(target, isTableFixVersion);
  };

  const init = () => {
    linkStyles();
    generateMessage();

    document.addEventListener("contextmenu", handleContextMenu);
  };

  init();
})();
