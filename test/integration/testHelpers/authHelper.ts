import { JwtService } from "@nestjs/jwt";
import { TestingModule } from "@nestjs/testing";

import { User, UserDocument } from '../../../src/modules/user/user.schema';
import { AuthAccessTokenResponseDto } from "../../../src/modules/auth/dtos/AuthTokenResponseDto";

export async function generateAccessTokenForUser(moduleRef: TestingModule, user: User | UserDocument, expiresInSeconds?: number): Promise<string>
{

    if(!user) {
        throw new Error('User argument is null');
    }

    const authPayload: AuthAccessTokenResponseDto = {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        sessionId: "1-2-3-4",
        stripeCustomerUserId: user.stripeCustomerUserId,
        isEnabledBuyPlan: user?.isEnabledBuyPlan,
        isEnabledPayment: user?.isEnabledPayment,
        image: user.image,
        phoneSystem: user.phoneSystem,
        priceSubscribe: user.priceSubscribe,
        planSubscription: null,
    };

    const accessToken = moduleRef.get(JwtService).sign(authPayload, {
        expiresIn: expiresInSeconds ? `${expiresInSeconds}s` : '300s',
    });

    return accessToken;

}

