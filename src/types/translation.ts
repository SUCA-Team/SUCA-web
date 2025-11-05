export interface WordSuggestion {
  word: string;
  reading?: string;
  meaning: string;
  type: 'hiragana' | 'katakana' | 'kanji' | 'romaji';
  level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  language: 'ja' | 'en';
  confidence: number;
}