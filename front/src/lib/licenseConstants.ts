import type { LicenseType, LicenseStatus } from './queries';

export const TYPE_BADGE: Record<LicenseType, { label: string; className: string }> = {
  FREE:    { label: 'Free',    className: 'bg-green-900/40 text-green-300 border border-green-800' },
  CLASSIC: { label: 'Classic', className: 'bg-blue-900/40 text-blue-300 border border-blue-800' },
  ADMIN:   { label: 'Admin',   className: 'bg-red-900/40 text-red-300 border border-red-800' },
};

export const STATUS_COLOR: Record<LicenseStatus, string> = {
  ACTIVE:    'text-green-400',
  EXPIRED:   'text-red-400',
  CANCELLED: 'text-gray-500',
};

export const STATUS_DOT: Record<LicenseStatus, string> = {
  ACTIVE:    'bg-green-400',
  EXPIRED:   'bg-red-400',
  CANCELLED: 'bg-gray-500',
};

export const STATUS_LABEL: Record<LicenseStatus, string> = {
  ACTIVE:    'Actif',
  EXPIRED:   'Expiré',
  CANCELLED: 'Annulé',
};
