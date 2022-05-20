import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { Transform } from 'class-transformer';

export type TagsDocument = Tags & Document;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Tags {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  @Transform(({ value }) => value.toString())
  userId: string;

  @Prop()
  name: string;

  @Prop({ default: 0, type: Number })
  contacts: number;

  @Prop({ default: 0, type: Number })
  unknow: number;

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;

  @Prop({ default: Date.now(), type: Date })
  updatedAt: Date;
}

const TagsSchema = SchemaFactory.createForClass(Tags);

TagsSchema.index({ userId: 'text', name: 'text' });

export { TagsSchema };
