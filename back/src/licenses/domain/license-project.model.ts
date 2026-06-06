import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { LicenseModel } from './license.model';

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
