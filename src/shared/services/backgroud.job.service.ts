import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as schedule from 'node-schedule';
import { sleep } from '../../utils/sleep';

@Injectable()
export class BackgroudJobService {
  constructor(private readonly configService: ConfigService) {}

  public job(
    date: Date | string,
    delay: number | undefined,
    callback: () => Promise<void>,
    name?: string,
  ) {
    const nameJob = name || Date.now().toString();
    const job = new schedule.Job(nameJob, async () => {
      if (delay) {
        await (() => sleep(delay))();
      }
      callback();
    });
    job.schedule(date);
  }
}
