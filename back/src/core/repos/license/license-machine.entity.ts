import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { LicenseEntity } from './license.entity';

@Entity('LicenseMachine')
@Unique(['licenseId', 'machineId'])
export class LicenseMachineEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  licenseId: string;

  @Column()
  machineId: string;

  @Column({ type: 'varchar', nullable: true })
  label: string | null;

  @CreateDateColumn()
  activatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  lastSeenAt: Date | null;

  @ManyToOne(() => LicenseEntity, (l) => l.machines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'licenseId' })
  license: LicenseEntity;
}
