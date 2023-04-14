const htmlElement = document.documentElement;
const colorScheme = htmlElement.classList.contains("dark") ? "dark" : "light";
chrome.runtime.sendMessage({
  message: "getColorScheme",
  colorScheme,
});