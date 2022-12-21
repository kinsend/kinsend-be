import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { HistoryImportContactController } from './history.import.contact.controller';
import { HistoryImportContact, HistoryImportContactSchema } from './history.import.contact.schema';
import { HistoryImportContacCreateAction } from './services/HistoryImportContacCreateAction.service';
import { HistoryImportContactGetByUserIdAction } from './services/HistoryImportContactGetByUserIdAction.service';

@Module({
  controllers: [HistoryImportContactController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: HistoryImportContact.name, schema: HistoryImportContactSchema },
    ]),
  ],
  providers: [HistoryImportContacCreateAction, HistoryImportContactGetByUserIdAction],
  exports: [HistoryImportContacCreateAction],
})
export class HistoryImportContactModule {}
