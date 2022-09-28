import { Test, TestingModule } from '@nestjs/testing';
import { VirtualCardController } from './virtual.card.controller';

describe('VirtualCardController', () => {
  let controller: VirtualCardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VirtualCardController],
    }).compile();

    controller = module.get<VirtualCardController>(VirtualCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
