import { Test, TestingModule } from '@nestjs/testing';
import { FormSubmissionController } from './form.submission.controller';

describe('FormSubmissionController', () => {
  let controller: FormSubmissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormSubmissionController],
    }).compile();

    controller = module.get<FormSubmissionController>(FormSubmissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
