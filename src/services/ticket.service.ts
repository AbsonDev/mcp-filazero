import { apiService } from './api.service';
import { recaptchaService } from './recaptcha.service';
import { 
  TicketCreateRequest, 
  Ticket, 
  QueuePosition,
  PrevisionResponse,
  ApiResponse
} from '../models/filazero.types';

export class TicketService {
  
  async createTicket(request: TicketCreateRequest): Promise<Ticket> {
    try {
      console.log(`🎫 Criando ticket para ${request.customer.name}...`);
      
      // Generate reCAPTCHA token server-side if not provided or invalid
      let finalRequest = { ...request };
      
      if (!request.recaptcha || request.recaptcha.length < 100 || request.recaptcha.startsWith('bypass_') || request.recaptcha.includes('03AGdBq2')) {
        console.log('🔐 Generating server-side reCAPTCHA token...');
        try {
          finalRequest.recaptcha = await recaptchaService.generateToken('create_ticket');
          console.log(`✅ Server-side reCAPTCHA token generated (length: ${finalRequest.recaptcha.length})`);
        } catch (recaptchaError) {
          console.error('❌ Failed to generate reCAPTCHA token:', recaptchaError);
          // Continue with original request if token generation fails
        }
      } else {
        console.log(`🔐 Using client-provided reCAPTCHA token (length: ${request.recaptcha.length})`);
      }
      
      // Endpoint correto para criação de tickets
      const ticket = await apiService.post<Ticket>('v2/ticketing/tickets/booking-express', finalRequest);
      
      if (ticket) {
        console.log(`✅ Ticket criado: ID ${ticket.id}, Smart Code: ${ticket.smartCode}`);
      }
      
      return ticket;
    } catch (error) {
      console.error('❌ Erro ao criar ticket:', error);
      throw error;
    }
  }

  async getTicket(id: number): Promise<Ticket | null> {
    try {
      console.log(`🔍 Buscando ticket ID: ${id}`);
      
      const ticket = await apiService.get<Ticket>(`api/tickets/${id}`);
      
      if (ticket) {
        console.log(`✅ Ticket encontrado: ${ticket.smartCode} (Status: ${ticket.status})`);
      } else {
        console.log(`⚠️ Ticket não encontrado para ID: ${id}`);
      }
      
      return ticket;
    } catch (error) {
      console.error(`❌ Erro ao buscar ticket ${id}:`, error);
      return null;
    }
  }

  async getQueuePosition(providerId: number, ticketId: number): Promise<QueuePosition | null> {
    try {
      console.log(`📊 Consultando posição do ticket ${ticketId} (Provider: ${providerId})`);
      
      const position = await apiService.get<QueuePosition>(
        `api/tickets/${ticketId}/queue-position`
      );
      
      if (position) {
        console.log(`✅ Posição: ${position.position} (Estimativa: ${position.estimatedTime}min)`);
      }
      
      return position;
    } catch (error) {
      console.error(`❌ Erro ao buscar posição ticket ${ticketId}:`, error);
      return null;
    }
  }

  async getTicketPrevision(ticketId: number): Promise<PrevisionResponse | null> {
    try {
      console.log(`⏰ Consultando previsão do ticket ${ticketId}`);
      
      const prevision = await apiService.get<PrevisionResponse>(`api/tickets/${ticketId}/prevision`);
      
      if (prevision) {
        console.log(`✅ Previsão: ${prevision.estimatedTime}min (Posição: ${prevision.position})`);
      }
      
      return prevision;
    } catch (error) {
      console.error(`❌ Erro ao buscar previsão ticket ${ticketId}:`, error);
      return null;
    }
  }

  async cancelTicket(ticketId: number, providerId: number, cancellation?: string): Promise<boolean> {
    try {
      console.log(`❌ Cancelando ticket ${ticketId} (Provider: ${providerId})`);
      
      const payload = {
        ticketId,
        providerId,
        cancellation: cancellation || 'Cancelado via MCP'
      };
      
      await apiService.put(`api/tickets/${ticketId}/cancel`, payload);
      
      console.log(`✅ Ticket ${ticketId} cancelado com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao cancelar ticket ${ticketId}:`, error);
      return false;
    }
  }

  async checkinTicket(smartCode: string, providerId: number): Promise<any> {
    try {
      console.log(`✅ Fazendo check-in do código ${smartCode} (Provider: ${providerId})`);
      
      const payload = { smartCode, providerId };
      const result = await apiService.post(`api/tickets/checkin`, payload);
      
      console.log(`✅ Check-in realizado com sucesso para ${smartCode}`);
      return result;
    } catch (error) {
      console.error(`❌ Erro no check-in ${smartCode}:`, error);
      throw error;
    }
  }

  async confirmPresence(ticketId: number, providerId: number): Promise<boolean> {
    try {
      console.log(`👤 Confirmando presença do ticket ${ticketId} (Provider: ${providerId})`);
      
      const payload = { ticketId, providerId };
      await apiService.put(`api/tickets/${ticketId}/confirm-presence`, payload);
      
      console.log(`✅ Presença confirmada para ticket ${ticketId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao confirmar presença ticket ${ticketId}:`, error);
      return false;
    }
  }
}

export const ticketService = new TicketService();