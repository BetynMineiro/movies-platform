import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await this.usersService.findByEmail(adminEmail);

    if (!existingAdmin) {
      await this.usersService.create(adminEmail, 'Admin@123', 'admin');
      this.logger.log('Admin user created successfully');
    } else {
      this.logger.log('Admin user already exists');
    }
  }
}
