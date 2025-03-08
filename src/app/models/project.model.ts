export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  createdBy: string | null;
  taskIds: string[]; // Viittaukset projektiin kuuluviin tehtäviin
  color?: string; // Värikoodi projektin visuaalista tunnistamista varten
} 