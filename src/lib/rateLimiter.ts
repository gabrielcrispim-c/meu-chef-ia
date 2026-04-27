// 🛡️ RATE LIMITING - Proteção contra força bruta
// Uso: Máximo 5 tentativas por 15 minutos

interface AttemptRecord {
  timestamp: number;
}

class RateLimiter {
  private attempts: Map<string, AttemptRecord[]> = new Map();
  private readonly maxAttempts: number = 5;
  private readonly windowMs: number = 15 * 60 * 1000; // 15 minutos
  private readonly cleanupInterval: number = 60 * 60 * 1000; // 1 hora

  constructor() {
    // Limpar tentativas antigas a cada 1 hora
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Verifica se a tentativa é permitida para um identificador (email, IP, etc)
   */
  isAllowed(identifier: string): boolean {
    if (!identifier) return false;

    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];

    // Manter apenas tentativas dentro da janela
    const recentAttempts = attempts.filter(
      (attempt) => now - attempt.timestamp < this.windowMs
    );

    // Se atingiu limite, não permitir
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Adicionar nova tentativa
    recentAttempts.push({ timestamp: now });
    this.attempts.set(identifier, recentAttempts);

    return true;
  }

  /**
   * Retorna quantas tentativas restam
   */
  getRemaining(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    const now = Date.now();

    const recentAttempts = attempts.filter(
      (attempt) => now - attempt.timestamp < this.windowMs
    );

    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }

  /**
   * Retorna em quanto tempo a próxima tentativa é permitida (ms)
   */
  getRetryAfter(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    if (attempts.length === 0) return 0;

    const now = Date.now();
    const oldestAttemptInWindow = attempts
      .filter((a) => now - a.timestamp < this.windowMs)
      .sort((a, b) => a.timestamp - b.timestamp)[0];

    if (!oldestAttemptInWindow) return 0;

    const retryAfter =
      oldestAttemptInWindow.timestamp + this.windowMs - now;
    return Math.max(0, retryAfter);
  }

  /**
   * Reset de tentativas para um identificador
   * Usar após login bem-sucedido
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Reset completo (cuidado!)
   */
  resetAll(): void {
    this.attempts.clear();
  }

  /**
   * Limpar tentativas expiradas
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(
        (attempt) => now - attempt.timestamp < this.windowMs
      );

      if (validAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, validAttempts);
      }
    }
  }
}

// Instância global
export const rateLimiter = new RateLimiter();

/**
 * Formatter para mensagem de erro
 */
export function getRateLimitMessage(identifier: string): string {
  const remaining = rateLimiter.getRemaining(identifier);
  const retryAfter = Math.ceil(rateLimiter.getRetryAfter(identifier) / 1000);

  if (remaining > 0) {
    return `Tentativas restantes: ${remaining}`;
  }

  const minutes = Math.ceil(retryAfter / 60);
  return `Muitas tentativas. Tente novamente em ${minutes} minuto(s).`;
}
