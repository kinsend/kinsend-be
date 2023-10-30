import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegistrationPlateAlreadyExists } from './car.exceptions';
import { CarPayload } from './car.payload';
import { CarDocument } from './car.schema';
import { Model } from 'mongoose';
import { dynamicUpdateModel } from "../../../src/utils/dynamicUpdateModel";

@Injectable()
export class CarService {

    constructor(@InjectModel(CarDocument.name) private readonly document: Model<CarDocument>) {
    }

    async get(plateNumber: string): Promise<CarDocument | null> {
        return this.document.findOne({plateNumber: plateNumber}).exec();
    }

    async createOrUpdate(payload: CarPayload): Promise<CarDocument> {

        // Check if entity already exists.
        const exists = await this.get(payload.plateNumber);

        if (exists) {
            dynamicUpdateModel(payload, exists);
            return exists.save();
        }

        return new this.document(payload).save();
    }

}
