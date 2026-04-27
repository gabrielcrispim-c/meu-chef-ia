import { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, ChefHat, LogOut, Moon, Sun } from 'lucide-react';
import { Recipe } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { RecipeCard } from './components/RecipeCard';
import { RecipeModal } from './components/RecipeModal';
import { AiGeneratorModal } from './components/AiGeneratorModal';
import { RecipeViewModal } from './components/RecipeViewModal';
import { Login } from './components/Login';
import { supabase } from './lib/supabase';

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('theme', false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (session?.user) fetchRecipes();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRecipes();
      } else {
        setRecipes([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const fetchRecipes = async () => {
    const { data, error } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setRecipes(data as Recipe[]);
    }
  };
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveRecipe = async (recipeData: Omit<Recipe, 'id'>) => {
    if (!user) return;
    
    if (editingRecipe) {
      const { error } = await supabase
        .from('recipes')
        .update(recipeData)
        .eq('id', editingRecipe.id);
        
      if (!error) {
        setRecipes(recipes.map(r => r.id === editingRecipe.id ? { ...recipeData, id: r.id } as Recipe : r));
      }
    } else {
      const { data, error } = await supabase
        .from('recipes')
        .insert([{ ...recipeData, user_id: user.id }])
        .select()
        .single();
        
      if (!error && data) {
        setRecipes([data as Recipe, ...recipes]);
      }
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (!error) {
        setRecipes(prevRecipes => prevRecipes.filter(r => r.id !== id));
      }
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]"><span className="text-gray-500">Carregando...</span></div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#FAFAFA] text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-slate-900/20' : 'bg-white border-gray-100'} sticky top-0 z-30 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 text-white p-2.5 rounded-xl shadow-sm shadow-orange-500/20">
              <ChefHat size={28} />
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              Meu Chef <span className="text-orange-600">IA</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className={`hidden md:flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isDarkMode ? 'text-slate-100 bg-slate-700 border border-slate-600 hover:bg-slate-600 hover:text-white' : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
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
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={`flex items-center justify-center p-2.5 rounded-xl transition-all ml-1 ${isDarkMode ? 'text-amber-300 bg-slate-700 hover:bg-slate-600 border border-slate-600' : 'text-gray-600 bg-slate-100 hover:bg-gray-200 border border-slate-200'}`}
              title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className={`flex items-center justify-center p-2.5 rounded-xl transition-all ml-1 ${isDarkMode ? 'text-slate-100 bg-slate-700 hover:bg-slate-600 border border-slate-600' : 'text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200'}`}
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8 max-w-xl mx-auto md:mx-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`block w-full pl-11 pr-4 py-3.5 rounded-2xl shadow-sm transition-all ${isDarkMode ? 'bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'}`}
              placeholder="Buscar receitas pelo nome..."
            />
          </div>
        </div>

        {/* Content */}
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="text-8xl mb-6 animate-bounce" style={{ animationDuration: '2s' }}>🍳</div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} mb-3`}>Sua cozinha está vazia!</h2>
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'} max-w-md mb-8 text-lg`}>
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
                className={`flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl border transition-all ${isDarkMode ? 'text-slate-200 bg-slate-700 border-slate-600 hover:bg-slate-600' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <Plus size={20} />
                Adicionar Manualmente
              </button>
            </div>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={`text-xl font-medium ${isDarkMode ? 'text-slate-100' : 'text-gray-900'} mb-2`}>Nenhuma receita encontrada</h3>
            <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Tente buscar com outros termos.</p>
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
                isDarkMode={isDarkMode}
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
        isDarkMode={isDarkMode}
      />

      <RecipeViewModal
        isOpen={!!viewingRecipe}
        onClose={() => setViewingRecipe(null)}
        recipe={viewingRecipe}
      />
    </div>
  );
}
