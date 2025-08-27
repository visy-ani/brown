import ColorThief from "colorthief";

const colorThief = new ColorThief();

let isTextEditModeEnabled = false;
let activeEditor: HTMLElement | null = null;

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
    // If we click anywhere else on the page, close any open editor
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

  // Add a single click listener to the document to handle all clicks
  document.addEventListener("click", handlePageClick, { capture: true });

  const style = document.createElement("style");
  style.id = "ai-toolkit-styles";
  // ✨ Add new styles for the editor UI below ✨
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
      box-sizing: border-box; /* Important */
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

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "ENABLE_TEXT_EDIT_MODE") {
    enableTextEditMode();
    sendResponse({ status: "Text edit mode enabled" });
  }
  return true;
});

// --- Logic for Collecting Page Colors ---

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

// --- Unified Message Listener ---

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "ENABLE_TEXT_EDIT_MODE") {
    enableTextEditMode();
    sendResponse({ status: "Text edit mode enabled" });
  }

  if (request.type === "GET_PAGE_COLORS") {
    collectPageColors().then((pageColors) => {
      sendResponse({ colors: pageColors });
    });
  }

  return true;
});
