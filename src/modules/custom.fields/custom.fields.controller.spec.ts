import { Test, TestingModule } from '@nestjs/testing';
import { CustomFieldsController } from './custom.fields.controller';

describe('CustomFieldsController', () => {
  let controller: CustomFieldsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomFieldsController],
    }).compile();

    controller = module.get<CustomFieldsController>(CustomFieldsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
