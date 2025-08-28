import { useState } from "react";
import "./App.css";

import MenuView from "./views/MenuView";
import ColorExtractorView from "./views/ColorExtractorView";

import { executeScriptAndSendMessage } from "./utils/chromeUtils";

type ContentResponse =
  | { error: string }
  | { colors: string[] }
  | Record<string, never>;

export default function App() {
  const [view, setView] = useState<"menu" | "color-extractor">("menu");

  const [colors, setColors] = useState<string[]>([]);
  const [isLoadingColors, setIsLoadingColors] = useState(false);
  const [colorError, setColorError] = useState<string | null>(null);

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
        (response: ContentResponse) => {
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

  return (
    <div className="app-container">
      {view === "menu" ? (
        <MenuView
          onColorExtractor={handleActivateColorExtractor}
          onTextEditor={handleActivateTextEditor}
        />
      ) : (
        <ColorExtractorView
          colors={colors}
          isLoading={isLoadingColors}
          error={colorError}
          onBack={() => setView("menu")}
        />
      )}
    </div>
  );
}
