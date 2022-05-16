import { Test, TestingModule } from '@nestjs/testing';
import { VCardController } from './vcard.controller';

describe('VCardController', () => {
  let controller: VCardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VCardController],
    }).compile();

    controller = module.get<VCardController>(VCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
