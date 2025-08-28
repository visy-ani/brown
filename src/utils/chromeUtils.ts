type ContentResponse = 
  | { error: string }
  | { colors: string[] }
  | Record<string, never>;

export const executeScriptAndSendMessage = (
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
