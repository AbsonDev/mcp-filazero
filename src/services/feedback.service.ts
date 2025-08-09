import { apiService } from './api.service.js';
import { FeedbackRequest } from '../models/filazero.types.js';

export class FeedbackService {
  
  async updateFeedback(
    feedbackId: number, 
    guid: string, 
    feedbackData: Record<string, any>
  ): Promise<any> {
    try {
      console.log(`💬 Atualizando feedback ID: ${feedbackId}`);
      
      // Extrair dados do feedback baseado no projeto .NET
      const payload: FeedbackRequest = {
        feedbackId,
        guid,
        comment: feedbackData.comment,
        rate: feedbackData.rate || 5,
        platform: feedbackData.platform || 'mcp'
      };
      
      const result = await apiService.put(`api/feedback/${feedbackId}`, payload);
      
      if (result) {
        console.log(`✅ Feedback ${feedbackId} atualizado com sucesso`);
        console.log(`📝 Comentário: ${payload.comment}`);
        console.log(`⭐ Nota: ${payload.rate}/5`);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Erro ao atualizar feedback ${feedbackId}:`, error);
      throw error;
    }
  }

  async getFeedback(feedbackId: number): Promise<any> {
    try {
      console.log(`🔍 Buscando feedback ID: ${feedbackId}`);
      
      const feedback = await apiService.get(`api/feedback/${feedbackId}`);
      
      if (feedback) {
        console.log(`✅ Feedback encontrado: ID ${feedbackId}`);
      } else {
        console.log(`⚠️ Feedback não encontrado para ID: ${feedbackId}`);
      }
      
      return feedback;
    } catch (error) {
      console.error(`❌ Erro ao buscar feedback ${feedbackId}:`, error);
      return null;
    }
  }
}

export const feedbackService = new FeedbackService();