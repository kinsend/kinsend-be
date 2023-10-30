import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CarService } from './car.service';
import { CarPayload } from './car.payload';
import { JwtAuthGuard } from "../../../src/providers/guards/JwtAuthGuard.provider";
import { RegistrationPlateAlreadyExists, RegistrationPlateNotFound } from "./car.exceptions";

export const CAR_CONTROLLER_BASE_URL = '/test/example/car';

@Controller(CAR_CONTROLLER_BASE_URL)
export class CarController
{
    constructor(private service: CarService)
    {
    }

    /**
     * Get an existing car entity.
     * @param plateNumber
     */
    @Get('/:plateNumber')
    async getCarDetails(@Param('plateNumber') plateNumber: string)
    {
        const result = await this.service.get(plateNumber);

        if(result === null) {
            throw new RegistrationPlateNotFound(plateNumber);
        }

        return result;
    }

    /**
     * Create a new car entity (do not allow duplicates)
     *
     * @param payload
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    async saveNewCarDetails(@Body() payload: CarPayload)
    {
        const result = await this.service.get(payload.plateNumber);

        if(result !== null) {
            throw new RegistrationPlateAlreadyExists();
        }

        return this.service.createOrUpdate(payload);
    }

    /**
     * Update an existing car entity
     *
     * @param plateNumber
     * @param payload
     */
    @Post('/:plateNumber')
    @UseGuards(JwtAuthGuard)
    async updateCarDetails(@Param('plateNumber') plateNumber: string, @Body() payload: CarPayload)
    {
        const result = await this.service.get(plateNumber);

        if(result === null) {
            throw new RegistrationPlateNotFound(plateNumber);
        }

        return this.service.createOrUpdate(payload);
    }

}
