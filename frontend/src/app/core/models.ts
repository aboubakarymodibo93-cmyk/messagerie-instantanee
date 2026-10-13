export interface User {
  id: number;
  username: string;
}

export interface Message {
  id: number;
  sender: string;
  recipient: string;
  content: string;
  sentAt: string;
}
