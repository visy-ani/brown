import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || !tabs[0].id) {
        setErrorMessage("Cannot access this page.");
        setLoading(false);
        return;
      }
      const activeTabId = tabs[0].id;

      chrome.tabs.sendMessage(
        activeTabId,
        { type: "GET_PAGE_COLORS" },
        (response) => {
          if (chrome.runtime.lastError) {
            setErrorMessage(
              "Could not connect to the page. Try reloading the tab."
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
    <div className="app-container">
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
}

export default App;
