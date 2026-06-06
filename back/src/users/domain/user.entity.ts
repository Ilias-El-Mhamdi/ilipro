import type { UserModel } from './user.model';

export class UserEntity {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;

  static fromModel(model: UserModel): UserEntity {
    const entity = new UserEntity();
    entity.id = model.id;
    entity.slug = model.slug;
    entity.firstName = model.firstName;
    entity.lastName = model.lastName;
    entity.email = model.email;
    entity.stripeCustomerId = model.stripeCustomerId;
    entity.createdAt = model.createdAt;
    entity.updatedAt = model.updatedAt;
    return entity;
  }

  toModel(): UserModel {
    return {
      id: this.id,
      slug: this.slug,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      stripeCustomerId: this.stripeCustomerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
