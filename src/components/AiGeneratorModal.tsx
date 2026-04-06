import { useState } from 'react';
import { Recipe } from '../types';
import { generateRecipe } from '../services/ai';
import { X, Sparkles, Loader2, Check } from 'lucide-react';

interface AiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id'>) => void;
}

export function AiGeneratorModal({ isOpen, onClose, onSave }: AiGeneratorModalProps) {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Omit<Recipe, 'id'> | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!ingredientsInput.trim()) {
      setError('Por favor, digite alguns ingredientes.');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    setGeneratedRecipe(null);
    
    try {
      const recipe = await generateRecipe(ingredientsInput);
      setGeneratedRecipe(recipe);
    } catch (err) {
      setError('Ops! Não consegui gerar a receita. Tente novamente.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (generatedRecipe) {
      onSave(generatedRecipe);
      onClose();
      // Reset state for next time
      setTimeout(() => {
        setIngredientsInput('');
        setGeneratedRecipe(null);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Gerar Receita com IA
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow custom-scrollbar">
          {!generatedRecipe ? (
            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-gray-800 mb-3">
                  O que você tem na geladeira?
                </label>
                <textarea
                  value={ingredientsInput}
                  onChange={(e) => setIngredientsInput(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all min-h-[120px] resize-y text-lg"
                  placeholder="Ex: frango, batata, creme de leite, alho, cebola..."
                  disabled={isGenerating}
                />
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              </div>

              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <p className="text-sm text-orange-800 flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">💡</span>
                  Dica: A IA vai usar esses ingredientes como base, mas pode adicionar itens básicos de despensa como sal, óleo e temperos para deixar a receita perfeita!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center pb-6 border-b border-gray-100">
                <span className="text-6xl mb-4 block">{generatedRecipe.category}</span>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">{generatedRecipe.name}</h3>
                <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-600">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">{generatedRecipe.time}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">{generatedRecipe.difficulty}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    🛒 Ingredientes
                  </h4>
                  <ul className="space-y-2">
                    {generatedRecipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-orange-500 mt-1">•</span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    👨‍🍳 Modo de Preparo
                  </h4>
                  <ol className="space-y-4">
                    {generatedRecipe.instructions.map((inst, idx) => (
                      <li key={idx} className="flex gap-3 text-gray-700">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-orange-100 text-orange-600 font-semibold rounded-full text-sm mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{inst}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          {!generatedRecipe ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !ingredientsInput.trim()}
              className="w-full md:w-auto px-8 py-3.5 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Criando mágica...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Gerar Receita
                </>
              )}
            </button>
          ) : (
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setGeneratedRecipe(null)}
                className="flex-1 md:flex-none px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Tentar Outra
              </button>
              <button
                onClick={handleSave}
                className="flex-1 md:flex-none px-8 py-3 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Salvar no Catálogo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
