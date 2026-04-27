// 🔒 SANITIZAÇÃO DE INPUTS - Proteção contra XSS
// Instalar: npm install dompurify
// npm install --save-dev @types/dompurify

import DOMPurify from 'dompurify';

/**
 * Sanitiza entrada de texto removendo HTML/scripts
 * Usa: email, password, etc
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();
}

/**
 * Sanitiza HTML seguro (apenas tags básicas)
 * Usa: mensagens, descrições
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Remove toda formatação HTML
 * Usa: nomes, títulos
 */
export function stripHtml(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = sanitizeHtml(html);
  return temp.textContent || temp.innerText || '';
}

/**
 * Valida e sanitiza email
 */
export function sanitizeEmail(email: string): string {
  const cleaned = sanitizeInput(email.toLowerCase());
  
  // Validar formato básico
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    throw new Error('Email inválido');
  }
  
  return cleaned;
}

/**
 * Valida senha (sem sanitizar, para não quebrar caracteres especiais)
 */
export function validatePassword(password: string): boolean {
  // Mínimo 8 caracteres
  if (password.length < 8) return false;
  
  // Pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) return false;
  
  // Pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) return false;
  
  // Pelo menos um número
  if (!/[0-9]/.test(password)) return false;
  
  return true;
}

/**
 * Escapar HTML para exibição segura
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
