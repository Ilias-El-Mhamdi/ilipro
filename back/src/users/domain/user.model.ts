import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('User')
export class UserModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  stripeCustomerId: string | null;

  license?: unknown | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(email?: string, firstName?: string | null, lastName?: string | null) {
    if (email !== undefined) {
      this.email = email;
      this.firstName = firstName ?? null;
      this.lastName = lastName ?? null;
    }
  }
}
