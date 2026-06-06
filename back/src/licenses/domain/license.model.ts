import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { LicenseMachineModel } from './license-machine.model';
import { LicenseProjectModel } from './license-project.model';
import { UserModel } from '../../users/domain/user.model';
import { CompanyModel } from '../../companies/domain/company.model';

export type LicenseType = 'CLASSIC' | 'FREE' | 'ADMIN';
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

@Entity('License')
@Unique(['userId', 'companyId'])
export class LicenseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserModel;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => CompanyModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: CompanyModel;

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

  @Column({ type: 'varchar', nullable: true })
  stripeSubscriptionId: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeProductId: string | null;

  @Column({ type: 'varchar', nullable: true })
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
