import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

export type LicenseType = 'CLASSIC' | 'FREE' | 'ADMIN';
export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

@Entity('LicenseMachine')
@Unique(['licenseId', 'machineId'])
export class LicenseMachineModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  licenseId: string;

  @Column()
  machineId: string;

  @Column({ nullable: true })
  label: string | null;

  @CreateDateColumn()
  activatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  lastSeenAt: Date | null;

  @ManyToOne(() => LicenseModel, (l) => l.machines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'licenseId' })
  license: LicenseModel;
}

@Entity('LicenseProject')
@Unique(['licenseId', 'projectId'])
export class LicenseProjectModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  licenseId: string;

  @Column()
  projectId: string;

  @ManyToOne(() => LicenseModel, (l) => l.projectAccess, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'licenseId' })
  license: LicenseModel;
}

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
