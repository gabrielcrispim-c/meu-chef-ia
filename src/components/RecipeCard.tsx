import { Recipe } from '../types';
import { Clock, ChefHat, Edit2, Trash2 } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onView, onEdit, onDelete }: RecipeCardProps) {
  const difficultyColors = {
    'Fácil': 'bg-green-100 text-green-800',
    'Médio': 'bg-yellow-100 text-yellow-800',
    'Difícil': 'bg-red-100 text-red-800',
  };

  return (
    <div 
      onClick={() => onView(recipe)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col h-full cursor-pointer group"
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className="text-4xl group-hover:scale-110 transition-transform duration-300" role="img" aria-label={recipe.category}>
            {recipe.category}
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(recipe); }}
              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
              title="Editar"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(recipe.id); }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {recipe.name}
        </h3>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
            <Clock size={16} className="mr-1.5 text-orange-500" />
            {recipe.time}
          </div>
          <div className={`flex items-center text-sm px-3 py-1.5 rounded-full font-medium ${difficultyColors[recipe.difficulty]}`}>
            <ChefHat size={16} className="mr-1.5" />
            {recipe.difficulty}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
        <p className="text-sm text-gray-500 line-clamp-1">
          {recipe.ingredients.length} ingredientes
        </p>
      </div>
    </div>
  );
}
