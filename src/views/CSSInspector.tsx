import { useState, useEffect } from "react";
import Button from "../components/Button/Button";
import Header from "../components/Header/Header";
import "./CSSInspector.css";

type Props = {
  onBack: () => void;
  isActive: boolean;
};

type CSSProperty = {
  property: string;
  value: string;
  important: boolean;
};

type ElementInfo = {
  tagName: string;
  className: string;
  id: string;
  computedStyles: CSSProperty[];
  inlineStyles: CSSProperty[];
};

export default function CSSInspectorView({ onBack, isActive }: Props) {
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(
    null
  );
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
      chrome.tabs.sendMessage(
        tabId,
        { type: "START_CSS_INSPECTION" },
        (_) => {
          if (chrome.runtime.lastError) {
            setError(
              "Could not connect to the page. Please reload and try again."
            );
            setIsInspecting(false);
          }
        }
      );
    });

    // Listen for messages from content script
    const messageListener = (message: any) => {
      if (message.type === "ELEMENT_SELECTED") {
        setSelectedElement(message.elementInfo);
      } else if (message.type === "INSPECTION_STOPPED") {
        setIsInspecting(false);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener when component unmounts or inspection stops
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
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

  const handleUpdateCSS = (
    property: string,
    value: string,
    isInline: boolean
  ) => {
    if (!selectedElement) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.tabs.sendMessage(tabId, {
        type: "UPDATE_CSS_PROPERTY",
        property,
        value,
        isInline,
      });
    });
  };

  return (
    <div className="css-inspector-view">
      <div className="inspector-header">
        <Button
          onClick={handleBackToMenu}
          variant="secondary"
        >
          ← Back to Menu
        </Button>
        <Header title="CSS Inspector" />
        <div className="subtitle">🕵️ Inspect and modify CSS properties</div>
      </div>

      <div className="inspector-controls">
        {!isInspecting ? (
          <Button
            onClick={handleStartInspecting}
            variant="primary"
          >
            🔍 Start CSS Inspection
          </Button>
        ) : (
          <Button
            onClick={handleStopInspecting}
            variant="secondary"
          >
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
            Hover over elements on the page to inspect them
          </div>
        </div>
      )}

      {selectedElement && (
        <div className="element-info">
          <div className="element-header">
            <h3>Selected Element</h3>
            <div className="element-selector">
              {selectedElement.tagName}
              {selectedElement.id && `#${selectedElement.id}`}
              {selectedElement.className &&
                `.${selectedElement.className.split(" ").join(".")}`}
            </div>
          </div>

          <div className="css-sections">
            {selectedElement.inlineStyles.length > 0 && (
              <div className="css-section">
                <h4>Inline Styles</h4>
                <div className="css-properties">
                  {selectedElement.inlineStyles.map((style, index) => (
                    <CSSPropertyEditor
                      key={`inline-${index}`}
                      property={style.property}
                      value={style.value}
                      important={style.important}
                      isInline={true}
                      onUpdate={handleUpdateCSS}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="css-section">
              <h4>Computed Styles</h4>
              <div className="css-properties">
                {selectedElement.computedStyles
                  .slice(0, 20)
                  .map((style, index) => (
                    <CSSPropertyEditor
                      key={`computed-${index}`}
                      property={style.property}
                      value={style.value}
                      important={style.important}
                      isInline={false}
                      onUpdate={handleUpdateCSS}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type CSSPropertyEditorProps = {
  property: string;
  value: string;
  important: boolean;
  isInline: boolean;
  onUpdate: (property: string, value: string, isInline: boolean) => void;
};

function CSSPropertyEditor({
  property,
  value: initialValue,
  important,
  isInline,
  onUpdate,
}: CSSPropertyEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate(property, value, isInline);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  return (
    <div className={`css-property ${isInline ? "inline" : "computed"}`}>
      <div className="property-name">{property}:</div>
      <div className="property-value">
        {isEditing ? (
          <div className="property-editor">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
            />
            <div className="editor-actions">
              <button onClick={handleSave} className="save-btn">
                ✓
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                ✗
              </button>
            </div>
          </div>
        ) : (
          <div className="property-display" onClick={() => setIsEditing(true)}>
            {value}
            {important && <span className="important">!important</span>}
            <span className="edit-hint">Click to edit</span>
          </div>
        )}
      </div>
    </div>
  );
}
