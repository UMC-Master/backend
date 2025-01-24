import { LocationRepository } from '../repositories/location.repository.js';

export class LocationService {
  private locationRepository: LocationRepository;

  constructor() {
    this.locationRepository = new LocationRepository();
  }
}
