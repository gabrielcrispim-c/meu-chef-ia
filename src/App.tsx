import { useState } from 'react';
import { Search, Plus, Sparkles, ChefHat } from 'lucide-react';
import { Recipe } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { RecipeCard } from './components/RecipeCard';
import { RecipeModal } from './components/RecipeModal';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { RecipeViewModal } from './components/RecipeViewModal';

export default function App() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('meuchef-recipes', []);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveRecipe = (recipeData: Omit<Recipe, 'id'>) => {
    if (editingRecipe) {
      setRecipes(recipes.map(r => r.id === editingRecipe.id ? { ...recipeData, id: r.id } : r));
    } else {
      const newRecipe: Recipe = {
        ...recipeData,
        id: crypto.randomUUID(),
      };
      setRecipes([newRecipe, ...recipes]);
    }
  };

  const handleDeleteRecipe = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      setRecipes(recipes.filter(r => r.id !== id));
    }
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingRecipe(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 text-white p-2.5 rounded-xl shadow-sm">
              <ChefHat size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Meu Chef <span className="text-orange-500">IA</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <Plus size={18} />
              Nova Receita
            </button>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 shadow-sm hover:shadow transition-all"
            >
              <Sparkles size={18} />
              <span className="hidden sm:inline">Gerar Receita com IA</span>
              <span className="sm:hidden">Gerar com IA</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8 max-w-xl mx-auto md:mx-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
              placeholder="Buscar receitas pelo nome..."
            />
          </div>
        </div>

        {/* Content */}
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="text-8xl mb-6 animate-bounce" style={{ animationDuration: '2s' }}>🍳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sua cozinha está vazia!</h2>
            <p className="text-gray-500 max-w-md mb-8 text-lg">
              Adicione suas receitas favoritas ou deixe a IA criar pratos incríveis com o que você tem na geladeira.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 shadow-sm hover:shadow transition-all"
              >
                <Sparkles size={20} />
                Gerar Primeira Receita
              </button>
              <button
                onClick={openAddModal}
                className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <Plus size={20} />
                Adicionar Manualmente
              </button>
            </div>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma receita encontrada</h3>
            <p className="text-gray-500">Tente buscar com outros termos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={setViewingRecipe}
                onEdit={openEditModal}
                onDelete={handleDeleteRecipe}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <RecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveRecipe}
        initialData={editingRecipe}
      />

      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSave={handleSaveRecipe}
      />

      <RecipeViewModal
        isOpen={!!viewingRecipe}
        onClose={() => setViewingRecipe(null)}
        recipe={viewingRecipe}
      />
    </div>
  );
}
