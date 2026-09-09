import {
  createGoogleTranslateUrl,
  getTranslationLanguage,
  isSupportedTranslationLanguage,
  type WordTranslation,
} from "./library";

/**
 * DRE2learn Translation Service
 *
 * This file handles:
 * - selected word translation data
 * - Google Translate fallback URL
 * - pronunciation using the browser
 * - supported target languages
 *
 * The actual Google Translate API should NOT be called directly
 * from the frontend with a secret API key.
 */

export interface TranslationRequest {
  word: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslationResponse {
  word: string;
  translation: string;
  targetLanguage: string;
  pronunciation: string;
  pronunciationLanguage: string;
  audioText: string;
  googleTranslateUrl: string;
}

/**
 * Default language used by DRE2learn.
 */
export const DEFAULT_SOURCE_LANGUAGE = "en";
export const DEFAULT_TARGET_LANGUAGE = "ar";

/**
 * Supported language codes.
 */
export const SUPPORTED_TRANSLATION_CODES = [
  "ar",
  "en",
  "zh-CN",
  "ru",
  "ku",
  "tr",
  "fr",
  "de",
  "es",
  "it",
  "ja",
  "ko",
] as const;

/**
 * Checks whether a translation language is supported.
 */
export function isTranslationLanguageSupported(
  languageCode: string,
): boolean {
  return isSupportedTranslationLanguage(languageCode);
}

/**
 * Returns the language name.
 */
export function getTranslationLanguageName(
  languageCode: string,
): string {
  return (
    getTranslationLanguage(languageCode)
      ?.nativeName ?? languageCode
  );
}

/**
 * Creates a translation request.
 */
export function createTranslationRequest(
  word: string,
  targetLanguage: string = DEFAULT_TARGET_LANGUAGE,
  sourceLanguage: string = DEFAULT_SOURCE_LANGUAGE,
): TranslationRequest {
  const normalizedWord = word.trim();

  const validTargetLanguage =
    isTranslationLanguageSupported(targetLanguage)
      ? targetLanguage
      : DEFAULT_TARGET_LANGUAGE;

  return {
    word: normalizedWord,
    targetLanguage: validTargetLanguage,
    sourceLanguage,
  };
}

/**
 * Creates the base translation result.
 *
 * Translation itself is intentionally left empty until a real
 * translation provider is connected.
 */
export function createTranslationResponse(
  request: TranslationRequest,
): TranslationResponse {
  const targetLanguage =
    isTranslationLanguageSupported(
      request.targetLanguage,
    )
      ? request.targetLanguage
      : DEFAULT_TARGET_LANGUAGE;

  return {
    word: request.word,
    translation: "",
    targetLanguage,
    pronunciation: "",
    pronunciationLanguage:
      request.sourceLanguage ??
      DEFAULT_SOURCE_LANGUAGE,
    audioText: request.word,
    googleTranslateUrl:
      createGoogleTranslateUrl(
        request.word,
        targetLanguage,
      ),
  };
}

/**
 * Converts the response into the common Library
 * WordTranslation structure.
 */
export function toWordTranslation(
  response: TranslationResponse,
): WordTranslation {
  return {
    word: response.word,
    translation: response.translation,
    targetLanguage: response.targetLanguage,
    pronunciation: response.pronunciation,
    pronunciationLanguage:
      response.pronunciationLanguage,
    audioText: response.audioText,
  };
}

/**
 * Creates an empty translation result for the UI.
 */
export function createEmptyTranslation(
  word: string,
  targetLanguage: string = DEFAULT_TARGET_LANGUAGE,
): WordTranslation {
  return toWordTranslation(
    createTranslationResponse(
      createTranslationRequest(
        word,
        targetLanguage,
      ),
    ),
  );
}

/**
 * Opens Google Translate as a fallback.
 *
 * This does NOT expose an API key.
 */
export function openGoogleTranslate(
  word: string,
  targetLanguage: string = DEFAULT_TARGET_LANGUAGE,
): void {
  const url = createGoogleTranslateUrl(
    word,
    targetLanguage,
  );

  window.open(
    url,
    "_blank",
    "noopener,noreferrer",
  );
}

/**
 * Browser pronunciation.
 *
 * No API key is required.
 *
 * Example:
 * speakWord("technology", "en");
 */
export function speakWord(
  word: string,
  language: string = DEFAULT_SOURCE_LANGUAGE,
): boolean {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return false;
  }

  const text = word.trim();

  if (!text) {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = normalizeSpeechLanguage(
    language,
  );

  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(
    utterance,
  );

  return true;
}

/**
 * Stops current pronunciation.
 */
export function stopSpeaking(): void {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return;
  }

  window.speechSynthesis.cancel();
}

/**
 * Converts Google Translate language codes into
 * browser speech language codes.
 */
export function normalizeSpeechLanguage(
  language: string,
): string {
  switch (language) {
    case "zh-CN":
      return "zh-CN";

    case "ar":
      return "ar";

    case "ru":
      return "ru-RU";

    case "ku":
      return "ku";

    case "tr":
      return "tr-TR";

    case "fr":
      return "fr-FR";

    case "de":
      return "de-DE";

    case "es":
      return "es-ES";

    case "it":
      return "it-IT";

    case "ja":
      return "ja-JP";

    case "ko":
      return "ko-KR";

    case "en":
    default:
      return "en-US";
  }
}

/**
 * Returns whether browser speech is available.
 */
export function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

/**
 * Returns the available browser voices.
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

/**
 * Finds the best available voice for a language.
 */
export function findVoiceForLanguage(
  language: string,
): SpeechSynthesisVoice | null {
  const normalizedLanguage =
    normalizeSpeechLanguage(language).toLowerCase();

  const voices =
    getAvailableVoices();

  if (voices.length === 0) {
    return null;
  }

  const exactVoice = voices.find(
    (voice) =>
      voice.lang.toLowerCase() ===
      normalizedLanguage,
  );

  if (exactVoice) {
    return exactVoice;
  }

  const baseLanguage =
    normalizedLanguage.split("-")[0];

  return (
    voices.find((voice) =>
      voice.lang
        .toLowerCase()
        .startsWith(baseLanguage),
    ) ?? null
  );
}

/**
 * Speaks a word using the best browser voice available.
 */
export function speakWordWithBestVoice(
  word: string,
  language: string = DEFAULT_SOURCE_LANGUAGE,
): boolean {
  if (!isSpeechSupported()) {
    return false;
  }

  const text = word.trim();

  if (!text) {
    return false;
  }

  stopSpeaking();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang =
    normalizeSpeechLanguage(language);

  const voice =
    findVoiceForLanguage(language);

  if (voice) {
    utterance.voice = voice;
  }

  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(
    utterance,
  );

  return true;
}

/**
 * Returns whether the browser is currently speaking.
 */
export function isSpeaking(): boolean {
  if (!isSpeechSupported()) {
    return false;
  }

  return window.speechSynthesis.speaking;
}

/**
 * Creates the data required by the Library word popup.
 */
export function prepareWordPopup(
  word: string,
  targetLanguage: string = DEFAULT_TARGET_LANGUAGE,
): WordTranslation {
  return createEmptyTranslation(
    word,
    targetLanguage,
  );
}

/**
 * Validates a translation request.
 */
export function validateTranslationRequest(
  request: TranslationRequest,
): boolean {
  if (!request.word.trim()) {
    return false;
  }

  if (
    !isTranslationLanguageSupported(
      request.targetLanguage,
    )
  ) {
    return false;
  }

  return true;
}