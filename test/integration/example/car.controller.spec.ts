import { HttpStatus } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { NestApplication } from "@nestjs/core";
import * as supertest from 'supertest';

import { CAR_CONTROLLER_BASE_URL, CarController } from './car.controller';
import { CarDocument, CarDocumentToken, CarSchema } from './car.schema';
import { CarPayload } from './car.payload';
import { CarService } from './car.service';
import { RegistrationPlateAlreadyExists, RegistrationPlateNotFound } from './car.exceptions';
import {
    closeTestModuleOrApp,
    MODULE_BASE_IMPORTS,
    MODULE_BASE_PROVIDERS,
    MODULE_MOCKED_MAIL_PROVIDER,
    MODULE_MOCKED_PLAN_SUBSCRIPTION_CREATE_ACTION_PROVIDER
} from "../testHelpers/genericHelpers";
import { assert404Response, assertErrorResponse, assertHttpResponse } from "../testHelpers/assertHelper";
import { UserCreateAction } from "../../../src/modules/user/services/UserCreateAction.service";
import { rootLogger } from "../../../src/utils/Logger";
import { generateAccessTokenForUser } from "../testHelpers/authHelper";

const controllerName = "CarController"
const acceptHeader = 'application/json; charset=utf-8';

/**
 * <p>This is an example test case which is here only for illustration purposes.</p>
 */
describe(controllerName, () => {

    let moduleRef: TestingModule;
    let app: NestApplication;
    let client: supertest.SuperTest<supertest.Test>;

    let carService: CarService;
    let accessToken: string;

    beforeAll(async() => {
        console.log(`MONGO_URI: ${process.env.MONGO_URI}`);

        // Prepare module
        moduleRef = await Test.createTestingModule({
            imports: [
                ...MODULE_BASE_IMPORTS,
                // Define additional feature schemas.
                MongooseModule.forFeature([
                    { name: CarDocumentToken, schema: CarSchema },
                ])
            ],
            providers: [
                ...MODULE_BASE_PROVIDERS,
                CarService,
                MODULE_MOCKED_MAIL_PROVIDER,
                MODULE_MOCKED_PLAN_SUBSCRIPTION_CREATE_ACTION_PROVIDER,
                UserCreateAction
            ],
            controllers: [ CarController ],
        }).compile();

        // Instantiate nest application.
        app = moduleRef.createNestApplication(undefined, { logger: [ "verbose" ] });
        await app.init();

        // Save client.
        client = supertest(app.getHttpServer());

        // Get instance references
        carService = moduleRef.get(CarService);

        // Generate authentication token
        const user = await moduleRef.get(UserCreateAction).execute(
            { user: null, correlationId: "1-2-3-4", logger: rootLogger },
            {
                email: "car.controller.test@local.domain",
                firstName: "Car",
                lastName: "Controller",
                password: "password",
                phoneNumber: [
                    { phone: "1234567890", code: 1, short: "US", isPrimary: true }
                ]
            });

        accessToken = await generateAccessTokenForUser(moduleRef, user);
    });

    afterAll(async() => await closeTestModuleOrApp(moduleRef, app));

    /**
     * Test the `get` controller method(s).
     */
    describe('get', () => {

        const getPayload: CarPayload = {
            plateNumber: 'getExistingPlateNumber',
            manufacture: 'GetTest',
            owner: 'Unknown'
        }

        beforeAll(async() => {
            // Preparation: save the registration number via the service.
            await carService.createOrUpdate(getPayload);
        })

        it('should return existing object (status 200)', async() => {
            // Request the car via the controller
            const response = await supertest(app.getHttpServer())
                .get(`${CAR_CONTROLLER_BASE_URL}/${getPayload.plateNumber}`)
                .set('Accept', acceptHeader);

            // Assert http response
            assertHttpResponse(response, HttpStatus.OK, acceptHeader);

            // Assert response payload
            const responsePayload: CarDocument = <CarDocument>response.body;

            expect(responsePayload !== null).toBeTruthy()
            expect(responsePayload.manufacture).toEqual(getPayload.manufacture)
            expect(responsePayload.plateNumber).toEqual(getPayload.plateNumber)
            expect(responsePayload.owner).toEqual(getPayload.owner)

        });

        it('should return 404 when object does not exist', async() => {
            const nonExistingPlateNumber = 'non-existing-plate'

            // Request the car via the controller
            const response = await client.get(`${CAR_CONTROLLER_BASE_URL}/${nonExistingPlateNumber}`)
                                         .set('Accept', acceptHeader);

            // Asser http 404 response and payload
            assert404Response(response, new RegistrationPlateNotFound(nonExistingPlateNumber).message, acceptHeader);
        })

    });

    /**
     * Test the `post` controller method(s).
     */
    describe('post', () => {

        const postPayload: CarPayload = {
            plateNumber: '007',
            manufacture: 'Aston Martin',
            owner: 'James Bond',
        };

        it(`should return ${RegistrationPlateAlreadyExists.name} when trying to save a new registration plate that already exists`, async() => {
            const existsPayload: CarPayload = {
                plateNumber: '007-already-exists',
                manufacture: 'Aston Martin',
                owner: 'James Bond',
            };

            // Send payload to the controller.
            await carService.createOrUpdate(existsPayload); // we are not saving the return result on purpose!

            // Request the car via the controller
            const response = await client.post(`${CAR_CONTROLLER_BASE_URL}`)
                                         .set('Accept', acceptHeader)
                                         .set('Authorization', `Bearer ${accessToken}`)
                                         .send(existsPayload);

            assertErrorResponse(response, HttpStatus.BAD_REQUEST, new RegistrationPlateAlreadyExists().message);

        });

        it('should return 404 when object does not exist', async() => {
            const nonExistingPlateNumber = 'non-existing-plate'

            // Request the car via the controller
            const response = await client.post(`${CAR_CONTROLLER_BASE_URL}/${nonExistingPlateNumber}`)
                                         .set('Accept', acceptHeader)
                                         .set('Authorization', `Bearer ${accessToken}`);

            // Asser http 404 response and payload
            assert404Response(response, new RegistrationPlateNotFound(nonExistingPlateNumber).message, acceptHeader);
        })

        it('should return Unauthorized when JWT is missing', async() => {
            const response = await client.post(CAR_CONTROLLER_BASE_URL)
                                         .set('Accept', acceptHeader)
                                         .send(postPayload);

            assertHttpResponse(response, HttpStatus.UNAUTHORIZED);
        })

        it('should return Unauthorized when JWT is invalid', async() => {
            const response = await client.post(CAR_CONTROLLER_BASE_URL)
                                         .set('Accept', acceptHeader)
                                         .set('Authorization', 'Bearer invalid.token.withDots')
                                         .send(postPayload);

            assertHttpResponse(response, HttpStatus.UNAUTHORIZED);
        })

        it('should return the saved object when JWT is valid', async() => {
            const response = await client.post(CAR_CONTROLLER_BASE_URL)
                                         .set('Accept', acceptHeader)
                                         .set('Authorization', `Bearer ${accessToken}`)
                                         .send(postPayload);

            assertHttpResponse(response, HttpStatus.CREATED);
        })

    });

});
