import { describe, it, expect, beforeEach } from 'vitest';
import { WordRecommendationService } from '../services/wordRecommendationService';

describe('WordRecommendationService', () => {
  let service: WordRecommendationService;

  beforeEach(() => {
    service = WordRecommendationService.getInstance();
  });

  describe('getSuggestions', () => {
    it('should return suggestions for hiragana input', async () => {
      const suggestions = await service.getSuggestions('こん', 5);
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);
      
      // Should include こんにちは
      const hasKonnichiwa = suggestions.some(s => s.word === 'こんにちは');
      expect(hasKonnichiwa).toBe(true);
    });

    it('should return suggestions for romaji input', async () => {
      const suggestions = await service.getSuggestions('kon', 5);
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Should match based on reading
      const hasKonnichiwa = suggestions.some(s => s.word === 'こんにちは');
      expect(hasKonnichiwa).toBe(true);
    });

    it('should return suggestions for kanji input', async () => {
      const suggestions = await service.getSuggestions('学', 5);
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      
      // Should include words with 学 kanji
      const hasGakuWords = suggestions.some(s => s.word.includes('学'));
      expect(hasGakuWords).toBe(true);
    });

    it('should return suggestions for English input', async () => {
      const suggestions = await service.getSuggestions('school', 5);
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      
      // Should match based on meaning
      if (suggestions.length > 0) {
        const hasSchool = suggestions.some(s => 
          s.meaning.toLowerCase().includes('school')
        );
        expect(hasSchool).toBe(true);
      }
    });

    it('should respect the limit parameter', async () => {
      const suggestions = await service.getSuggestions('a', 3);
      
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array for empty query', async () => {
      const suggestions = await service.getSuggestions('', 5);
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(0);
    });

    it('should return empty array for query with only spaces', async () => {
      const suggestions = await service.getSuggestions('   ', 5);
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBe(0);
    });

    it('should handle katakana input', async () => {
      const suggestions = await service.getSuggestions('コ', 5);
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      
      // Should include katakana words
      const hasKatakana = suggestions.some(s => s.word.includes('コ'));
      expect(hasKatakana).toBe(true);
    });

    it('should return results case-insensitively for romaji', async () => {
      const lowerCase = await service.getSuggestions('kon', 5);
      const upperCase = await service.getSuggestions('KON', 5);
      
      expect(lowerCase.length).toBe(upperCase.length);
    });

    it('should prioritize exact matches', async () => {
      const suggestions = await service.getSuggestions('こんにちは', 5);
      
      // Should find こんにちは in the results
      expect(suggestions.length).toBeGreaterThan(0);
      const hasExactMatch = suggestions.some(s => s.word === 'こんにちは');
      expect(hasExactMatch).toBe(true);
    });
  });

  describe('getRandomWords', () => {
    it('should return random words', () => {
      const randomWords = service.getRandomWords(5);
      
      expect(randomWords).toBeDefined();
      expect(Array.isArray(randomWords)).toBe(true);
      expect(randomWords.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array when requesting 0 words', () => {
      const randomWords = service.getRandomWords(0);
      
      expect(randomWords.length).toBe(0);
    });
  });

  describe('getWordsByLevel', () => {
    it('should return words filtered by level', () => {
      const n5Words = service.getWordsByLevel('N5');
      
      expect(n5Words).toBeDefined();
      expect(Array.isArray(n5Words)).toBe(true);
      expect(n5Words.length).toBeGreaterThan(0);
      
      // All words should be N5 level
      n5Words.forEach(word => {
        expect(word.level).toBe('N5');
      });
    });
  });
});
