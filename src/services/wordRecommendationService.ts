import axios from 'axios';
import type { WordSuggestion } from '../types/translation';

// Mock Japanese vocabulary database
const mockVocabulary: WordSuggestion[] = [
  { word: 'こんにちは', reading: 'konnichiwa', meaning: 'Hello (daytime)', type: 'hiragana', level: 'N5' },
  { word: 'ありがとう', reading: 'arigatou', meaning: 'Thank you', type: 'hiragana', level: 'N5' },
  { word: 'おはよう', reading: 'ohayou', meaning: 'Good morning', type: 'hiragana', level: 'N5' },
  { word: 'さようなら', reading: 'sayounara', meaning: 'Goodbye', type: 'hiragana', level: 'N5' },
  { word: 'すみません', reading: 'sumimasen', meaning: 'Excuse me/Sorry', type: 'hiragana', level: 'N5' },
  { word: '学校', reading: 'gakkou', meaning: 'School', type: 'kanji', level: 'N5' },
  { word: '先生', reading: 'sensei', meaning: 'Teacher', type: 'kanji', level: 'N5' },
  { word: '学生', reading: 'gakusei', meaning: 'Student', type: 'kanji', level: 'N5' },
  { word: '友達', reading: 'tomodachi', meaning: 'Friend', type: 'kanji', level: 'N5' },
  { word: '日本', reading: 'nihon', meaning: 'Japan', type: 'kanji', level: 'N5' },
  { word: 'カフェ', reading: 'kafe', meaning: 'Cafe', type: 'katakana', level: 'N5' },
  { word: 'コーヒー', reading: 'koohii', meaning: 'Coffee', type: 'katakana', level: 'N5' },
  { word: 'レストラン', reading: 'resutoran', meaning: 'Restaurant', type: 'katakana', level: 'N5' },
  { word: 'hello', reading: 'hello', meaning: 'こんにちは', type: 'romaji', level: 'N5' },
  { word: 'thank you', reading: 'thank you', meaning: 'ありがとう', type: 'romaji', level: 'N5' },

  // Additional vocabulary (~85 more entries)
  { word: '食べる', reading: 'taberu', meaning: 'To eat', type: 'kanji', level: 'N5' },
  { word: '飲む', reading: 'nomu', meaning: 'To drink', type: 'kanji', level: 'N5' },
  { word: '行く', reading: 'iku', meaning: 'To go', type: 'kanji', level: 'N5' },
  { word: 'いく', reading: 'iku', meaning: 'To go', type: 'kanji', level: 'N5' },
  { word: '来る', reading: 'kuru', meaning: 'To come', type: 'kanji', level: 'N5' },
  { word: '見る', reading: 'miru', meaning: 'To see/watch', type: 'kanji', level: 'N5' },
  { word: '聞く', reading: 'kiku', meaning: 'To listen/ask', type: 'kanji', level: 'N5' },
  { word: '話す', reading: 'hanasu', meaning: 'To speak', type: 'kanji', level: 'N5' },
  { word: '買う', reading: 'kau', meaning: 'To buy', type: 'kanji', level: 'N5' },
  { word: '行きます', reading: 'ikimasu', meaning: 'I go (polite)', type: 'hiragana', level: 'N5' },
  { word: '飲み物', reading: 'nomimono', meaning: 'Beverage', type: 'kanji', level: 'N5' },
  { word: '映画', reading: 'eiga', meaning: 'Movie', type: 'kanji', level: 'N5' },
  { word: '音楽', reading: 'ongaku', meaning: 'Music', type: 'kanji', level: 'N5' },
  { word: '天気', reading: 'tenki', meaning: 'Weather', type: 'kanji', level: 'N5' },
  { word: '今日', reading: 'kyou', meaning: 'Today', type: 'kanji', level: 'N5' },
  { word: '昨日', reading: 'kinou', meaning: 'Yesterday', type: 'kanji', level: 'N5' },
  { word: '明日', reading: 'ashita', meaning: 'Tomorrow', type: 'kanji', level: 'N5' },
  { word: '朝', reading: 'asa', meaning: 'Morning', type: 'kanji', level: 'N5' },
  { word: '夜', reading: 'yoru', meaning: 'Night', type: 'kanji', level: 'N5' },
  { word: '午前', reading: 'gozen', meaning: 'AM', type: 'kanji', level: 'N5' },
  { word: '午後', reading: 'gogo', meaning: 'PM', type: 'kanji', level: 'N5' },
  { word: '駅', reading: 'eki', meaning: 'Station', type: 'kanji', level: 'N5' },
  { word: '電車', reading: 'densha', meaning: 'Train', type: 'kanji', level: 'N5' },
  { word: 'バス', reading: 'basu', meaning: 'Bus', type: 'katakana', level: 'N5' },
  { word: '車', reading: 'kuruma', meaning: 'Car', type: 'kanji', level: 'N5' },
  { word: '自転車', reading: 'jitensha', meaning: 'Bicycle', type: 'kanji', level: 'N5' },
  { word: '病院', reading: 'byouin', meaning: 'Hospital', type: 'kanji', level: 'N5' },
  { word: '薬', reading: 'kusuri', meaning: 'Medicine', type: 'kanji', level: 'N5' },
  { word: '料理', reading: 'ryouri', meaning: 'Cooking/Cuisine', type: 'kanji', level: 'N4' },
  { word: '買い物', reading: 'kaimono', meaning: 'Shopping', type: 'kanji', level: 'N5' },
  { word: '仕事', reading: 'shigoto', meaning: 'Work/Job', type: 'kanji', level: 'N5' },
  { word: '休み', reading: 'yasumi', meaning: 'Holiday/Rest', type: 'kanji', level: 'N5' },
  { word: '電話', reading: 'denwa', meaning: 'Telephone', type: 'kanji', level: 'N5' },
  { word: '名前', reading: 'namae', meaning: 'Name', type: 'kanji', level: 'N5' },
  { word: '住所', reading: 'juusho', meaning: 'Address', type: 'kanji', level: 'N4' },
  { word: '時間', reading: 'jikan', meaning: 'Time', type: 'kanji', level: 'N5' },
  { word: '年', reading: 'toshi', meaning: 'Year', type: 'kanji', level: 'N5' },
  { word: '月', reading: 'tsuki', meaning: 'Month/Moon', type: 'kanji', level: 'N5' },
  { word: '日', reading: 'hi', meaning: 'Day/Sun', type: 'kanji', level: 'N5' },
  { word: '週', reading: 'shuu', meaning: 'Week', type: 'kanji', level: 'N4' },
  { word: '朝ごはん', reading: 'asagohan', meaning: 'Breakfast', type: 'hiragana', level: 'N5' },
  { word: '昼ごはん', reading: 'hirugohan', meaning: 'Lunch', type: 'hiragana', level: 'N5' },
  { word: '晩ごはん', reading: 'bangohan', meaning: 'Dinner', type: 'hiragana', level: 'N5' },
  { word: '野菜', reading: 'yasai', meaning: 'Vegetable', type: 'kanji', level: 'N4' },
  { word: '果物', reading: 'kudamono', meaning: 'Fruit', type: 'kanji', level: 'N4' },
  { word: '魚', reading: 'sakana', meaning: 'Fish', type: 'kanji', level: 'N5' },
  { word: '肉', reading: 'niku', meaning: 'Meat', type: 'kanji', level: 'N5' },
  { word: '卵', reading: 'tamago', meaning: 'Egg', type: 'kanji', level: 'N5' },
  { word: 'パン', reading: 'pan', meaning: 'Bread', type: 'katakana', level: 'N5' },
  { word: '水', reading: 'mizu', meaning: 'Water', type: 'kanji', level: 'N5' },
  { word: 'お茶', reading: 'ocha', meaning: 'Tea', type: 'kanji', level: 'N5' },
  { word: '店', reading: 'mise', meaning: 'Shop/Store', type: 'kanji', level: 'N5' },
  { word: '市場', reading: 'ichiba', meaning: 'Market', type: 'kanji', level: 'N4' },
  { word: '図書館', reading: 'toshokan', meaning: 'Library', type: 'kanji', level: 'N4' },
  { word: '公園', reading: 'kouen', meaning: 'Park', type: 'kanji', level: 'N5' },
  { word: '映画館', reading: 'eigakan', meaning: 'Cinema', type: 'kanji', level: 'N4' },
  { word: '銀行', reading: 'ginkou', meaning: 'Bank', type: 'kanji', level: 'N5' },
  { word: '郵便局', reading: 'yuubinkyoku', meaning: 'Post office', type: 'kanji', level: 'N4' },
  { word: '羽田', reading: 'haneda', meaning: 'Haneda (airport)', type: 'kanji', level: 'N3' },
  { word: '空港', reading: 'kuukou', meaning: 'Airport', type: 'kanji', level: 'N4' },
  { word: '旅行', reading: 'ryokou', meaning: 'Travel', type: 'kanji', level: 'N4' },
  { word: '宿泊', reading: 'shukuhaku', meaning: 'Lodging', type: 'kanji', level: 'N3' },
  { word: '予約', reading: 'yoyaku', meaning: 'Reservation', type: 'kanji', level: 'N3' },
  { word: '切符', reading: 'kippu', meaning: 'Ticket', type: 'kanji', level: 'N4' },
  { word: '天皇', reading: 'tennou', meaning: 'Emperor', type: 'kanji', level: 'N2' },
  { word: '政治', reading: 'seiji', meaning: 'Politics', type: 'kanji', level: 'N2' },
  { word: '経済', reading: 'keizai', meaning: 'Economy', type: 'kanji', level: 'N2' },
  { word: '文化', reading: 'bunka', meaning: 'Culture', type: 'kanji', level: 'N3' },
  { word: '歴史', reading: 'rekishi', meaning: 'History', type: 'kanji', level: 'N3' },
  { word: '社会', reading: 'shakai', meaning: 'Society', type: 'kanji', level: 'N2' },
  { word: '科学', reading: 'kagaku', meaning: 'Science', type: 'kanji', level: 'N2' },
  { word: '情報', reading: 'jouhou', meaning: 'Information', type: 'kanji', level: 'N3' },
  { word: '勉強', reading: 'benkyou', meaning: 'Study', type: 'kanji', level: 'N5' },
  { word: '試験', reading: 'shiken', meaning: 'Exam', type: 'kanji', level: 'N4' },
  { word: '成績', reading: 'seiseki', meaning: 'Grades', type: 'kanji', level: 'N3' },
  { word: '合格', reading: 'goukaku', meaning: 'Pass (an exam)', type: 'kanji', level: 'N3' },
  { word: '失敗', reading: 'shippai', meaning: 'Failure', type: 'kanji', level: 'N3' },
  { word: '仕事場', reading: 'shigotoba', meaning: 'Workplace', type: 'kanji', level: 'N3' },
  { word: '会議', reading: 'kaigi', meaning: 'Meeting', type: 'kanji', level: 'N3' },
  { word: '約束', reading: 'yakusoku', meaning: 'Promise/appointment', type: 'kanji', level: 'N3' },
  { word: '苦手', reading: 'nigate', meaning: 'Not good at', type: 'kanji', level: 'N3' },
  { word: '得意', reading: 'tokui', meaning: 'Good at/strong point', type: 'kanji', level: 'N3' },
  { word: '便利', reading: 'benri', meaning: 'Convenient', type: 'kanji', level: 'N4' },
  { word: '不便', reading: 'fuben', meaning: 'Inconvenient', type: 'kanji', level: 'N3' },
  { word: '簡単', reading: 'kantan', meaning: 'Simple/easy', type: 'kanji', level: 'N4' },
  { word: '難しい', reading: 'muzukashii', meaning: 'Difficult', type: 'kanji', level: 'N4' },
  { word: '新しい', reading: 'atarashii', meaning: 'New', type: 'kanji', level: 'N5' },
  { word: '古い', reading: 'furui', meaning: 'Old', type: 'kanji', level: 'N5' },
  { word: '大きい', reading: 'ookii', meaning: 'Big', type: 'kanji', level: 'N5' },
  { word: '小さい', reading: 'chiisai', meaning: 'Small', type: 'kanji', level: 'N5' },
  { word: '高い', reading: 'takai', meaning: 'Expensive/high', type: 'kanji', level: 'N5' },
  { word: '安い', reading: 'yasui', meaning: 'Cheap', type: 'kanji', level: 'N5' },
  { word: '面白い', reading: 'omoshiroi', meaning: 'Interesting/funny', type: 'kanji', level: 'N4' },
  { word: 'つまらない', reading: 'tsumaranai', meaning: 'Boring', type: 'hiragana', level: 'N4' },
  { word: '優しい', reading: 'yasashii', meaning: 'Kind/easy', type: 'kanji', level: 'N4' },
  { word: '親切', reading: 'shinsetsu', meaning: 'Kind', type: 'kanji', level: 'N3' },
  { word: '忙しい', reading: 'isogashii', meaning: 'Busy', type: 'kanji', level: 'N4' },
  { word: '疲れた', reading: 'tsukareta', meaning: 'Tired', type: 'hiragana', level: 'N4' },
  { word: '元気', reading: 'genki', meaning: 'Healthy/energetic', type: 'kanji', level: 'N5' },
  { word: '病気', reading: 'byouki', meaning: 'Illness/sick', type: 'kanji', level: 'N4' },
  { word: '恋人', reading: 'koibito', meaning: 'Lover/partner', type: 'kanji', level: 'N3' },
  { word: '結婚', reading: 'kekkon', meaning: 'Marriage', type: 'kanji', level: 'N3' },
  { word: '赤', reading: 'aka', meaning: 'Red', type: 'kanji', level: 'N5' },
  { word: '青', reading: 'ao', meaning: 'Blue', type: 'kanji', level: 'N5' },
  { word: '黒', reading: 'kuro', meaning: 'Black', type: 'kanji', level: 'N5' },
  { word: '白', reading: 'shiro', meaning: 'White', type: 'kanji', level: 'N5' },
  { word: '黄色', reading: 'kiiro', meaning: 'Yellow', type: 'kanji', level: 'N4' },
  { word: '緑', reading: 'midori', meaning: 'Green', type: 'kanji', level: 'N4' },
  { word: 'サイズ', reading: 'saizu', meaning: 'Size', type: 'katakana', level: 'N5' },
  { word: 'カラー', reading: 'karaa', meaning: 'Color', type: 'katakana', level: 'N5' },
  { word: 'スマホ', reading: 'sumaho', meaning: 'Smartphone', type: 'katakana', level: 'N4' },
  { word: 'コンピュータ', reading: 'konpyuuta', meaning: 'Computer', type: 'katakana', level: 'N4' },
  { word: 'インターネット', reading: 'intaanetto', meaning: 'Internet', type: 'katakana', level: 'N3' },
  { word: 'メール', reading: 'meeru', meaning: 'Email', type: 'katakana', level: 'N4' },
  { word: '写真', reading: 'shashin', meaning: 'Photograph', type: 'kanji', level: 'N4' },
  { word: '映像', reading: 'eizou', meaning: 'Video/image', type: 'kanji', level: 'N3' },
  { word: '検索', reading: 'kensaku', meaning: 'Search', type: 'kanji', level: 'N3' },
  { word: '情報技術', reading: 'jouhou gijutsu', meaning: 'Information technology', type: 'kanji', level: 'N2' },
  { word: '経営', reading: 'keiei', meaning: 'Management', type: 'kanji', level: 'N2' },
  { word: '研究', reading: 'kenkyuu', meaning: 'Research', type: 'kanji', level: 'N2' },
  { word: '発表', reading: 'happyou', meaning: 'Presentation/announcement', type: 'kanji', level: 'N3' },
  { word: '説明', reading: 'setsumei', meaning: 'Explanation', type: 'kanji', level: 'N3' },
  { word: '指示', reading: 'shiji', meaning: 'Instruction/direction', type: 'kanji', level: 'N2' },
  { word: '改善', reading: 'kaizen', meaning: 'Improvement', type: 'kanji', level: 'N2' },
  { word: '挑戦', reading: 'chousen', meaning: 'Challenge', type: 'kanji', level: 'N2' },
  { word: '成功', reading: 'seikou', meaning: 'Success', type: 'kanji', level: 'N2' },
  { word: '失望', reading: 'shitsubou', meaning: 'Disappointment', type: 'kanji', level: 'N2' },
  { word: '平和', reading: 'heiwa', meaning: 'Peace', type: 'kanji', level: 'N2' },
  { word: '安全', reading: 'anzen', meaning: 'Safety', type: 'kanji', level: 'N3' },
  { word: '危険', reading: 'kiken', meaning: 'Danger', type: 'kanji', level: 'N3' },
  { word: '法律', reading: 'houritsu', meaning: 'Law', type: 'kanji', level: 'N2' },
  { word: '規則', reading: 'kisoku', meaning: 'Rule/regulation', type: 'kanji', level: 'N2' },
  { word: '責任', reading: 'sekinin', meaning: 'Responsibility', type: 'kanji', level: 'N2' },
  { word: '義務', reading: 'gimu', meaning: 'Duty/obligation', type: 'kanji', level: 'N2' },
  { word: '意見', reading: 'iken', meaning: 'Opinion', type: 'kanji', level: 'N3' },
  { word: '議論', reading: 'giron', meaning: 'Discussion/debate', type: 'kanji', level: 'N2' },
  { word: '提案', reading: 'teian', meaning: 'Proposal/suggestion', type: 'kanji', level: 'N2' },
  { word: '計画', reading: 'keikaku', meaning: 'Plan', type: 'kanji', level: 'N3' },
  { word: '目標', reading: 'mokuhyou', meaning: 'Goal/target', type: 'kanji', level: 'N3' },
  { word: '技術', reading: 'gijutsu', meaning: 'Technique/technology', type: 'kanji', level: 'N2' },
  { word: '資料', reading: 'shiryou', meaning: 'Materials/documents', type: 'kanji', level: 'N3' },
  { word: '料金', reading: 'ryoukin', meaning: 'Charge/fee', type: 'kanji', level: 'N3' },
  { word: '費用', reading: 'hiyou', meaning: 'Cost/expense', type: 'kanji', level: 'N3' },
  { word: '利益', reading: 'rieki', meaning: 'Profit', type: 'kanji', level: 'N2' },
  { word: '損失', reading: 'sonshitsu', meaning: 'Loss', type: 'kanji', level: 'N2' },
  { word: '株式', reading: 'kabushiki', meaning: 'Stock (shares)', type: 'kanji', level: 'N2' },
];

