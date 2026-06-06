import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { UserModel } from '../../../users/domain/user.model';
import { CompanyModel } from '../../../companies/domain/company.model';

@Entity('UserCompany')
@Unique(['userId', 'companyId'])
export class UserCompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserModel;

  @Column()
  companyId: string;

  @ManyToOne(() => CompanyModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: CompanyModel;

  @CreateDateColumn()
  createdAt: Date;
}
