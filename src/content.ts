import ColorThief from "colorthief";

const colorThief = new ColorThief();

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

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "GET_PAGE_COLORS") {
    collectPageColors().then((pageColors) => {
      sendResponse({ colors: pageColors });
    });
  }
  return true;
});
