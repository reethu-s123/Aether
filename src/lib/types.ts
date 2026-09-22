export interface Attachment {
  name: string;
  type: string;
  size: number;
  base64: string;
  mimeType: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  images?: { url: string; prompt: string }[];
  feedback?: "like" | "dislike";
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt?: Date;
  pinned?: boolean;
}

export type TodoPriority = "low" | "medium" | "high";

export interface ScheduledTodo {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TodoPriority;
  completed: boolean;
  category?: string;
  createdAt: string;
  associatedChatId?: string;
}
