// Read model spécifique au userDashboard : gestion de l'activation machine + lecture de licence.
// Contient de la logique métier (machineLock, maxMachines) absente du ILicenseReaderRepo standard.
// Placé dans core/repos/ pour respecter le pattern abstraction/implémentation du projet.
import type { LicenseEntity } from '../license/license.entity';

export abstract class IReadLicenseRepo {
  abstract findByUserId(userId: string): Promise<LicenseEntity>;
  abstract activate(licenseKey: string, machineId: string, label?: string): Promise<{ valid: true }>;
}
