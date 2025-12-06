import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api';
import { auth } from '../firebase';


export interface DeckResponse {
  id: number;
  name: string;
  description?: string | null;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  flashcard_count: number;
}

export interface DeckCreate {
  name: string;
  description?: string | null;
  is_public?: boolean | null;
}

export interface DeckListResponse {
  decks: DeckResponse[];
  total_count: number;
}

export interface DeckUpdate {
  name?: string | null;
  description?: string | null;
  is_public?: boolean | null;
}

export interface FlashcardResponse {
  front: string;
  back: string;
  id: number;
  deck_id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  difficulty: number;
  stability: number;
  reps: number;
  state: number;
  last_review?: string | null;
  due: string;
  retrievability?: number;
}

export interface FlashcardCreate {
  front: string;
  back: string;
}

export interface FlashcardUpdate {
  front?: string | null;
  back?: string | null;
}

export interface FlashcardListResponse {
  flashcards: FlashcardResponse[];
  total_count: number;
}

export interface FlashcardReviewRequest {
  rating: number; // 1-4
}

export interface FlashcardReviewResponse {
  front: string;
  back: string;
  id: number;
  deck_id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  difficulty: number;
  stability: number;
  reps: number;
  state: number;
  last_review?: string | null;
  due: string;
  retrievability?: number;
}

export interface BulkCreateRequest {
  cards: Array<{ front: string; back: string }>; // max 100 items
}

export interface BulkDeleteRequest {
  card_ids: number[]; // >= 1 items
}

export interface BulkMoveRequest {
  card_ids: number[]; // >= 1 items
  target_deck_id: number;
}

export interface BulkUpdateRequest {
  updates: Array<{
    id: number;
    front?: string | null;
    back?: string | null;
  }>; // [1, 100] items
}

export interface BulkResetRequest {
  card_ids: number[]; // >= 1 items
}

export interface BulkOperationResponse {
  success: boolean;
  processed_count: number;
  failed_count?: number;
  message?: string;
  errors?: string[];
}

export interface DueCardsResponse {
  decks: Array<{
    deck_id: number;
    deck_name: string;
    total_cards: number;
    new_cards: number;
    learning_cards: number;
    review_cards: number;
    due_cards: number;
  }>;
  total_due: number;
}


export interface TranslationResponse {
  original: string;
  translated: string;
  notification?: string;
}

export interface SearchResult {
  word: string;
  reading: string | null;
  is_common: boolean;
  jlpt_level: string | null;
  meanings: Array<{
    pos: string[];
    definitions: string[];
    examples: Array<{ japanese: string; english: string }>;
    notes: string[];
  }>;
  other_forms: string[];
  tags: string[];
  variants: Array<{ word: string; reading: string }>;
}

export const SearchPos = {
  NOUN: 'noun',
  VERB: 'verb',
  ADJECTIVE: 'adjective',
} as const;

export type SearchPos = typeof SearchPos[keyof typeof SearchPos];

export interface SearchResponse {
  /** Indicates whether the search was successful */
  success: boolean;
  /** Human-readable message about the search results (e.g., "Found 12 results for '綺麗'") */
  message: string;
  /** Array of dictionary search results */
  results: SearchResult[];
  /** Total number of results found */
  total_count: number;
  /** The original search query */
  query: string;
}

export interface HealthResponse {
  status: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string; // typically "bearer"
  expires_in: number; // seconds
}

export interface SearchSuggestionsResponse {
  suggestions: string[];
}

class ApiService {
  private static instance: ApiService;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Skip adding token only for register and login endpoints
        const publicAuthEndpoints = ['/v1/auth/verify', '/v1/auth/refresh'];
        const isPublicAuth = publicAuthEndpoints.some(endpoint => config.url === endpoint);
        
        if (isPublicAuth) {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        }

