import { useState, useEffect, FormEvent } from 'react';
import { Recipe } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id'>) => void;
  initialData?: Recipe | null;
}

export function RecipeModal({ isOpen, onClose, onSave, initialData }: RecipeModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('🍲');
  const [time, setTime] = useState('');
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>('Fácil');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState<string[]>(['']);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setTime(initialData.time);
      setDifficulty(initialData.difficulty);
      setIngredients(initialData.ingredients.length ? initialData.ingredients : ['']);
      setInstructions(initialData.instructions.length ? initialData.instructions : ['']);
    } else {
      setName('');
      setCategory('🍲');
      setTime('');
      setDifficulty('Fácil');
      setIngredients(['']);
      setInstructions(['']);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients.length ? newIngredients : ['']);
  };
  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleAddInstruction = () => setInstructions([...instructions, '']);
  const handleRemoveInstruction = (index: number) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions.length ? newInstructions : ['']);
  };
  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({
      name,
      category,
      time,
      difficulty,
      ingredients: ingredients.filter(i => i.trim() !== ''),
      instructions: instructions.filter(i => i.trim() !== ''),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900">
            {initialData ? 'Editar Receita' : 'Nova Receita'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow custom-scrollbar">
          <form id="recipe-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Receita</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  placeholder="Ex: Strogonoff de Frango"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                <input
                  required
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-center text-2xl"
                  placeholder="🍲"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Preparo</label>
                <input
                  required
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  placeholder="Ex: 45 min"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dificuldade</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Recipe['difficulty'])}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Médio">Médio</option>
                  <option value="Difícil">Difícil</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Ingredientes</label>
              </div>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      required
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="Ex: 500g de peito de frango"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <Plus size={16} className="mr-1" /> Adicionar Ingrediente
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Modo de Preparo</label>
              </div>
              <div className="space-y-3">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 font-semibold rounded-full mt-2">
                      {index + 1}
                    </span>
                    <textarea
                      required
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all min-h-[80px] resize-y"
                      placeholder="Descreva este passo..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(index)}
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors h-fit mt-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <Plus size={16} className="mr-1" /> Adicionar Passo
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="recipe-form"
            className="px-6 py-3 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 shadow-sm hover:shadow transition-all"
          >
            Salvar Receita
          </button>
        </div>
      </div>
    </div>
  );
}
