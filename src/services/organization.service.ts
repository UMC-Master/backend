import { OrganizationRepository } from '../repositories/organization.repository.js';

export class OrganizationService {
  private organizationRepository: OrganizationRepository;

  constructor() {
    this.organizationRepository = new OrganizationRepository();
  }
}
