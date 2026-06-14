import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { LicenseEntity } from './license.entity';

@Entity('LicenseProject')
@Unique(['licenseId', 'projectId'])
export class LicenseProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  licenseId: string;

  @Column()
  projectId: string;

  @ManyToOne(() => LicenseEntity, (l) => l.projectAccess, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'licenseId' })
  license: LicenseEntity;
}
