import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { LicenseModel } from './license.model';

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
