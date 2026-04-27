import { supabase } from '../lib/supabase';
import { 
  getOrCreateSecureDeviceId,
  generateSignature,
  verifySignature,
  getCsrfToken 
} from '../lib/deviceSecurity';
import { sanitizeEmail } from '../lib/sanitize';
import { validateAuth } from '../lib/validation';
import { rateLimiter } from '../lib/rateLimiter';

// Marcar dispositivo como confiável (usando sessionStorage)
export async function trustDevice(userId: string): Promise<void> {
  const deviceId = await getOrCreateSecureDeviceId();
  const trustedDevices = JSON.parse(sessionStorage.getItem('trustedDevices') || '{}');
  
  // Criar registro com assinatura
  const record = {
    userId,
    deviceId,
    trustedAt: new Date().toISOString(),
  };
  
  const recordJson = JSON.stringify(record);
  const signature = await generateSignature(recordJson);
  
  trustedDevices[userId] = {
    ...record,
    signature, // Detectar manipulação
  };
  
  sessionStorage.setItem('trustedDevices', JSON.stringify(trustedDevices));
}

// Verificar se dispositivo é confiável
export async function isDeviceTrusted(userId: string): Promise<boolean> {
  try {
    const deviceId = await getOrCreateSecureDeviceId();
    const trustedDevices = JSON.parse(sessionStorage.getItem('trustedDevices') || '{}');
    
    if (!trustedDevices[userId]) {
      return false;
    }
    
    // Validar integridade com assinatura
    const stored = trustedDevices[userId];
    const recordJson = JSON.stringify({
      userId,
      deviceId: stored.deviceId,
      trustedAt: stored.trustedAt,
    });
    
    const isValid = await verifySignature(recordJson, stored.signature);
    
    if (!isValid) {
      console.warn('⚠️ Possível manipulação de deviceId detectada');
      trustedDevices[userId] = null;
      sessionStorage.setItem('trustedDevices', JSON.stringify(trustedDevices));
      return false;
    }
    
    return stored.deviceId === deviceId;
  } catch (err) {
    console.error('Erro ao verificar dispositivo:', err);
    return false;
  }
}

// Signup com OTP e proteções
export async function signUpWithOTP(email: string, password: string) {
  try {
    // 1. Rate limiting
    if (!rateLimiter.isAllowed(`signup_${email}`)) {
      return {
        success: false,
        error: `Muitas tentativas. ${rateLimiter.getRemaining(`signup_${email}`)} tentativas restantes.`,
      };
    }

    // 2. Validação com schema
    const validation = validateAuth({ email, password });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // 3. Sanitizar input
    const cleanEmail = sanitizeEmail(email);

    // 4. CSRF token
    const csrfToken = getCsrfToken();

    // 5. Criar usuário
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: validation.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          csrfToken, // Adicional validação
        },
      },
    });

    if (signUpError) throw signUpError;

    return {
      success: true,
      user: signUpData.user,
      needsEmailConfirmation: !signUpData.session,
      message: 'Conta criada! Verifique seu email para confirmar.',
    };
  } catch (error: any) {
    console.error('Erro no signup:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar conta',
    };
  }
}

// Login com verificação de dispositivo e proteções
export async function signInWithDeviceDetection(email: string, password: string) {
  try {
    // 1. Rate limiting (mais stricto para login)
    if (!rateLimiter.isAllowed(`signin_${email}`)) {
      const remaining = rateLimiter.getRemaining(`signin_${email}`);
      const retryAfter = Math.ceil(rateLimiter.getRetryAfter(`signin_${email}`) / 1000 / 60);
      
      return {
        success: false,
        error: `Muitas tentativas. Tente novamente em ${retryAfter} minuto(s). (${remaining} tentativas restantes)`,
      };
    }

    // 2. Validação com schema
    const validation = validateAuth({ email, password });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // 3. Sanitizar input
    const cleanEmail = sanitizeEmail(email);

    // 4. CSRF token
    const csrfToken = getCsrfToken();
    if (!csrfToken) {
      return {
        success: false,
        error: 'Erro de segurança: CSRF inválido',
      };
    }

    // 5. Fazer login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: validation.data.password,
    });

    if (error) {
      // Não resetar rate limit em caso de erro
      throw error;
    }

    if (data.user && data.session) {
      // 6. Marcar dispositivo como confiável após login bem-sucedido
      await trustDevice(data.user.id);
      
      // Reset do rate limiter em sucesso
      rateLimiter.reset(`signin_${email}`);

      return {
        success: true,
        user: data.user,
        session: data.session,
        deviceTrusted: true,
      };
    }

    return {
      success: false,
      error: 'Falha ao fazer login',
    };
  } catch (error: any) {
    console.error('Erro no signin:', error);
    return {
      success: false,
      error:
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos'
          : error.message || 'Erro ao fazer login',
    };
  }
}

// Verificar se usuário precisa confirmar email
export async function checkEmailConfirmationStatus() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user) {
    return { confirmed: false, email: null };
  }

  return {
    confirmed: !!session.user.email_confirmed_at,
    email: session.user.email,
    emailConfirmedAt: session.user.email_confirmed_at,
  };
}

// Reenviar código de confirmação de email
export async function resendConfirmationEmail(email: string) {
  try {
    // Nota: Este endpoint pode não estar disponível por padrão no Supabase
    // Você pode precisar criar uma função RPC customizada
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) throw error;

    return { success: true, message: 'Email de confirmação enviado!' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
