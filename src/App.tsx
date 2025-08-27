import { useState, useEffect } from "react";
import "./App.css";

// --- Re-usable Color Extractor Component ---
const ColorExtractorView = ({ onBack }: { onBack: () => void }) => {
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
      if (!activeTabId) {
        setErrorMessage("Cannot access this page.");
        setLoading(false);
        return;
      }
      chrome.tabs.sendMessage(
        activeTabId,
        { type: "GET_PAGE_COLORS" },
        (response) => {
          if (chrome.runtime.lastError) {
            setErrorMessage(
              "Could not connect to the page. Please reload the tab."
            );
            setLoading(false);
          } else if (
            response &&
            response.colors &&
            response.colors.length > 0
          ) {
            setColors(response.colors);
            setLoading(false);
          } else {
            setLoading(false);
            setErrorMessage("No colors found on this page.");
          }
        }
      );
    });
  }, []);

  return (
    <div>
      <button onClick={onBack} className="back-button">
        ← Back to Menu
      </button>
      <h1>Page Color Palette</h1>
      {loading ? (
        <p>Scanning page...</p>
      ) : errorMessage ? (
        <p>{errorMessage}</p>
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
};

// --- Main App Component ---
function App() {
  const [view, setView] = useState<"menu" | "color-extractor">("menu");

  const activateTextEditor = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
      if (activeTabId) {
        chrome.tabs.sendMessage(
          activeTabId,
          { type: "ENABLE_TEXT_EDIT_MODE" },
          () => {
            if (chrome.runtime.lastError) {
              alert(
                "Could not connect to the page. Please reload the page first."
              );
            }
            window.close();
          }
        );
      }
    });
  };

  const renderView = () => {
    if (view === "color-extractor") {
      return <ColorExtractorView onBack={() => setView("menu")} />;
    }

    // Default to menu view
    return (
      <div>
        <h1>AI Frontend Toolkit</h1>
        <div className="tool-menu">
          <button
            className="tool-button"
            onClick={() => setView("color-extractor")}
          >
            Color Palette Extractor
          </button>
          <button className="tool-button" onClick={activateTextEditor}>
            AI Content Editor
          </button>
        </div>
      </div>
    );
  };

  return <div className="app-container">{renderView()}</div>;
}

export default App;
