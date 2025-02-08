import { LocationNotFoundError } from '../errors/location.error.js';
import {
  OrganizationAlreadyExistError,
  OrganizationNotFoundError,
} from '../errors/organization.error.js';
import { LocationRepository } from '../repositories/location.repository.js';
import { OrganizationRepository } from '../repositories/organization.repository.js';

export class OrganizationService {
  private organizationRepository: OrganizationRepository;
  private locationRepository: LocationRepository;

  constructor() {
    this.organizationRepository = new OrganizationRepository();
    this.locationRepository = new LocationRepository();
  }

  public async createOrganization(
    organization_name: string,
    location_id: number
  ) {
    // validation: 행정 구역 유무 확인 | 중복 확인
    const location = await this.locationRepository.getById(+location_id);
    if (!location) {
      throw new LocationNotFoundError({ location_id: location_id });
    }

    const organization =
      await this.organizationRepository.getByName(organization_name);
    if (organization) {
      throw new OrganizationAlreadyExistError({
        organization_name: organization_name,
      });
    }

    const createdOrganization =
      await this.organizationRepository.createOrganization(
        organization_name,
        location_id
      );

    return createdOrganization;
  }

  public async getAll() {
    return await this.organizationRepository.getAll();
  }
}
