import { Test, TestingModule } from "@nestjs/testing";
import { NestApplication } from "@nestjs/core";
import * as supertest from "supertest";
import {
    closeTestModuleOrApp,
    MODULE_BASE_IMPORTS,
    MODULE_BASE_PROVIDERS,
    MODULE_MOCKED_MAIL_PROVIDER,
    MODULE_MOCKED_PLAN_SUBSCRIPTION_CREATE_ACTION_PROVIDER
} from "../../testHelpers/genericHelpers";
import { assertHttpResponse, assertHttpResponseContainsHeader } from "../../testHelpers/assertHelper";
import { HttpStatus } from "@nestjs/common";
import { RedirectModule } from "../../../../src/modules/redirect/redirect.module";
import { rootLogger } from "../../../../src/utils/Logger";
import { UserCreateAction } from "../../../../src/modules/user/services/UserCreateAction.service";
import { UserDocument } from "../../../../src/modules/user/user.schema";
import { INTERVAL_TRIGGER_TYPE } from "../../../../src/modules/update/interfaces/const";
import { UpdateCreateAction } from "../../../../src/modules/update/services/UpdateCreateAction.service";
import { Model } from "mongoose";
import {
    LinkRedirect,
    LinkRedirectDocument,
    LinkRedirectSchema,
    LinkRedirectToken
} from "../../../../src/modules/update/link.redirect.schema";
import { getModelToken, MongooseModule } from "@nestjs/mongoose";


describe("RedirectController", () => {

    let moduleRef: TestingModule;
    let app: NestApplication;
    let client: supertest.SuperTest<supertest.Test>;

    let user: UserDocument;
    let linkRedirectDocument: Model<LinkRedirectDocument>;
    let updateCreateAction: UpdateCreateAction;

    beforeAll(async() => {
        console.log(`MONGO_URI: ${process.env.MONGO_URI}`);

        // Prepare module
        moduleRef = await Test.createTestingModule({
            imports: [
                ...MODULE_BASE_IMPORTS,
                // Define additional feature schemas.
                MongooseModule.forFeature([
                    { name: LinkRedirectToken, schema: LinkRedirectSchema },
                ]),
                RedirectModule,
            ],
            providers: [
                ...MODULE_BASE_PROVIDERS,
                UserCreateAction,
                MODULE_MOCKED_MAIL_PROVIDER,
                MODULE_MOCKED_PLAN_SUBSCRIPTION_CREATE_ACTION_PROVIDER,
            ],
        }).compile();

        // Instantiate nest application.
        app = moduleRef.createNestApplication(undefined, { logger: [ "verbose" ] });
        await app.init();

        linkRedirectDocument = moduleRef.get<Model<LinkRedirectDocument>>(getModelToken(LinkRedirect.name));
        updateCreateAction = moduleRef.get(UpdateCreateAction);

        // Generate authentication token
        user = await moduleRef.get(UserCreateAction).execute(
            { user: null, correlationId: "1-2-3-4", logger: rootLogger },
            {
                email: "redirect.controller.test@local.domain",
                firstName: "Redirect",
                lastName: "Link",
                password: "password",
                phoneNumber: [
                    { phone: "1234567890", code: 1, short: "US", isPrimary: true }
                ]
            });

        // Save client.
        client = supertest(app.getHttpServer());

    });

    afterAll(async() => await closeTestModuleOrApp(moduleRef, app));

    it('should redirect to link', async() => {
        // Create an update.
        let update = await updateCreateAction.execute(
            {correlationId: "sms-hook-id", user: user, logger: rootLogger},
            {datetime: new Date(), triggerType: INTERVAL_TRIGGER_TYPE.ONCE, message: "Integration test with link redirect http://google.com", filter: {}}
        );

        let link = await linkRedirectDocument.findOne({ update: update.id });
        expect(link).toBeTruthy();

        const response = await client.get(`/${link?.url}`);

        // Assert http response
        assertHttpResponse(response, HttpStatus.TEMPORARY_REDIRECT);
        assertHttpResponseContainsHeader(response, "Location", link?.redirect);

    })

    it('should fail and redirect to homepage', async() => {
        // Send request to hook
        const response = await client.get(`/non-existing-redirect`);

        // Assert http response
        assertHttpResponse(response, HttpStatus.TEMPORARY_REDIRECT);
        assertHttpResponseContainsHeader(response, "Location", "https://kinsend.io/");

    })

});