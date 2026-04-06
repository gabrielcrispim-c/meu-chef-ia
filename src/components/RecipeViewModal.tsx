import { Recipe } from '../types';
import { X, Clock, ChefHat } from 'lucide-react';

interface RecipeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
}

export function RecipeViewModal({ isOpen, onClose, recipe }: RecipeViewModalProps) {
  if (!isOpen || !recipe) return null;

  const difficultyColors = {
    'Fácil': 'bg-green-100 text-green-800',
    'Médio': 'bg-yellow-100 text-yellow-800',
    'Difícil': 'bg-red-100 text-red-800',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-center gap-4">
            <span className="text-5xl drop-shadow-sm" role="img" aria-label={recipe.category}>
              {recipe.category}
            </span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                  <Clock size={16} className="mr-1.5 text-orange-500" />
                  {recipe.time}
                </div>
                <div className={`flex items-center text-sm px-3 py-1.5 rounded-full font-medium shadow-sm border border-transparent ${difficultyColors[recipe.difficulty]}`}>
                  <ChefHat size={16} className="mr-1.5" />
                  {recipe.difficulty}
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow custom-scrollbar">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🛒 Ingredientes
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span className="leading-relaxed">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                👨‍🍳 Modo de Preparo
              </h3>
              <ol className="space-y-4">
                {recipe.instructions.map((inst, idx) => (
                  <li key={idx} className="flex gap-4 text-gray-700">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 font-bold rounded-full text-sm mt-0.5 shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed pt-1">{inst}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 shadow-sm hover:shadow transition-all"
          >
            Fechar Receita
          </button>
        </div>
      </div>
    </div>
  );
}
