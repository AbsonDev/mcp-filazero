// Tipos baseados nos modelos do projeto .NET
export interface Terminal {
  id: number;
  publicAccessKey: string;
  name: string;
  locationId: number;
  providerId: number;
  isActive: boolean;
}

export interface TerminalSchedule {
  id: number;
  publicAccessKey: string;
  terminal?: Terminal;
  sessions: Session[];
}

export interface Session {
  id: number;
  start: string;
  end: string;
  hasSlotsLeft: boolean;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface TicketCreateRequest {
  terminalSchedule: TerminalSchedule;
  pid: number;
  locationId: number;
  serviceId: number;
  customer: Customer;
  recaptcha?: string; // Optional - server generates if not provided
  priority: number;
  metadata: any[];
  browserUuid: string;
}

export interface Ticket {
  id: number;
  smartCode: string;
  status: string;
  position?: number;
  estimatedTime?: number;
  customer?: Customer;
  service?: Service;
}

export interface QueuePosition {
  position: number;
  estimatedTime: number;
  queueLength: number;
  ticketId: number;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  isActive: boolean;
  providerId: number;
}

export interface CompanyTemplate {
  slug: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
  };
  logo: string;
  settings?: any;
}

export interface FeedbackRequest {
  feedbackId: number;
  guid: string;
  comment?: string;
  rate: number;
  platform: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PrevisionResponse {
  estimatedTime: number;
  position: number;
  averageWaitTime: number;
  queueLength: number;
}