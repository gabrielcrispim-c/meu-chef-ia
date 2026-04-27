import { useState, FormEvent } from 'react';
import { ChefHat, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  signUpWithOTP, 
  signInWithDeviceDetection,
} from '../services/auth';
import { sanitizeEmail, sanitizeInput, validatePassword } from '../lib/sanitize';
import { validateAuth, getPasswordStrength, getPasswordStrengthLabel } from '../lib/validation';
import { EmailConfirmationModal } from './EmailConfirmationModal';

export function Login() {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Sanitizar inputs
      const cleanEmail = sanitizeInput(email.trim()).toLowerCase();
      const cleanPassword = password; // Não sanitizar senha para não quebrar caracteres especiais
      
      // Validar com schema
      const validation = validateAuth({ email: cleanEmail, password: cleanPassword });
      if (!validation.success) {
        setError(validation.error ?? 'Erro de validação');
        setLoading(false);
        return;
      }

      if (isLoginMode) {
        // Login com detecção de dispositivo
        const result = await signInWithDeviceDetection(cleanEmail, cleanPassword);
        if (!result.success) {
          setError(result.error);
        } else {
          setSuccessMsg('Login realizado com sucesso! Redirecionando...');
          // Limpar formulário
          setEmail('');
          setPassword('');
          setTimeout(() => {
            // Aqui você pode redirecionar para home ou dashboard
            window.location.reload();
          }, 1500);
        }
      } else {
        // Signup com OTP
        const result = await signUpWithOTP(cleanEmail, cleanPassword);
        if (!result.success) {
          setError(result.error);
        } else {
          if (result.needsEmailConfirmation) {
            setPendingEmail(cleanEmail);
            setShowEmailConfirmation(true);
            setSuccessMsg('Conta criada! Verifique seu email para o código de confirmação.');
          } else {
            setSuccessMsg('Conta criada com sucesso! Você já pode fazer login.');
            // Limpar formulário
            setEmail('');
            setPassword('');
            setPasswordStrength(0);
            setIsLoginMode(true);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    if (!isLoginMode) {
      // Mostrar força da senha apenas no signup
      const strength = getPasswordStrength(newPassword);
      setPasswordStrength(strength);
    }
  };

  const handleEmailConfirmed = async () => {
    setShowEmailConfirmation(false);
    setEmail('');
    setPassword('');
    setSuccessMsg('Email confirmado com sucesso! Agora você pode fazer login.');
    setIsLoginMode(true);
    
    // Auto-login se possível
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setSuccessMsg('Você já está logado!');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 font-sans text-gray-900">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-500 text-white p-3.5 rounded-2xl shadow-md mb-4">
            <ChefHat size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Meu Chef <span className="text-orange-500">IA</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {isLoginMode ? 'Acesse sua conta para continuar' : 'Crie sua conta para começar'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm text-center">
                {successMsg}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-900"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Indicador de força de senha (apenas no signup) */}
              {!isLoginMode && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Força da senha:</span>
                    <span className={`font-medium ${
                      passwordStrength < 40 ? 'text-red-600' :
                      passwordStrength < 60 ? 'text-yellow-600' :
                      passwordStrength < 80 ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {getPasswordStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength < 40 ? 'w-1/4 bg-red-500' :
                        passwordStrength < 60 ? 'w-2/4 bg-yellow-500' :
                        passwordStrength < 80 ? 'w-3/4 bg-blue-500' :
                        'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  
                  {/* Requisitos de senha */}
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <p className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                      <span>{password.length >= 8 ? '✓' : '○'}</span> Mínimo 8 caracteres
                    </p>
                    <p className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                      <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span> Letra MAIÚSCULA
                    </p>
                    <p className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                      <span>{/[a-z]/.test(password) ? '✓' : '○'}</span> Letra minúscula
                    </p>
                    <p className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                      <span>{/[0-9]/.test(password) ? '✓' : '○'}</span> Número
                    </p>
                    <p className={`flex items-center gap-1 ${/[!@#$%^&*]/.test(password) ? 'text-green-600' : ''}`}>
                      <span>{/[!@#$%^&*]/.test(password) ? '✓' : '○'}</span> Caractere especial (!@#$%^&*)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 mt-2 text-base font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isLoginMode ? 'Entrar' : 'Criar conta')}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">
                {isLoginMode ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="w-full flex items-center justify-center py-3.5 px-4 text-base font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              {isLoginMode ? 'Criar nova conta' : 'Fazer login'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Email */}
      {showEmailConfirmation && (
        <EmailConfirmationModal
          email={pendingEmail}
          onConfirmed={handleEmailConfirmed}
          onCancel={() => setShowEmailConfirmation(false)}
        />
      )}
    </>
  );
}
