import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Unique } from 'typeorm';
import { LicenseMachineModel } from './license-machine.model';
import { LicenseProjectModel } from './license-project.model';

export type LicenseType = 'CLASSIC' | 'FREE' | 'ADMIN';
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

@Entity('License')
@Unique(['clientId', 'companyId'])
export class LicenseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @Column()
  companyId: string;

  @Column('varchar')
  type: LicenseType;

  @Column('varchar')
  status: LicenseStatus;

  @OneToMany(() => LicenseProjectModel, (lp) => lp.license)
  projectAccess: LicenseProjectModel[];

  @Column({ default: false })
  machineLock: boolean;

  @Column({ default: 1 })
  maxMachines: number;

  @OneToMany(() => LicenseMachineModel, (m) => m.license)
  machines: LicenseMachineModel[];

  @Column({ nullable: true })
  stripeSubscriptionId: string | null;

  @Column({ nullable: true })
  stripeProductId: string | null;

  @Column({ nullable: true })
  priceLabel: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  currentPeriodEnd: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  validUntil: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
