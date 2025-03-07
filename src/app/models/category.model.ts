export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// Ennalta määritellyt värit kategorioille
export const CATEGORY_COLORS = [
  '#EF4444', // Punainen
  '#F97316', // Oranssi
  '#F59E0B', // Keltainen
  '#10B981', // Vihreä
  '#3B82F6', // Sininen
  '#6366F1', // Indigo
  '#8B5CF6', // Violetti
  '#EC4899', // Pinkki
  '#6B7280', // Harmaa
]; 