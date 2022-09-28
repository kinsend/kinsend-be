import { Test, TestingModule } from '@nestjs/testing';
import { SmsHookController } from './sms.hook.controller';

describe('SmsHookController', () => {
  let controller: SmsHookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmsHookController],
    }).compile();

    controller = module.get<SmsHookController>(SmsHookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
