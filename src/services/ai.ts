import { GoogleGenAI, Type } from '@google/genai';
import { Recipe } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateRecipe(ingredients: string): Promise<Omit<Recipe, 'id'>> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crie uma receita culinária deliciosa focada nos seguintes ingredientes: ${ingredients}. Você pode incluir ingredientes básicos de despensa (sal, pimenta, azeite, alho, cebola, etc).`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'Nome criativo e apetitoso da receita',
          },
          category: {
            type: Type.STRING,
            description: 'Um emoji que represente a categoria do prato (ex: 🍗, 🥩, 🐟, 🥗, 🍝, 🍰, 🍲, 🌮)',
          },
          ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Lista de ingredientes com quantidades',
          },
          instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Passo a passo do modo de preparo',
          },
          time: {
            type: Type.STRING,
            description: 'Tempo estimado de preparo (ex: 30 min, 1 hora)',
          },
          difficulty: {
            type: Type.STRING,
            enum: ['Fácil', 'Médio', 'Difícil'],
            description: 'Nível de dificuldade',
          },
        },
        required: ['name', 'category', 'ingredients', 'instructions', 'time', 'difficulty'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Falha ao gerar receita');
  }

  return JSON.parse(text);
}
