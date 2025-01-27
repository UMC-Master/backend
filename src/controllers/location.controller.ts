import { Router, Request, Response } from 'express';
import { LocationService } from '../services/location.service.js';
import { CreatePolicyResponseDto } from '../dtos/location.dto.js';
import { StatusCodes } from 'http-status-codes';

export class LocationController {
  private locationService: LocationService;
  public router: Router;

  constructor() {
    this.locationService = new LocationService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/api/v1/locations', this.createLocation.bind(this));
  }

  private async createLocation(req: Request, res: Response) {
    const location: string = req.body.location_name;
    const parent_id: number = +req.body.parent_id;

    const savedLocation = await this.locationService.createLocation(
      location,
      parent_id
    );

    const output: CreatePolicyResponseDto = {
      location_id: savedLocation.location_id,
      name: savedLocation.name,
      parent: {
        id: savedLocation.parent.parent_id,
        name: savedLocation.parent.name,
      },
    };

    res.status(StatusCodes.OK).success(output);
  }

  private async getAllLocation(req: Request, res: Response) {
    
  }
}
