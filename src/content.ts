import ColorThief from "colorthief";

const colorThief = new ColorThief();

let isTextEditModeEnabled = false;
let activeEditor: HTMLElement | null = null;

// CSS Inspector variables
let isCSSInspecting = false;
let highlightOverlay: HTMLElement | null = null;
let cssPanel: HTMLElement | null = null;
// Removed unused variable

// Text Editor Functions (unchanged)
function createEditorUI(targetElement: HTMLElement) {
  if (activeEditor) {
    activeEditor.remove();
  }

  const editorContainer = document.createElement("div");
  editorContainer.className = "ai-toolkit-editor-container";

  const textarea = document.createElement("textarea");
  textarea.className = "ai-toolkit-editor-textarea";
  textarea.value = targetElement.innerText;
  setTimeout(() => textarea.focus(), 0);

  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "ai-toolkit-editor-buttons";

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.className = "ai-toolkit-editor-button save";
  saveButton.onclick = () => {
    targetElement.innerText = textarea.value;
    editorContainer.remove();
    activeEditor = null;
  };

  const aiButton = document.createElement("button");
  aiButton.textContent = "✨ Get Suggestions";
  aiButton.className = "ai-toolkit-editor-button ai";
  aiButton.onclick = () => {
    alert("We'll connect the AI in the next step!");
  };

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;";
  closeButton.className = "ai-toolkit-editor-button close";
  closeButton.onclick = () => {
    editorContainer.remove();
    activeEditor = null;
  };

  buttonWrapper.append(saveButton, aiButton);
  editorContainer.append(closeButton, textarea, buttonWrapper);

  const rect = targetElement.getBoundingClientRect();
  editorContainer.style.top = `${window.scrollY + rect.bottom + 8}px`;
  editorContainer.style.left = `${window.scrollX + rect.left}px`;
  editorContainer.style.width = `${rect.width}px`;

  document.body.appendChild(editorContainer);
  activeEditor = editorContainer;
}

function handlePageClick(event: MouseEvent) {
  if (!isTextEditModeEnabled) return;

  const target = event.target as HTMLElement;

  if (target.closest(".ai-toolkit-editor-container")) {
    return;
  }

  if (target.classList.contains("ai-toolkit-editable")) {
    event.preventDefault();
    event.stopPropagation();
    createEditorUI(target);
  } else {
    if (activeEditor) {
      activeEditor.remove();
      activeEditor = null;
    }
  }
}

function enableTextEditMode() {
  if (isTextEditModeEnabled) return;
  isTextEditModeEnabled = true;

  const textElements = document.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, p, a, span, li, button, label"
  );
  textElements.forEach((el) => el.classList.add("ai-toolkit-editable"));

  document.addEventListener("click", handlePageClick, { capture: true });

  const style = document.createElement("style");
  style.id = "ai-toolkit-styles";
  style.innerHTML = `
    .ai-toolkit-editable {
      outline: 2px dashed #007bff !important;
      outline-offset: 2px;
      cursor: pointer !important;
      transition: outline 0.2s;
    }
    .ai-toolkit-editable:hover {
      outline: 2px solid #0056b3 !important;
      background-color: rgba(0, 123, 255, 0.1) !important;
    }
    .ai-toolkit-editor-container {
      position: absolute;
      z-index: 999999;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 12px;
      min-width: 250px;
      border: 1px solid #ddd;
    }
    .ai-toolkit-editor-textarea {
      width: 100%;
      min-height: 80px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      font-size: 14px;
      font-family: inherit;
      box-sizing: border-box;
      margin-bottom: 8px;
    }
    .ai-toolkit-editor-buttons {
      display: flex;
      gap: 8px;
    }
    .ai-toolkit-editor-button {
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid transparent;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .ai-toolkit-editor-button.save {
      background-color: #007bff;
      color: white;
      border-color: #007bff;
    }
    .ai-toolkit-editor-button.ai {
      background-color: #f0f0f0;
      color: #333;
      border-color: #ccc;
    }
    .ai-toolkit-editor-button.close {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 20px;
      line-height: 1;
      padding: 0 4px;
      color: #888;
    }
  `;
  document.head.appendChild(style);
}

