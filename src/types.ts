export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  instructions: string[];
  time: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
}
