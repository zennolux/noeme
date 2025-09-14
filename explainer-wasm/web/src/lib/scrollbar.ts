function hasVerticalScrollbar() {
  const body = document.body;
  const html = document.documentElement;

  return (
    Math.max(
      body.scrollHeight,
      html.scrollHeight,
      body.offsetHeight,
      html.offsetHeight,
      body.clientHeight,
      html.clientHeight
    ) > window.innerHeight
  );
}

export function showVerticalScrollbar() {
  if (!hasVerticalScrollbar()) {
    return;
  }
  document.body.style.overflowY = "scroll";
}

export function hideVerticalScrollbar() {
  document.body.style.overflowY = "hidden";
}