// CSS Inspector Functions
function createHighlightOverlay(): HTMLElement {
  const overlay = document.createElement("div");
  overlay.id = "loki-css-inspector-overlay";
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999998;
    border: 2px solid #d4af37;
    background-color: rgba(212, 175, 55, 0.1);
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    display: none;
    transition: all 0.1s ease;
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function createCSSPanel(): HTMLElement {
  const panel = document.createElement("div");
  panel.id = "loki-css-inspector-panel";
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    max-height: 70vh;
    background: linear-gradient(135deg, #1a3c34, #2d5a47);
    border: 2px solid #d4af37;
    border-radius: 12px;
    color: #f5f5dc;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    z-index: 999999;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: none;
    backdrop-filter: blur(10px);
  `;

  // Add CSS styles for the panel
  if (!document.getElementById("loki-inspector-styles")) {
    const style = document.createElement("style");
    style.id = "loki-inspector-styles";
    style.innerHTML = `
      .loki-panel-header {
        background: linear-gradient(135deg, #d4af37, #b8941f);
        color: #1a3c34;
        padding: 12px 16px;
        font-weight: bold;
        font-size: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .loki-panel-close {
        background: none;
        border: none;
        color: #1a3c34;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      }
      
      .loki-panel-close:hover {
        background: rgba(26, 60, 52, 0.1);
      }
      
      .loki-panel-content {
        padding: 16px;
        overflow-y: auto;
        max-height: calc(70vh - 60px);
      }
      
      .loki-element-info {
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #d4af37;
      }
      
      .loki-element-tag {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: #d4af37;
        font-weight: bold;
        margin-bottom: 8px;
      }
      
      .loki-section {
        margin-bottom: 24px;
      }
      
      .loki-section-title {
        color: #d4af37;
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 12px;
        padding-bottom: 4px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.3);
      }
      
      .loki-property {
        display: flex;
        margin-bottom: 8px;
        padding: 8px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        border-left: 3px solid #d4af37;
        transition: background 0.2s;
      }
      
      .loki-property:hover {
        background: rgba(0, 0, 0, 0.4);
      }
      
      .loki-property-name {
        font-family: 'Courier New', monospace;
        font-weight: bold;
        color: #d4af37;
        min-width: 120px;
        font-size: 12px;
      }
      
      .loki-property-value {
        font-family: 'Courier New', monospace;
        color: #f5f5dc;
        flex: 1;
        font-size: 12px;
        word-break: break-all;
      }
      
      .loki-property-important {
        color: #ff6b47;
        font-weight: bold;
        margin-left: 8px;
      }
      
      .loki-inline-style {
        border-left-color: #ff6b47;
      }
      
      .loki-no-styles {
        color: #888;
        font-style: italic;
        text-align: center;
        padding: 20px;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(panel);
  return panel;
}

function removeHighlightOverlay() {
  const existing = document.getElementById("loki-css-inspector-overlay");
  if (existing) {
    existing.remove();
  }
  highlightOverlay = null;
}

function removeCSSPanel() {
  const existing = document.getElementById("loki-css-inspector-panel");
  if (existing) {
    existing.remove();
  }
  cssPanel = null;
}

function getElementInfo(element: HTMLElement) {
  const computedStyles = window.getComputedStyle(element);
  const inlineStyles = element.style;

  // Get computed styles (filtered to important ones)
  const importantComputedProps = [
    "display",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "width",
    "height",
    "margin",
    "padding",
    "border",
    "background-color",
    "color",
    "font-size",
    "font-family",
    "text-align",
    "line-height",
    "opacity",
    "z-index",
    "flex-direction",
    "justify-content",
    "align-items",
    "grid-template-columns",
    "grid-template-rows",
    "border-radius",
  ];

  const computedStylesArray = importantComputedProps
    .map((prop) => ({
      property: prop,
      value: computedStyles.getPropertyValue(prop),
      important: false,
    }))
    .filter(
      (style) =>
        style.value &&
        style.value !== "normal" &&
        style.value !== "auto" &&
        style.value.trim() !== ""
    );

  // Get inline styles
  const inlineStylesArray = [];
  if (inlineStyles.length > 0) {
    for (let i = 0; i < inlineStyles.length; i++) {
      const property = inlineStyles[i];
      const value = inlineStyles.getPropertyValue(property);
      const priority = inlineStyles.getPropertyPriority(property);
      inlineStylesArray.push({
        property,
        value,
        important: priority === "important",
      });
    }
  }

  return {
    tagName: element.tagName.toLowerCase(),
    className: element.className || "",
    id: element.id || "",
    computedStyles: computedStylesArray,
    inlineStyles: inlineStylesArray,
  };
}

function updateHighlight(element: HTMLElement) {
  if (!highlightOverlay || !element) return;

  const rect = element.getBoundingClientRect();

  highlightOverlay.style.display = "block";
  highlightOverlay.style.left = `${rect.left}px`;
  highlightOverlay.style.top = `${rect.top}px`;
  highlightOverlay.style.width = `${rect.width}px`;
  highlightOverlay.style.height = `${rect.height}px`;
}

interface StyleProperty {
  property: string;
  value: string;
  important: boolean;
}

interface ElementInfo {
  tagName: string;
  className: string;
  id: string;
  computedStyles: StyleProperty[];
  inlineStyles: StyleProperty[];
}

function updateCSSPanel(elementInfo: ElementInfo) {
  if (!cssPanel) return;

  let elementSelector = elementInfo.tagName;
  if (elementInfo.id) elementSelector += `#${elementInfo.id}`;
  if (elementInfo.className) {
    const classes = elementInfo.className.trim().split(/\s+/).join(".");
    if (classes) elementSelector += `.${classes}`;
  }

  interface StyleProperty {
    property: string;
    value: string;
    important: boolean;
  }

  interface ElementInfo {
    tagName: string;
    className: string;
    id: string;
    computedStyles: StyleProperty[];
    inlineStyles: StyleProperty[];
  }

  const elementInfoTyped: ElementInfo = elementInfo;

  const content: string = `
    <div class="loki-panel-header">
      🕵️ CSS Inspector
      <button class="loki-panel-close" onclick="this.closest('#loki-css-inspector-panel').style.display='none'">×</button>
    </div>
    <div class="loki-panel-content">
      <div class="loki-element-info">
        <div class="loki-element-tag">${elementSelector}</div>
      </div>
      
      ${
        elementInfoTyped.inlineStyles.length > 0
          ? `
        <div class="loki-section">
          <div class="loki-section-title">🎨 Inline Styles</div>
          ${elementInfoTyped.inlineStyles
            .map(
              (style: StyleProperty) => `
            <div class="loki-property loki-inline-style">
              <div class="loki-property-name">${style.property}:</div>
              <div class="loki-property-value">
                ${style.value}
                ${
                  style.important
                    ? '<span class="loki-property-important">!important</span>'
                    : ""
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      
      <div class="loki-section">
        <div class="loki-section-title">🎯 Computed Styles</div>
        ${
          elementInfoTyped.computedStyles.length > 0
            ? elementInfoTyped.computedStyles
                .slice(0, 15)
                .map(
                  (style: StyleProperty) => `
            <div class="loki-property">
              <div class="loki-property-name">${style.property}:</div>
              <div class="loki-property-value">${style.value}</div>
            </div>
          `
                )
                .join("")
            : '<div class="loki-no-styles">No significant computed styles</div>'
        }
      </div>
    </div>
  `;

  cssPanel.innerHTML = content;
  cssPanel.style.display = "block";
}

function handleMouseOver(event: MouseEvent) {
  if (!isCSSInspecting) return;

  const target = event.target as HTMLElement;
  if (target.closest("#loki-css-inspector-overlay, #loki-css-inspector-panel"))
    return;

  updateHighlight(target);

  // Update CSS panel with current element info
  const elementInfo = getElementInfo(target);
  updateCSSPanel(elementInfo);
}

function handleMouseOut() {
  if (!isCSSInspecting || !highlightOverlay) return;

  highlightOverlay.style.display = "none";
}

function handleClick(event: MouseEvent) {
  if (!isCSSInspecting) return;

  const target = event.target as HTMLElement;
  if (target.closest("#loki-css-inspector-overlay, #loki-css-inspector-panel"))
    return;

  // Prevent the click from doing anything else
  event.preventDefault();
  event.stopPropagation();
}

function startCSSInspection() {
  if (isCSSInspecting) return;

  isCSSInspecting = true;
  highlightOverlay = createHighlightOverlay();
  cssPanel = createCSSPanel();

  // Add event listeners
  document.addEventListener("mouseover", handleMouseOver, true);
  document.addEventListener("mouseout", handleMouseOut, true);
  document.addEventListener("click", handleClick, true);

  // Add cursor style
  document.body.style.cursor = "crosshair";

  // Show initial message in panel
  if (cssPanel) {
    cssPanel.innerHTML = `
      <div class="loki-panel-header">
        🕵️ CSS Inspector
        <button class="loki-panel-close" onclick="this.closest('#loki-css-inspector-panel').style.display='none'">×</button>
      </div>
      <div class="loki-panel-content">
        <div style="text-align: center; padding: 40px 20px; color: #d4af37;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
          <div style="font-size: 16px; margin-bottom: 8px;">Hover over elements to inspect</div>
          <div style="font-size: 14px; opacity: 0.8;">CSS properties will appear here</div>
        </div>
      </div>
    `;
    cssPanel.style.display = "block";
  }
}

function stopCSSInspection() {
  if (!isCSSInspecting) return;

  isCSSInspecting = false;

  // Remove event listeners
  document.removeEventListener("mouseover", handleMouseOver, true);
  document.removeEventListener("mouseout", handleMouseOut, true);
  document.removeEventListener("click", handleClick, true);

  // Remove highlight overlay and panel
  removeHighlightOverlay();
  removeCSSPanel();

  // Reset cursor
  document.body.style.cursor = "";
}

// Color Collection Functions (unchanged)
async function collectPageColors(): Promise<string[]> {
  const colors = new Set<string>();

  document.querySelectorAll("*").forEach((element) => {
    const styles = window.getComputedStyle(element);
    const colorProperties = ["color", "backgroundColor", "borderColor"];
    colorProperties.forEach((prop) => {
      const color = styles.getPropertyValue(prop);
      if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
        colors.add(color);
      }
    });
  });

  const imageElements = Array.from(document.querySelectorAll("img"));
  const imagePromises = imageElements.map((img) => {
    return new Promise<void>((resolve) => {
      const image = new Image();
      image.crossOrigin = "Anonymous";

      image.onload = () => {
        try {
          const dominantColors = colorThief.getPalette(image, 5);
          if (dominantColors) {
            dominantColors.forEach((rgb) => {
              colors.add(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
            });
          }
        } catch (e) {
          console.error(e);
        }
        resolve();
      };

      image.onerror = () => {
        resolve();
      };

      image.src = img.src;
    });
  });

  await Promise.all(imagePromises);
  return Array.from(colors);
}

// Unified Message Listener
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "ENABLE_TEXT_EDIT_MODE") {
    enableTextEditMode();
    sendResponse({ status: "Text edit mode enabled" });
  }

  if (request.type === "GET_PAGE_COLORS") {
    collectPageColors().then((pageColors) => {
      sendResponse({ colors: pageColors });
    });
    return true; // Keep message channel open for async response
  }

  if (request.type === "START_CSS_INSPECTION") {
    startCSSInspection();
    sendResponse({ status: "CSS inspection started" });
  }

  if (request.type === "STOP_CSS_INSPECTION") {
    stopCSSInspection();
    sendResponse({ status: "CSS inspection stopped" });
  }

  return true;
});
