import { useState, useEffect, FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ConfirmationModalProps {
  email: string;
  onConfirmed: () => void;
  onCancel: () => void;
}

export function EmailConfirmationModal({ email, onConfirmed, onCancel }: ConfirmationModalProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [resendAvailable, setResendAvailable] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setResendAvailable(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: verificationCode,
        type: 'signup',
      });

      if (verifyError) throw verifyError;
      onConfirmed();
    } catch (err: any) {
      setError(err.message || 'Código inválido.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (resendError) throw resendError;
      setTimeLeft(300);
      setResendAvailable(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-6">Confirme seu Email</h2>
        
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Código de 8 dígitos</label>
            <input
              type="text"
              maxLength={8} // Ajustado para 8
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="00000000"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-xl"
            />
          </div>

          <button
            type="submit"
            // Ajustado para habilitar apenas com 8 dígitos
            disabled={loading || verificationCode.length !== 8}
            className="w-full py-3 bg-orange-500 text-white rounded-xl disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Confirmar Email'}
          </button>
        </form>
        
        <button onClick={onCancel} className="w-full mt-4 py-3 bg-gray-100 rounded-xl">Cancelar</button>
      </div>
    </div>
  );
}