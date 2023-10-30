import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JWT_MODULE_OPTIONS } from "@nestjs/jwt/dist/jwt.constants";
import { CacheModule, DynamicModule, INestApplicationContext } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { ConfigService as CustomConfigService } from "../../../src/configs/config.service";
import { JwtAuthGuard } from "../../../src/providers/guards/JwtAuthGuard.provider";
import { JwtAuthStrategy } from "../../../src/providers/strategies/JwtAuthStrategy.provider";
import { User, UserSchema } from "../../../src/modules/user/user.schema";
import { AuthModule } from "../../../src/modules/auth/auth.module";
import { MailSendGridService } from "../../../src/modules/mail/mail-send-grid.service";
import {
    PlanSubscriptionCreateAction
} from "../../../src/modules/plan-subscription/services/plan-subscription-create-action.service";
import * as SendGrid from "@sendgrid/mail";

/**
 * <p>Provides module imports that are commonly used across all test modules.</p>
 * <p>If you happen to see other modules to be regularly used -- consider adding them here.</p>
 * <p>Currently included imports:
 *  <ol>
 *      <li>{@link AuthModule}</li>
 *      <li>{@link ConfigModule}</li>
 *      <li>{@link CacheModule}</li>
 *      <li>{@link MongooseModule}</li>
 *  </ol>
 * </p>
 */

const configService = new CustomConfigService();
const { jwtSecret, accessTokenExpiry } = configService;
const LOCAL_JWT_MODULE_OPTIONS = {
    isGlobal: true,
    secret: jwtSecret,
    signOptions: { expiresIn: 600 },
};

export const MODULE_BASE_IMPORTS: DynamicModule[] | any[] = [
    CacheModule.register({ isGlobal: true }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [ '.env' ] }),
    MongooseModule.forRoot(`${process.env.MONGO_URI}`),
    MongooseModule.forFeature([ { name: User.name, schema: UserSchema } ]), // User definition.
    JwtModule.register(LOCAL_JWT_MODULE_OPTIONS),
    PassportModule.register({ defaultStrategy: 'jwt' }),
]

/**
 * <p>Provides module providers that are commonly used across all test modules.</p>
 * <p>If you happen to see other modules to be regularly used -- consider adding them here.</p>
 * <p>Currently included providers:
 *  <ol>
 *      <li>{@link ConfigService}</li>
 *      <li>{@link CustomConfigService}</li>
 *      <li>{@link JwtService}</li>
 *      <li>{@link JwtAuthGuard}</li>
 *      <li>{@link JwtAuthStrategy}</li>
 *  </ol>
 * </p>
 */
export const MODULE_BASE_PROVIDERS: any[] = [
    ConfigService, CustomConfigService, JwtService, JwtAuthGuard, JwtAuthStrategy,
    {
        provide: JWT_MODULE_OPTIONS,
        useValue: LOCAL_JWT_MODULE_OPTIONS
    }
]

jest.mock('../../../src/modules/mail/mail-send-grid.service');
export const MODULE_MOCKED_MAIL_PROVIDER = {
    provide: MailSendGridService,
    useValue: jest.mocked(MailSendGridService).mockImplementation((configService: CustomConfigService) => {
        return <MailSendGridService><unknown>{
            sendUserConfirmation: jest.fn((mail: SendGrid.MailDataRequired): Promise<[ SendGrid.ClientResponse, {} ] | undefined> => Promise.resolve(undefined)),
            sendUserStatusPayment: jest.fn((mail: SendGrid.MailDataRequired): Promise<[ SendGrid.ClientResponse, {} ] | undefined> => Promise.resolve(undefined)),
            sendWelcomeEmail: jest.fn((mail: SendGrid.MailDataRequired): Promise<[ SendGrid.ClientResponse, {} ] | undefined> => Promise.resolve(undefined)),
        };
    }).prototype
}

export const MODULE_MOCKED_PLAN_SUBSCRIPTION_CREATE_ACTION_PROVIDER = {
    provide: PlanSubscriptionCreateAction,
    useValue: jest.fn()
}

/**
 * <p>This function accepts a list of {@link INestApplicationContext} instances as arguments and closes them to avoid memory leaks and tests hanging due to unclosed async handles.</p>
 *
 * @param list
 */
export async function closeTestModuleOrApp(...list: INestApplicationContext[])
{
    if(list.length < 1) {
        return;
    }
    for(let i = 0; i < list.length; i++) {
        const ref = list[i];

        // Note: ref could be undefined if the beforeAll stage failed to initiate due to DI problems.
        if(ref === undefined || ref == null) {
            continue;
        }

        await ref.close();
    }
}
