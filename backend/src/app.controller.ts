import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  healthCheck(): {
    service: string;
    status: HttpStatus;
    message: string;
    timestamp: string;
  } {
    return this.appService.healthCheck();
  }
}
