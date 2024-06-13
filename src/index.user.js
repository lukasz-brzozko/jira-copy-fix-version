// ==UserScript==
// @name         Jira Copy Fix Version
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Allows to copy fix version link
// @author       Łukasz Brzózko
// @match        https://jira.nd0.pl/*
// @exclude      https://jira.nd0.pl/plugins/servlet/*
// @icon         https://jira.nd0.pl/s/a3v501/940003/1dlckms/_/images/fav-jsw.png
// @resource styles    https://raw.githubusercontent.com/lukasz-brzozko/jira-copy-fix-version/main/dist/styles.css
// @updateURL    https://raw.githubusercontent.com/lukasz-brzozko/jira-copy-fix-version/main/dist/index.meta.js
// @downloadURL  https://raw.githubusercontent.com/lukasz-brzozko/jira-copy-fix-version/main/dist/index.user.js
// @grant        GM_getResourceText
// ==/UserScript==

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

  const getFilterUrl = (fixVersion) => {
    const FrontPortalRegex = /^FrontPortal-/;
    const filterUrl = new URL("https://jira.nd0.pl/issues/");

    const isFrontPortal = FrontPortalRegex.test(fixVersion);
    const fixVersionFilter = `fixVersion in (${fixVersion})`;
    const commentFilter = `(comment ~ "${fixVersion}")`;
    const orderFilter = `ORDER BY project ASC, type ASC`;

    const filter = isFrontPortal
      ? `(${fixVersionFilter} OR ${commentFilter}) ${orderFilter}`
      : `(${fixVersionFilter}) ${orderFilter}`;
    filterUrl.searchParams.set("jql", filter);

    return filterUrl.toString();
  };

  const createClipBoardItem = ({ textContent }, textOnly) => {
    const filterUrl = getFilterUrl(textContent);

    const clipboardItem = new ClipboardItem({
      "text/plain": new Blob([textContent], { type: "text/plain" }),
      ...(!textOnly && {
        "text/html": new Blob([`<a href="${filterUrl}">${textContent}</a>`], {
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
    copyLinkIntoClipboard(target);
  };

  const init = () => {
    linkStyles();
    generateMessage();

    document.addEventListener("contextmenu", handleContextMenu);
  };

  init();
})();
