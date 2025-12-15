import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor(
    private usersService: UsersService, // ✅ Use service, not repository
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupUsers() {
    try {
      const deleted = await this.usersService.deleteUnactivatedUsers(); // ✅ Clean interface
      if (deleted > 0) {
        console.log(`Deleted ${deleted} unactivated user(s)`);
      }
    } catch (error) {}
  }
}
