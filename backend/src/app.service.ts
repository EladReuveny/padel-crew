import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck(): {
    service: string;
    status: HttpStatus;
    message: string;
    timestamp: string;
  } {
    return {
      service: 'Padel Crew API',
      status: HttpStatus.OK,
      message: 'Service is healthy',
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }),
    };
  }
}
