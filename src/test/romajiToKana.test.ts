import { describe, it, expect } from 'vitest';
import { convertSearchInput, convertSearchInputForSubmit } from '../utils/romajiToKana';

describe('romajiToKana Conversion', () => {
  describe('convertSearchInput', () => {
    it('should convert basic romaji to hiragana', () => {
      expect(convertSearchInput('konnichiwa')).toBe('こんいちわ'); // 'nn' needed for ん
      expect(convertSearchInput('konnichiwa')).toBe('こんいちわ');
      expect(convertSearchInput('arigatou')).toBe('ありがとう');
      expect(convertSearchInput('ohayou')).toBe('おはよう');
    });

    it('should handle digraphs correctly', () => {
      expect(convertSearchInput('kyou')).toBe('きょう');
      expect(convertSearchInput('tokyo')).toBe('ときょ');
      expect(convertSearchInput('sha')).toBe('しゃ');
      expect(convertSearchInput('chu')).toBe('ちゅ');
    });

    it('should handle sokuon (double consonants)', () => {
      expect(convertSearchInput('gakkou')).toBe('がっこう');
      expect(convertSearchInput('kitte')).toBe('きって');
      expect(convertSearchInput('massugu')).toBe('まっすぐ');
    });

    it('should preserve content inside double quotes', () => {
      expect(convertSearchInput('"water"')).toBe('"water"');
      expect(convertSearchInput('mizu "water"')).toBe('みず "water"');
      expect(convertSearchInput('"hello" konnichiwa')).toBe('"hello" こんいちわ'); // 'nn' needed for ん
    });

    it('should handle mixed kana and romaji', () => {
      expect(convertSearchInput('miずkai')).toBe('みずかい');
      expect(convertSearchInput('こんにchiwa')).toBe('こんにちわ');
    });

    it('should preserve existing kana', () => {
      expect(convertSearchInput('ひらがな')).toBe('ひらがな');
      expect(convertSearchInput('カタカナ')).toBe('カタカナ');
      expect(convertSearchInput('漢字')).toBe('漢字');
    });

    it('should handle empty or whitespace input', () => {
      expect(convertSearchInput('')).toBe('');
      expect(convertSearchInput('   ')).toBe('   ');
    });

    it('should preserve spaces and punctuation', () => {
      expect(convertSearchInput('kon nichiwa')).toBe('こん にちわ');
      expect(convertSearchInput('watashi, anata')).toBe('わたし, あなた');
    });

    it('should handle unclosed quotes gracefully', () => {
      expect(convertSearchInput('"hello')).toBe('"hello');
      expect(convertSearchInput('mizu "water')).toBe('みず "water');
    });

    it('should convert n properly', () => {
      expect(convertSearchInput('hon')).toBe('ほん');
      expect(convertSearchInput('kantan')).toBe('かんたん');
      expect(convertSearchInput('sensei')).toBe('せんせい');
    });
  });

  describe('convertSearchInputForSubmit', () => {
    it('should convert romaji and strip quotes', () => {
      expect(convertSearchInputForSubmit('"water"')).toBe('water');
      expect(convertSearchInputForSubmit('mizu "water"')).toBe('みず water');
      expect(convertSearchInputForSubmit('"hello" konnichiwa')).toBe('hello こんいちわ'); // 'nn' needed for ん
    });

    it('should convert basic romaji to hiragana', () => {
      expect(convertSearchInputForSubmit('konnichiwa')).toBe('こんいちわ'); // 'nn' needed for ん
      expect(convertSearchInputForSubmit('arigatou')).toBe('ありがとう');
    });

    it('should handle unclosed quotes by removing opening quote', () => {
      expect(convertSearchInputForSubmit('"hello')).toBe('hello');
      expect(convertSearchInputForSubmit('mizu "water')).toBe('みず water');
    });

    it('should handle multiple quoted segments', () => {
      expect(convertSearchInputForSubmit('"water" mizu "drink"')).toBe('water みず drink');
    });

    it('should handle empty input', () => {
      expect(convertSearchInputForSubmit('')).toBe('');
      expect(convertSearchInputForSubmit('   ')).toBe('   ');
    });
  });
});
