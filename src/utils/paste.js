// Rich text paste sanitizer: keeps safe tags and converts bullets into lists.
const allowedTags = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "P",
  "SPAN",
  "STRONG",
  "B",
  "EM",
  "I",
  "UL",
  "OL",
  "LI",
  "BR",
]);

const bulletMarkers = /^\s*([-*•])\s+(.+)/;

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const sanitizeNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.textContent);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const tag = node.nodeName.toUpperCase();
  if (!allowedTags.has(tag)) {
    // Flatten disallowed elements but keep their children content
    return Array.from(node.childNodes).map(sanitizeNode).join("");
  }

  const children = Array.from(node.childNodes).map(sanitizeNode).join("");
  return `<${tag.toLowerCase()}>${children}</${tag.toLowerCase()}>`;
};

const convertPlainTextBullets = (text) => {
  const lines = text.split(/\r?\n/);
  const items = [];
  const plain = [];

  lines.forEach((line) => {
    const match = bulletMarkers.exec(line);
    if (match) {
      items.push(match[2]);
    } else if (line.trim()) {
      plain.push(line.trim());
    }
  });

  const ul = items.length
    ? `<ul>${items.map((it) => `<li>${escapeHtml(it)}</li>`).join("")}</ul>`
    : "";

  const paras = plain.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  return paras + ul;
};

export const sanitizeRichText = (inputHtml, inputText) => {
  if (inputHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(inputHtml, "text/html");
    const body = doc.body;
    // Strip scripts/styles entirely
    body.querySelectorAll("script, style").forEach((el) => el.remove());
    return Array.from(body.childNodes).map(sanitizeNode).join("").trim();
  }
  if (inputText) {
    return convertPlainTextBullets(inputText);
  }
  return "";
};

export const handlePaste = (event, onChange) => {
  if (!event.clipboardData) return;
  event.preventDefault();
  const html = event.clipboardData.getData("text/html");
  const text = event.clipboardData.getData("text/plain");
  const clean = sanitizeRichText(html, text);
  onChange(clean);
};
