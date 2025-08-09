import { apiService } from './api.service.js';
import { Terminal, Service, CompanyTemplate } from '../models/filazero.types.js';

export class TerminalService {
  
  async getTerminal(accessKey: string): Promise<Terminal | null> {
    try {
      console.log(`🔍 Buscando terminal com chave: ${accessKey}`);
      
      // Endpoint baseado no projeto .NET
      const terminal = await apiService.get<Terminal>(`api/terminals/${accessKey}`);
      
      if (terminal) {
        console.log(`✅ Terminal encontrado: ${terminal.name} (ID: ${terminal.id})`);
      } else {
        console.log(`⚠️ Terminal não encontrado para chave: ${accessKey}`);
      }
      
      return terminal;
    } catch (error) {
      console.error(`❌ Erro ao buscar terminal ${accessKey}:`, error);
      return null;
    }
  }

  async getService(id: number): Promise<Service | null> {
    try {
      console.log(`🔍 Buscando serviço ID: ${id}`);
      
      const service = await apiService.get<Service>(`api/services/${id}`);
      
      if (service) {
        console.log(`✅ Serviço encontrado: ${service.name} (ID: ${service.id})`);
      } else {
        console.log(`⚠️ Serviço não encontrado para ID: ${id}`);
      }
      
      return service;
    } catch (error) {
      console.error(`❌ Erro ao buscar serviço ${id}:`, error);
      return null;
    }
  }

  async getCompanyTemplate(slug: string): Promise<CompanyTemplate | null> {
    try {
      console.log(`🔍 Buscando template da empresa: ${slug}`);
      
      const template = await apiService.get<CompanyTemplate>(`api/templates/${slug}`);
      
      if (template) {
        console.log(`✅ Template encontrado: ${template.name} (${template.slug})`);
      } else {
        console.log(`⚠️ Template não encontrado para empresa: ${slug}`);
      }
      
      return template;
    } catch (error) {
      console.error(`❌ Erro ao buscar template ${slug}:`, error);
      return null;
    }
  }
}

export const terminalService = new TerminalService();