import { FC } from 'react';
import { Recipe } from '../types';
import { Clock, ChefHat, Edit2, Trash2 } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
}

export const RecipeCard: FC<RecipeCardProps> = ({ recipe, onView, onEdit, onDelete, isDarkMode }) => {
  const difficultyColors = {
    'Fácil': 'bg-green-100 text-green-800',
    'Médio': 'bg-yellow-100 text-yellow-800',
    'Difícil': 'bg-red-100 text-red-800',
  };

  return (
    <div 
      onClick={() => onView(recipe)}
      className={`${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-gray-100 text-slate-950'} rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full cursor-pointer group`}
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className="text-4xl group-hover:scale-110 transition-transform duration-300" role="img" aria-label={recipe.category}>
            {recipe.category}
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(recipe); }}
              className={`${isDarkMode ? 'text-slate-300 hover:bg-orange-500/10' : 'text-slate-500 hover:bg-orange-50'} p-2 hover:text-orange-500 rounded-full transition-colors`}
              title="Editar"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(recipe.id); }}
              className={`${isDarkMode ? 'text-slate-300 hover:bg-red-500/10' : 'text-slate-500 hover:bg-red-50'} p-2 hover:text-red-500 rounded-full transition-colors`}
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        <h3 className={`text-xl font-semibold mb-2 line-clamp-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>
          {recipe.name}
        </h3>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <div className={`${isDarkMode ? 'text-slate-300 bg-slate-800' : 'text-slate-700 bg-slate-50'} flex items-center text-sm px-3 py-1.5 rounded-full`}>
            <Clock size={16} className="mr-1.5 text-orange-500" />
            {recipe.time}
          </div>
          <div className={`flex items-center text-sm px-3 py-1.5 rounded-full font-medium ${isDarkMode ? 'bg-slate-800 text-slate-100' : difficultyColors[recipe.difficulty]}`}>
            <ChefHat size={16} className="mr-1.5" />
            {recipe.difficulty}
          </div>
        </div>
      </div>
      
      <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'} px-6 py-4 mt-auto border-t`}>
        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-700'} text-sm line-clamp-1`}>
          {recipe.ingredients.length} ingredientes
        </p>
      </div>
    </div>
  );
}
