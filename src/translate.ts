export function createGoogleTranslateUrl(
  text: string,
  sourceLanguage = "auto",
  targetLanguage = "en",
): string {
  const encodedText =
    encodeURIComponent(text.trim());

  return `https://translate.google.com/?sl=${sourceLanguage}&tl=${targetLanguage}&text=${encodedText}&op=translate`;
}

export function openGoogleTranslate(
  text: string,
  sourceLanguage = "auto",
  targetLanguage = "en",
): void {
  const url = createGoogleTranslateUrl(
    text,
    sourceLanguage,
    targetLanguage,
  );

  window.open(
    url,
    "_blank",
    "noopener,noreferrer",
  );
}