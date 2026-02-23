import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthcheckService {
  getStatus(): { status: string } {
    return { status: 'ok' };
  }
}
