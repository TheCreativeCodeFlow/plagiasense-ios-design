import { API_ENDPOINTS } from './api-config';

// Types for API responses
export interface FlaggedSentence {
  student_sentence: string;
  score: number;
  reference_document: string;
  reference_sentence: string;
  sentence_index: number;
  risk_level: 'HIGH' | 'MEDIUM';
}

export interface AnalysisResult {
  overall_score: number;
  red_count: number;
  orange_count: number;
  total_sentences: number;
  flagged_sentences: FlaggedSentence[];
  highlighted_fragments: string[];
  processing_time: number;
}

// AI Detection types
export interface AIDetectionResult {
  ai_probability: number;
  ai_confidence: number;
  method_used: string;
  sentence_scores: Array<{
    sentence: string;
    ai_probability: number;
    confidence: number;
  }>;
  document_stats: {
    total_sentences: number;
    avg_ai_probability: number;
    high_risk_sentences: number;
  };
  processing_time: number;
}

export interface ApiStatus {
  status: string;
  model_loaded: boolean;
  device: string;
  configuration: {
    red_threshold: number;
    orange_threshold: number;
    max_sentences: number;
  };
}

export interface ApiError {
  error: string;
  detail: string;
}

// API service class
export class PlagiaSenseAPI {
  private static instance: PlagiaSenseAPI;

  static getInstance(): PlagiaSenseAPI {
    if (!PlagiaSenseAPI.instance) {
      PlagiaSenseAPI.instance = new PlagiaSenseAPI();
    }
    return PlagiaSenseAPI.instance;
  }

  async healthCheck(): Promise<{ status: string; model_loaded: boolean }> {
    try {
      const response = await fetch(API_ENDPOINTS.HEALTH);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw new Error('Failed to connect to API server');
    }
  }

  async getStatus(): Promise<ApiStatus> {
    try {
      const response = await fetch(API_ENDPOINTS.STATUS);
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      throw new Error('Failed to get API status');
    }
  }

  async getAvailableModels(): Promise<{ models: Record<string, string> }> {
    try {
      const response = await fetch(API_ENDPOINTS.MODELS);
      if (!response.ok) {
        throw new Error(`Models fetch failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Models fetch error:', error);
      throw new Error('Failed to get available models');
    }
  }

  async getAIDetectionModels(): Promise<{ models: Record<string, string>; performance_info?: any }> {
    try {
      const response = await fetch(API_ENDPOINTS.AI_DETECTION_MODELS);
      if (!response.ok) {
        throw new Error(`AI detection models fetch failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('AI detection models fetch error:', error);
      throw new Error('Failed to get AI detection models');
    }
  }

  async getAIDetectionMethods(): Promise<{ methods: Record<string, any> }> {
    try {
      const response = await fetch(API_ENDPOINTS.AI_DETECTION_METHODS);
      if (!response.ok) {
        throw new Error(`AI detection methods fetch failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('AI detection methods fetch error:', error);
      throw new Error('Failed to get AI detection methods');
    }
  }

  async analyzePlagiarism(files: File[]): Promise<AnalysisResult> {
    if (files.length < 2) {
      throw new Error('At least 2 files required: first is student document, rest are references');
    }

    // Validate file types
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error(`File ${file.name} is not a PDF. Only PDF files are supported.`);
      }
    }

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(API_ENDPOINTS.ANALYZE, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Analysis error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to analyze documents');
    }
  }

  async analyzeAI(file: File, options: {
    method?: string;
    modelChoice?: string;
    apiKey?: string;
    apiUrl?: string;
  } = {}): Promise<AIDetectionResult> {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error(`File ${file.name} is not a PDF. Only PDF files are supported.`);
    }

    const { method = 'pretrained', modelChoice = 'roberta-openai', apiKey, apiUrl } = options;

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('method', method);
      
      // Add model choice for pretrained method
      if (method === 'pretrained') {
        formData.append('model_choice', modelChoice);
      }

      // Add API credentials if provided
      if (apiKey) {
        formData.append('api_key', apiKey);
      }
      if (apiUrl) {
        formData.append('api_url', apiUrl);
      }

      const response = await fetch(API_ENDPOINTS.AI_DETECTION, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `AI detection failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI detection error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to analyze document for AI content');
    }
  }

  async configureThresholds(config: {
    red_threshold?: number;
    orange_threshold?: number;
    max_sentences?: number;
  }): Promise<{
    red_threshold: number;
    orange_threshold: number;
    max_sentences: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (config.red_threshold !== undefined) {
        params.append('red_threshold', config.red_threshold.toString());
      }
      if (config.orange_threshold !== undefined) {
        params.append('orange_threshold', config.orange_threshold.toString());
      }
      if (config.max_sentences !== undefined) {
        params.append('max_sentences', config.max_sentences.toString());
      }

      const response = await fetch(`${API_ENDPOINTS.CONFIGURE}?${params}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Configuration failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Configuration error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to configure thresholds');
    }
  }
}

// Export singleton instance
export const api = PlagiaSenseAPI.getInstance();