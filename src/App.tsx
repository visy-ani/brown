import { useState } from "react";
import "./App.css";

type ContentResponse =
  | { error: string }
  | { colors: string[] }
  | Record<string, never>;

function App() {
  const [view, setView] = useState<"menu" | "color-extractor">("menu");

  const [colors, setColors] = useState<string[]>([]);
  const [isLoadingColors, setIsLoadingColors] = useState(false);
  const [colorError, setColorError] = useState<string | null>(null);

  const executeScriptAndSendMessage = (
    tabId: number,
    message: object,
    callback: (response: ContentResponse) => void
  ) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ["content.js"],
      },
      () => {
        if (chrome.runtime.lastError) {
          callback({
            error: "Could not inject script. Please reload the page.",
          });
          return;
        }
        chrome.tabs.sendMessage(tabId, message, callback);
      }
    );
  };

  const handleActivateColorExtractor = () => {
    setIsLoadingColors(true);
    setColorError(null);
    setColors([]);
    setView("color-extractor");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      executeScriptAndSendMessage(
        tabId,
        { type: "GET_PAGE_COLORS" },
        (response) => {
          if ("error" in response) {
            setColorError(response.error || "Could not connect to the page.");
          } else if ("colors" in response && response.colors.length > 0) {
            setColors(response.colors);
          } else {
            setColorError("No colors found on this page.");
          }
          setIsLoadingColors(false);
        }
      );
    });
  };

  const handleActivateTextEditor = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      executeScriptAndSendMessage(
        tabId,
        { type: "ENABLE_TEXT_EDIT_MODE" },
        () => {
          if (chrome.runtime.lastError) {
            alert(
              "Could not inject script. Please reload the page and try again."
            );
          }
          window.close();
        }
      );
    });
  };

  const renderView = () => {
    if (view === "color-extractor") {
      return (
        <div>
          <button onClick={() => setView("menu")} className="back-button">
            ← Back to Menu
          </button>
          <h1>Page Color Palette</h1>
          {isLoadingColors ? (
            <p>Scanning page...</p>
          ) : colorError ? (
            <p>{colorError}</p>
          ) : (
            <div className="color-grid">
              {colors.map((color, index) => (
                <div key={index} className="color-item">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: color }}
                    title={color}
                  ></div>
                  <span className="color-code">{color}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <h1>AI Frontend Toolkit</h1>
        <div className="tool-menu">
          <button
            className="tool-button"
            onClick={handleActivateColorExtractor}
          >
            Color Palette Extractor
          </button>
          <button className="tool-button" onClick={handleActivateTextEditor}>
            AI Content Editor
          </button>
        </div>
      </div>
    );
  };

  return <div className="app-container">{renderView()}</div>;
}

export default App;
