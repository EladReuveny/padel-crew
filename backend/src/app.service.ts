import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): {
    service: string;
    status: HttpStatus;
    message: string;
    timestamp: string;
  } {
    return {
      service: 'Padel Crew API',
      status: HttpStatus.OK,
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