export class WordRecommendationService {
  private static instance: WordRecommendationService;
  private vocabulary: WordSuggestion[] = mockVocabulary;

  static getInstance(): WordRecommendationService {
    if (!WordRecommendationService.instance) {
      WordRecommendationService.instance = new WordRecommendationService();
    }
    return WordRecommendationService.instance;
  }

  /**
   * Get word suggestions based on user input
   */
  async getSuggestions(query: string, limit: number = 5): Promise<WordSuggestion[]> {
    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();

    // Local/mock suggestion behavior only (used while the user types).
    // Simulate a small delay to make UX smoother.
    await new Promise((resolve) => setTimeout(resolve, 60));

    const suggestions = this.vocabulary.filter((item) => {
      const matchesWord = item.word.toLowerCase().includes(normalizedQuery);
      const matchesReading = item.reading?.toLowerCase().includes(normalizedQuery);
      const matchesMeaning = item.meaning.toLowerCase().includes(normalizedQuery);
      return matchesWord || matchesReading || matchesMeaning;
    });

    suggestions.sort((a, b) => {
      const aExact =
        a.word.toLowerCase() === normalizedQuery ||
        a.reading?.toLowerCase() === normalizedQuery ||
        a.meaning.toLowerCase() === normalizedQuery;
      const bExact =
        b.word.toLowerCase() === normalizedQuery ||
        b.reading?.toLowerCase() === normalizedQuery ||
        b.meaning.toLowerCase() === normalizedQuery;

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      return a.word.length - b.word.length;
    });

    return suggestions.slice(0, limit);
  }

  /**
   * Send the final query to the backend. This should only be called when user presses Enter.
   * Returns backend response or null if no backend is configured or the call failed.
   */
  async searchBackend(query: string): Promise<unknown | null> {
    if (!query.trim()) return null;

    const apiBase = (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE;
    if (!apiBase) return null;

    try {
      const resp = await axios.get(`${apiBase.replace(/\/$/, '')}/search`, { params: { q: query } });
      return resp.data;
    } catch (err) {
      console.warn('Backend search failed:', err);
      return null;
    }
  }

  /**
   * Add new word to vocabulary (for future expansion)
   */
  addWord(word: WordSuggestion): void {
    this.vocabulary.push(word);
  }

  /**
   * Get random words for practice
   */
  getRandomWords(count: number = 5): WordSuggestion[] {
    const shuffled = [...this.vocabulary].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get words by level
   */
  getWordsByLevel(level: WordSuggestion['level']): WordSuggestion[] {
    return this.vocabulary.filter(word => word.level === level);
  }
}