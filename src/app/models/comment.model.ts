export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: Date;
  userName?: string; // Näyttönimi (täytetään käyttöliittymässä)
} 