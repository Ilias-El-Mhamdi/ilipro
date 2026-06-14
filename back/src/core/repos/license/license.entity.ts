import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { LicenseMachineEntity } from './licenseMachine.entity';
import { LicenseProjectEntity } from './licenseProject.entity';
import { UserEntity } from '../user/user.entity';
import { CompanyEntity } from '../company/company.entity';

export type LicenseType = 'CLASSIC' | 'FREE' | 'ADMIN';
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

@Entity('License')
@Unique(['userId', 'companyId'])
export class LicenseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: CompanyEntity;

  @Column('varchar')
  type: LicenseType;

  @Column('varchar')
  status: LicenseStatus;

  @OneToMany(() => LicenseProjectEntity, (lp) => lp.license)
  projectAccess: LicenseProjectEntity[];

  @Column({ default: false })
  machineLock: boolean;

  @Column({ default: 1 })
  maxMachines: number;

  @OneToMany(() => LicenseMachineEntity, (m) => m.license)
  machines: LicenseMachineEntity[];

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
