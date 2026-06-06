import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('Project')
@Unique(['companyId', 'slug'])
export class ProjectModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  appUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  docsUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  changelogUrl: string | null;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
