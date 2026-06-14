import { api } from './api';

export function initials(
  firstName: string | null,
  lastName: string | null,
): string {
  return (
    (firstName?.[0] ?? '').toUpperCase() + (lastName?.[0] ?? '').toUpperCase()
  );
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export async function downloadDeliverable(
  apiPath: string,
  filename: string,
): Promise<void> {
  const { data } = await api.get<{ url: string }>(apiPath);
  const a = document.createElement('a');
  a.href = data.url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function scrollAndHighlight(userId: string): void {
  const el = document.getElementById(`user-${userId}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.style.transition = 'box-shadow 0.2s ease';
  el.style.boxShadow = '0 0 0 2px #818cf8, 0 0 16px 2px #818cf840';
  setTimeout(() => {
    el.style.boxShadow = '';
  }, 1500);
}
