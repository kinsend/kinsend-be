/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as schedule from 'node-schedule';

@Injectable()
export class BackgroudJobService {
  constructor(private readonly configService: ConfigService) {}

  public async job(
    time: string,
    delay: number | undefined,
    callback: () => Promise<any>,
  ): Promise<any> {
    const job = schedule.scheduleJob(time, (fireDate) => {
      if (delay) {
        console.log('Delay');
        this.sleep(delay);
      }
      console.log(`This job was supposed to run at ${fireDate}, but actually ran at ${new Date()}`);
      callback();
    });
  }

  private sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
