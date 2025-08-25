function collectPageColors(): string[] {
  const colors = new Set<string>();

  // Get every single element on the page
  const elements = document.querySelectorAll('*');

  elements.forEach(element => {
    // Get the computed styles of the element
    const styles = window.getComputedStyle(element);

    // List of CSS properties that can contain colors
    const colorProperties = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor'
    ];

    colorProperties.forEach(prop => {
      const color = styles.getPropertyValue(prop);
      // Check if a color is found and it's not transparent or otherwise invisible
      if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
        colors.add(color);
      }
    });
  });

  // Convert the Set of unique colors to an array and return it
  return Array.from(colors);
}

// Listen for a message from our popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  // Check if the message is the one we're looking for
  if (request.type === 'GET_PAGE_COLORS') {
    const pageColors = collectPageColors();
    // Send the collected colors back as a response
    sendResponse({ colors: pageColors });
  }
  // This is important to allow asynchronous responses
  return true;
});