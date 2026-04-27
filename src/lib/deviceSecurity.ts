// 🔐 DEVICE FINGERPRINTING SEGURO
// Gera identificação única do dispositivo usando hash SHA-256

/**
 * Gera componentes únicos do dispositivo
 */
function getDeviceComponents(): string[] {
  const components: (string | number)[] = [
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(',') || 'unknown',
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
    new Date().getTimezoneOffset(),
    (navigator as any).deviceMemory || 'unknown',
    window.screen.width,
    window.screen.height,
    window.screen.colorDepth,
    window.devicePixelRatio || 1,
  ];

  return components.map((c) => String(c));
}

/**
 * Cria hash SHA-256 do dispositivo
 * Resultado: string hexadecimal de 64 caracteres
 */
export async function generateSecureDeviceId(): Promise<string> {
  const components = getDeviceComponents().join('||');
  const encoder = new TextEncoder();
  const data = encoder.encode(components);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validar se o deviceId é válido (SHA-256 format)
 */
export function isValidDeviceId(deviceId: string): boolean {
  return /^[a-f0-9]{64}$/.test(deviceId);
}

/**
 * Armazena deviceId no sessionStorage (mais seguro que localStorage)
 * sessionStorage é limpo quando fecha a aba
 */
export async function getOrCreateSecureDeviceId(): Promise<string> {
  const sessionKey = 'deviceId_secure';
  let deviceId = sessionStorage.getItem(sessionKey);

  if (!deviceId || !isValidDeviceId(deviceId)) {
    deviceId = await generateSecureDeviceId();
    sessionStorage.setItem(sessionKey, deviceId);
  }

  return deviceId;
}

/**
 * Verifica se o dispositivo atual é o mesmo que foi armazenado
 */
export async function validateDeviceId(storedDeviceId: string): Promise<boolean> {
  if (!isValidDeviceId(storedDeviceId)) {
    return false;
  }

  const currentDeviceId = await generateSecureDeviceId();
  return currentDeviceId === storedDeviceId;
}

/**
 * Gera assinatura/HMAC para validar integridade de dados
 * Usa: validar que data não foi modificada
 */
export async function generateSignature(data: string, secret?: string): Promise<string> {
  const signSecret = secret || (await getOrCreateSecureDeviceId());
  const encoder = new TextEncoder();
  const keyData = encoder.encode(signSecret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica se a assinatura é válida
 */
export async function verifySignature(
  data: string,
  signature: string,
  secret?: string
): Promise<boolean> {
  try {
    const expectedSignature = await generateSignature(data, secret);
    // Comparação segura contra timing attacks
    return constantTimeCompare(signature, expectedSignature);
  } catch {
    return false;
  }
}

/**
 * Comparação de strings segura contra timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Session token - gerado ao login e validado a cada ação
 */
export function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * CSRF Token - previne ataques cross-site
 */
export function generateCsrfToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Armazenar e recuperar CSRF token
 */
export function getCsrfToken(): string {
  let token = sessionStorage.getItem('csrfToken');

  if (!token) {
    token = generateCsrfToken();
    sessionStorage.setItem('csrfToken', token);
  }

  return token;
}

/**
 * Validar CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  const stored = sessionStorage.getItem('csrfToken');
  return stored === token;
}
