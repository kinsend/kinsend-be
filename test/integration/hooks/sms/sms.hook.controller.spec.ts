import { Test, TestingModule } from "@nestjs/testing";
import { NestApplication } from "@nestjs/core";
import { HttpStatus } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as supertest from "supertest";
import {
    closeTestModuleOrApp,
    MODULE_BASE_IMPORTS,
    MODULE_BASE_PROVIDERS,
    MODULE_MOCKED_MAIL_PROVIDER,
    MODULE_MOCKED_PLAN_SUBSCRIPTION_CREATE_ACTION_PROVIDER
} from "../../testHelpers/genericHelpers";
import { SmsHookModule } from "@app/hooks/sms/sms.hook.module";
import {
    CONTROLLER_BASE,
    CONTROLLER_HOOK_SMS,
    CONTROLLER_HOOK_STATUS_CALLBACK
} from "@app/hooks/sms/sms.hook.controller";
import { assertHttpResponse } from "../../testHelpers/assertHelper";

import { UpdateCreateAction } from "@app/modules/update/services/UpdateCreateAction.service";
import { rootLogger } from "@app/utils/Logger";
import { INTERVAL_TRIGGER_TYPE } from "@app/modules/update/interfaces/const";
import { UserCreateAction } from "@app/modules/user/services/UserCreateAction.service";
import { User, UserDocument } from "@app/modules/user/user.schema";

describe("SmsHookController", () => {

    let moduleRef: TestingModule;
    let app: NestApplication;
    let client: supertest.SuperTest<supertest.Test>;

    let updateCreateAction: UpdateCreateAction;
    let user: UserDocument;
    let userModel: Model<UserDocument>;

    beforeAll(async() => {

        // Prepare module
        moduleRef = await Test.createTestingModule({
            imports: [
                ...MODULE_BASE_IMPORTS,
                // Define additional feature schemas.
                SmsHookModule
            ],
            providers: [
                ...MODULE_BASE_PROVIDERS,
                MODULE_MOCKED_MAIL_PROVIDER,
                MODULE_MOCKED_PLAN_SUBSCRIPTION_CREATE_ACTION_PROVIDER,
                UserCreateAction
            ],
        }).compile();

        // Instantiate nest application.
        app = moduleRef.createNestApplication(undefined, { logger: [ "verbose" ] });
        await app.init();

        updateCreateAction = moduleRef.get(UpdateCreateAction);
        userModel = moduleRef.get<Model<UserDocument>>(getModelToken(User.name));

        // Save client.
        client = supertest(app.getHttpServer());

        // Generate authentication token
        const phoneNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        user = await moduleRef.get(UserCreateAction).execute(
            { user: null, correlationId: "1-2-3-4", logger: rootLogger },
            {
                email: `SmsHookControllerTest-${phoneNumber}@local.domain`,
                firstName: "SMS",
                lastName: "Hook",
                password: "password",
                phoneNumber: [
                    { phone: phoneNumber, code: 1, short: "US", isPrimary: true }
                ],
            });

        // Updating the phone system.
        user.phoneSystem = [
            { phone: "2345678900", code: 1, short: "US", isPrimary: true }
        ];

        await userModel.findByIdAndUpdate(user.id, user);

    });

    afterAll(async() => await closeTestModuleOrApp(moduleRef, app));

    it('should handle report calls from Twilio', async() => {
        // Create an update.
        let update = await updateCreateAction.execute(
            { correlationId: "sms-hook-id", user: user, logger: rootLogger },
            { datetime: new Date(), triggerType: INTERVAL_TRIGGER_TYPE.ONCE, message: "Integration Test", filter: {} }
        );

        // Send request to hook
        const payload = require("./payloads/twilio/payload-01-valid.json");
        const response = await client
            .post(`${CONTROLLER_BASE}${CONTROLLER_HOOK_STATUS_CALLBACK.replace(':id', update.id)}`)
            .set('Content-Type', 'application/json')
            .send(payload);

        // Assert http response
        assertHttpResponse(response, HttpStatus.OK);
    })

    /**
     * This test case is incomplete. The payload-02-stop-message.json is accurate, but we need to mock a form submission
     * in order to accurately simulate this case.
     */
    xit('should handle "STOP" keyword from Twilio', async() => {
        // // Create an update.
        // let update = await updateCreateAction.execute(
        //     { correlationId: "sms-hook-id", user: user, logger: rootLogger },
        //     { datetime: new Date(), triggerType: INTERVAL_TRIGGER_TYPE.ONCE, message: "Integration Test", filter: {} }
        // );

        // Send request to hook
        const payload = require("./payloads/twilio/temp.json");
        const response = await client
            .post(`${CONTROLLER_BASE}${CONTROLLER_HOOK_SMS}`)
            .set('Content-Type', 'application/json')
            .send(payload);

        // Assert http response
        assertHttpResponse(response, HttpStatus.OK);
    })

});