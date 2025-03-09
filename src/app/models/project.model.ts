export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  createdBy: string | null;
  taskIds: string[]; // Viittaukset projektiin kuuluviin tehtäviin
  color?: string; // Värikoodi projektin visuaalista tunnistamista varten
  deadline?: Date | null; // Projektin deadline
  startDate?: Date | null; // Projektin suunniteltu aloituspäivä
  categoryIds?: string[]; // Projektikohtaiset kategoriat
} 