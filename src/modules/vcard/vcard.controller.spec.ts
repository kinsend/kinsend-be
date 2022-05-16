import { Test, TestingModule } from '@nestjs/testing';
import { VcardController } from './vcard.controller';

describe('VcardController', () => {
  let controller: VcardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VcardController],
    }).compile();

    controller = module.get<VcardController>(VcardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
