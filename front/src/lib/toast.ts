import { toast } from 'sonner';
import type { AxiosError } from 'axios';

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(err: unknown) {
  const axiosErr = err as AxiosError<{ message?: string | string[] }>;
  const raw = axiosErr?.response?.data?.message;
  const message = Array.isArray(raw) ? raw[0] : (raw ?? 'Une erreur est survenue');
  toast.error(message);
}
