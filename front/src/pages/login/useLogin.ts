import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

type Step = 'email' | 'otp';

const RESEND_COOLDOWN = 30;

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    setSeconds(initialSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { seconds, start };
}

export function useLogin() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpInvalidated, setOtpInvalidated] = useState(false);
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const { seconds: cooldown, start: startCooldown } = useCountdown(RESEND_COOLDOWN);

  async function sendOtp() {
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email: email.trim() });
      toast.success('Code envoyé par email');
      setOtp('');
      setOtpInvalidated(false);
      setStep('otp');
      startCooldown();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Erreur lors de l'envoi";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(value: string) {
    if (!value.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post<{ user: { slug: string } }>('/auth/verify-otp', { email, otp: value.trim() });
      await refresh();
      navigate(`/admin/users/${data.user.slug}`, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Code invalide ou expiré';
      toast.error(msg);
      if (msg.includes('Trop de tentatives')) {
        setOtpInvalidated(true);
        setOtp('');
      }
    } finally {
      setLoading(false);
    }
  }

  function backToEmail() {
    setStep('email');
    setOtp('');
    setOtpInvalidated(false);
  }

  return {
    step,
    email, setEmail,
    otp, setOtp,
    loading,
    cooldown,
    otpInvalidated,
    sendOtp,
    verifyOtp,
    backToEmail,
  };
}
