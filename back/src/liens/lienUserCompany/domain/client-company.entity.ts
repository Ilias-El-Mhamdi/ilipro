import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('ClientCompany')
@Unique(['clientId', 'companyId'])
export class ClientCompanyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;
}
