import {
  LocationAlreadyExistError,
  LocationNotFoundError,
} from '../errors/location.error.js';
import { LocationRepository } from '../repositories/location.repository.js';

export class LocationService {
  private locationRepository: LocationRepository;

  constructor() {
    this.locationRepository = new LocationRepository();
  }

  public async createLocation(location_name: string, parent_id: number) {
    // validation: 부모 존재 시 부모 유무 확인 | 중복 확인
    if (parent_id) {
      const parent = await this.locationRepository.getById(parent_id);
      if (!parent) {
        throw new LocationNotFoundError({ location_id: parent_id });
      }
    }
    const location = await this.locationRepository.getByName(location_name);
    if (location) {
      throw new LocationAlreadyExistError({ location_name: location_name });
    }

    const createdLocation = await this.locationRepository.createLocation(
      location_name,
      parent_id
    );

    return createdLocation;
  }

  public async getAll() {
    return await this.locationRepository.getAll();
  }
}
