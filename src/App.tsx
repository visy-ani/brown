import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id;
      if (activeTabId) {
        chrome.tabs.sendMessage(
          activeTabId,
          { type: 'GET_PAGE_COLORS' },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
              setLoading(false);
            } else if (response && response.colors) {
              setColors(response.colors);
              setLoading(false);
            }
          }
        );
      }
    });
  }, []); 

  return (
    <div className="app-container">
      <h1>Page Color Palette</h1>
      {loading ? (
        <p>Scanning page...</p>
      ) : (
        <div className="color-grid">
          {colors.length > 0 ? (
            colors.map((color, index) => (
              <div key={index} className="color-item">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  title={color}
                ></div>
                <span className="color-code">{color}</span>
              </div>
            ))
          ) : (
            <p>Could not find any colors on this page.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;