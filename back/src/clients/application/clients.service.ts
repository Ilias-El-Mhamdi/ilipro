import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../domain/client.repository';

@Injectable()
export class ClientsService {
  constructor(private readonly repo: ClientRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  findByProjectId(projectId: string) {
    return this.repo.findByProjectId(projectId);
  }

  async findById(id: string) {
    const client = await this.repo.findById(id);
    if (!client) throw new NotFoundException(`Client ${id} not found`);
    return client;
  }

  create(name: string, email: string, projectId: string) {
    return this.repo.create(name, email, projectId);
  }

  async update(id: string, name: string, email: string) {
    await this.findById(id);
    return this.repo.update(id, name, email);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repo.delete(id);
  }
}