        // Get Firebase ID token if user is authenticated
        if (auth?.currentUser) {
          try {
            const token = await auth.currentUser.getIdToken();
            config.headers = config.headers ?? {};
            config.headers['Authorization'] = `Bearer ${token}`;
          } catch (error) {
            console.error('Failed to get Firebase token:', error);
          }
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Health check
  async checkHealth(): Promise<HealthResponse> {
    const response = await this.client.get<HealthResponse>(API_CONFIG.ENDPOINTS.HEALTH);
    return response.data;
  }

  // Translation services
  async translateEnglishToJapanese(text: string): Promise<TranslationResponse> {
    const response = await this.client.get<TranslationResponse>(
      API_CONFIG.ENDPOINTS.TRANSLATE_EN_TO_JP,
      {
        params: { q: text, target_lang: 'ja' }
      }
    );
    return response.data;
  }

  async translateJapaneseToEnglish(text: string): Promise<TranslationResponse> {
    const response = await this.client.get<TranslationResponse>(
      API_CONFIG.ENDPOINTS.TRANSLATE_JP_TO_EN,
      {
        params: { q: text, target_lang: 'en' }
      }
    );
    return response.data;
  }

  // Dictionary search
  async searchDictionary(query: string, limit?: number, page?: number, pos?: SearchPos | null): Promise<SearchResponse> {
    const response = await this.client.get<SearchResponse>(API_CONFIG.ENDPOINTS.SEARCH, {
      params: { 
        q: query,
        ...(limit && { limit }),
        ...(page && { page }),
        ...(pos && { pos }),
      }
    });
    return response.data;
  }

  // Search suggestions
  async getSearchSuggestions(query: string, limit = 10): Promise<string[]> {
    const response = await this.client.get<SearchSuggestionsResponse>(
      API_CONFIG.ENDPOINTS.SEARCH_SUGGESTIONS,
      { params: { q: query, limit } }
    );
    return response.data.suggestions ?? [];
  }

  // Authentication - register (sign up)
  async registerUser(username: string, email: string, password: string): Promise<AuthTokenResponse> {
    // Backend expects JSON body: { username, email, password }
    const response = await this.client.post<AuthTokenResponse>('/v1/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  }

  // Authentication - login
  async loginUser(username: string, password: string): Promise<AuthTokenResponse> {
    // Backend expects JSON body: { username, password }
    const response = await this.client.post<AuthTokenResponse>('/v1/auth/login', {
      username,
      password,
    });
    return response.data;
  }

  // Authentication - get current user info
  async getCurrentUser(): Promise<{ user_id: string; username: string; email: string }> {
    const response = await this.client.get('/v1/auth/me');
    return response.data;
  }

  // Deck management
  async createDeck(deckData: DeckCreate): Promise<DeckResponse> {
    const response = await this.client.post<DeckResponse>('/v1/flashcard/decks/', deckData);
    return response.data;
  }

  async listDecks(): Promise<DeckListResponse> {
    const response = await this.client.get<DeckListResponse>('/v1/flashcard/decks/');
    return response.data;
  }

  async getDeck(deckId: number): Promise<DeckResponse> {
    const response = await this.client.get<DeckResponse>(`/v1/flashcard/decks/${deckId}`);
    return response.data;
  }

  async updateDeck(deckId: number, deckData: DeckUpdate): Promise<DeckResponse> {
    const response = await this.client.put<DeckResponse>(`/v1/flashcard/decks/${deckId}`, deckData);
    return response.data;
  }

  async deleteDeck(deckId: number): Promise<void> {
    await this.client.delete(`/v1/flashcard/decks/${deckId}`);
  }

  // Flashcard management
  async createFlashcard(deckId: number, flashcardData: FlashcardCreate): Promise<FlashcardResponse> {
    const response = await this.client.post<FlashcardResponse>(`/v1/flashcard/decks/${deckId}/cards/`, flashcardData);
    return response.data;
  }

  async listFlashcards(deckId: number): Promise<FlashcardListResponse> {
    const response = await this.client.get<FlashcardListResponse>(`/v1/flashcard/decks/${deckId}/cards/`);
    return response.data;
  }

  async getFlashcard(deckId: number, flashcardId: number): Promise<FlashcardResponse> {
    const response = await this.client.get<FlashcardResponse>(`/v1/flashcard/decks/${deckId}/cards/${flashcardId}`);
    return response.data;
  }

  async updateFlashcard(deckId: number, flashcardId: number, flashcardData: FlashcardUpdate): Promise<FlashcardResponse> {
    const response = await this.client.put<FlashcardResponse>(`/v1/flashcard/decks/${deckId}/cards/${flashcardId}`, flashcardData);
    return response.data;
  }

  async deleteFlashcard(deckId: number, flashcardId: number): Promise<void> {
    await this.client.delete(`/v1/flashcard/decks/${deckId}/cards/${flashcardId}`);
  }

  async reviewFlashcard(deckId: number, flashcardId: number, reviewData: FlashcardReviewRequest): Promise<FlashcardReviewResponse> {
    const response = await this.client.post<FlashcardReviewResponse>(`/v1/flashcard/decks/${deckId}/cards/${flashcardId}/review`, reviewData);
    return response.data;
  }

  // Bulk operations
  async bulkCreateFlashcards(deckId: number, bulkData: BulkCreateRequest): Promise<BulkOperationResponse> {
    const response = await this.client.post<BulkOperationResponse>(`/v1/flashcard/decks/${deckId}/cards/bulk-create`, bulkData);
    return response.data;
  }

  async bulkDeleteFlashcards(deckId: number, bulkData: BulkDeleteRequest): Promise<BulkOperationResponse> {
    const response = await this.client.post<BulkOperationResponse>(`/v1/flashcard/decks/${deckId}/cards/bulk-delete`, bulkData);
    return response.data;
  }

  async bulkMoveFlashcards(deckId: number, bulkData: BulkMoveRequest): Promise<BulkOperationResponse> {
    const response = await this.client.post<BulkOperationResponse>(`/v1/flashcard/decks/${deckId}/cards/bulk-move`, bulkData);
    return response.data;
  }

  async bulkUpdateFlashcards(deckId: number, bulkData: BulkUpdateRequest): Promise<BulkOperationResponse> {
    const response = await this.client.post<BulkOperationResponse>(`/v1/flashcard/decks/${deckId}/cards/bulk-update`, bulkData);
    return response.data;
  }

  async bulkResetFlashcards(deckId: number, bulkData: BulkResetRequest): Promise<BulkOperationResponse> {
    const response = await this.client.post<BulkOperationResponse>(`/v1/flashcard/decks/${deckId}/cards/bulk-reset`, bulkData);
    return response.data;
  }

  // Due cards
  async getDueCards(): Promise<DueCardsResponse> {
    const response = await this.client.get<DueCardsResponse>('/v1/flashcard/due');
    return response.data;
  }

  // CSV import
  async importFlashcardsFromCSV(deckId: number, file: File): Promise<BulkOperationResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post<BulkOperationResponse>(
      `/v1/flashcard/decks/${deckId}/import/csv`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export default ApiService;
