import { useState, useEffect } from "react";
import Button from "../components/Button/Button";
import Header from "../components/Header/Header";
import "./CSSInspector.css";

type Props = {
  onBack: () => void;
  isActive: boolean;
};

export default function CSSInspectorView({ onBack, isActive }: Props) {
  const [isInspecting, setIsInspecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isActive && !isInspecting) {
      handleStartInspecting();
    }
  }, [isActive]);

  const handleStartInspecting = () => {
    setIsInspecting(true);
    setError(null);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      // Send message to content script to start CSS inspection mode
      chrome.tabs.sendMessage(tabId, { type: "START_CSS_INSPECTION" }, () => {
        if (chrome.runtime.lastError) {
          setError(
            "Could not connect to the page. Please reload and try again."
          );
          setIsInspecting(false);
        }
      });
    });
  };

  const handleStopInspecting = () => {
    setIsInspecting(false);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.tabs.sendMessage(tabId, { type: "STOP_CSS_INSPECTION" });
    });
  };

  const handleBackToMenu = () => {
    handleStopInspecting();
    onBack();
  };

  return (
    <div className="css-inspector-view">
      <div className="inspector-header">
        <Button onClick={handleBackToMenu} variant="secondary">
          ← Back to Menu
        </Button>
        <Header title="CSS Inspector" />
        <div className="subtitle">🕵️ Inspect and modify CSS properties</div>
      </div>

      <div className="inspector-controls">
        {!isInspecting ? (
          <Button onClick={handleStartInspecting} variant="primary">
            🔍 Start CSS Inspection
          </Button>
        ) : (
          <Button onClick={handleStopInspecting} variant="secondary">
            🛑 Stop Inspection
          </Button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {isInspecting && (
        <div className="inspection-status">
          <div className="status-indicator">
            <span className="pulse-dot"></span>
            <div style={{ textAlign: "center" }}>
              <div>CSS Inspector is active!</div>
              <div
                style={{
                  fontSize: "0.9rem",
                  marginTop: "0.5rem",
                  opacity: 0.8,
                }}
              >
                • Hover over elements to see their CSS properties
                <br />
                • A panel will appear on the page with details
                <br />
                • Click elements to keep the panel focused
                <br />• Close this popup to continue inspecting
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          background:
            "linear-gradient(135deg, var(--loki-accent), var(--loki-forest))",
          border: "2px solid var(--loki-gold)",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <h3 style={{ color: "var(--loki-gold)", marginBottom: "1rem" }}>
          How to Use
        </h3>
        <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
          1. Click "Start CSS Inspection" above
          <br />
          2. A floating panel will appear on the page
          <br />
          3. Hover over any element to see its CSS properties
          <br />
          4. The panel shows both inline and computed styles
          <br />
          5. Click "Stop Inspection" when done
        </div>
      </div>
    </div>
  );
}
