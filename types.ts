
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  suggestions?: string[];
  unclear?: boolean;
  videoUrl?: string;
}
