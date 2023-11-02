import { Test, TestingModule } from "@nestjs/testing";
import { MongooseModule } from "@nestjs/mongoose";

import { closeTestModuleOrApp, MODULE_BASE_IMPORTS, MODULE_BASE_PROVIDERS } from "../testHelpers/genericHelpers";
import { CarPayload } from "./car.payload";
import { CarService } from "./car.service";
import { CarDocumentToken, CarSchema } from "./car.schema";

/**
 * <p>This is an example test case which is here only for illustration purposes.</p>
 */
describe('CarService', () =>
{

    let moduleRef: TestingModule;
    let carService: CarService;

    beforeAll(async() => {
        console.log(`MONGO_URI: ${process.env.MONGO_URI}`);

        // Prepare module
        moduleRef = await Test.createTestingModule({
            imports: [
                ...MODULE_BASE_IMPORTS,
                // Additional schema definitions.
                MongooseModule.forFeature([
                    { name: CarDocumentToken, schema: CarSchema },
                ])
            ],
            providers: [ ...MODULE_BASE_PROVIDERS, CarService ]
        }).compile();

        // Get instance references
        carService = moduleRef.get<CarService>(CarService);
    });

    afterAll(async() => await closeTestModuleOrApp(moduleRef));

    it('should save new object and return it', async() => {

        const payload: CarPayload = {
            plateNumber: '007-from-service',
            manufacture: 'Aston Martin',
            owner: 'James Bond',
        };

        // Send payload to the controller.
        await carService.createOrUpdate(payload); // we are not saving this result on purpose!

        // Retrieve the entity from the database.
        const result = await carService.get(payload.plateNumber);

        // Assert data has been saved accordingly.
        expect(result !== null).toBe(true);
        expect(result?.plateNumber).toBe(payload.plateNumber);
        expect(result?.manufacture).toBe(payload.manufacture);
        expect(result?.owner).toBe(payload.owner);

    });


    it('should update existing object and return it', async() => {

        const originalPayload: CarPayload = {
            plateNumber: '007-from-service-existing',
            manufacture: 'Aston Martin',
            owner: 'James Bond',
        };

        // Send payload
        const originalDocument = await carService.createOrUpdate(originalPayload);

        // Update existing
        const updatedPayload: CarPayload = {...originalPayload, ...{ manufacture: "AM - Updated", owner: "JB - Updated"}}
        await carService.createOrUpdate(updatedPayload); // we are not saving this result on purpose!

        // Retrieve the entity from the database.
        const result = await carService.get(originalPayload.plateNumber);

        // Assert data has been saved accordingly.
        expect(result !== null).toBe(true);
        expect(result?.id).toBe(originalDocument.id); // ensure we have updated the same document.
        expect(result?.plateNumber).toBe(updatedPayload.plateNumber);
        expect(result?.manufacture).toBe(updatedPayload.manufacture);
        expect(result?.owner).toBe(updatedPayload.owner);

    });

})