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
        throw new Error(); // todo
      }
    }
    const location = await this.locationRepository.getByName(location_name);
    if (location) {
      throw new Error(); // todo
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
