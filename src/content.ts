import ColorThief from "colorthief";

const colorThief = new ColorThief();

// --- Logic for Text Editor Mode ---

let isTextEditModeEnabled = false;

function enableTextEditMode() {
  if (isTextEditModeEnabled) return;
  isTextEditModeEnabled = true;
  console.log("[AI Toolkit] Enabling Text Edit Mode.");

  // Find all potential text elements
  const textElements = document.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, p, a, span, li, button, label"
  );

  // Add a special class to highlight them
  textElements.forEach((el) => {
    el.classList.add("ai-toolkit-editable");
  });

  // Add a style tag to the document for the highlighting effect
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
  `;
  document.head.appendChild(style);
}

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

  return true; // Keeps the sendResponse channel open for async
});
