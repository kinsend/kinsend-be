import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {CarPayload} from './car.payload';
import {Document} from "mongoose";

@Schema({ collection: 'car_details' })
export class CarDocument extends Document implements CarPayload {
    @Prop()
    plateNumber: string;
    @Prop()
    manufacture: string;
    @Prop()
    owner: string;
}

export const CarSchema = SchemaFactory.createForClass(CarDocument);

export const CarDocumentToken = CarDocument.name;