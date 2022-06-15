import { Test, TestingModule } from '@nestjs/testing';
import { CNAMEController } from './cname.controller';

describe('CNAMEController', () => {
  let controller: CNAMEController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CNAMEController],
    }).compile();

    controller = module.get<CNAMEController>(CNAMEController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
