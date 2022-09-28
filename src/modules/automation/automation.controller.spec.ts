import { Test, TestingModule } from '@nestjs/testing';
import { AutomationController } from './automation.controller';

describe('AutomationController', () => {
  let controller: AutomationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutomationController],
    }).compile();

    controller = module.get<AutomationController>(AutomationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
