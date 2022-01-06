import {HttpModule, Module} from '@nestjs/common';
import {DatabaseRegistry, DrivineModule, DrivineModuleOptions} from "@liberation-data/drivine";
import {ConfigModule} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";
import {ThrottlerModule} from "@nestjs/throttler";
import {AuthController} from "./auth/controller/AuthController";
import {UserController} from "./user/controller/user.controller";
import {AuthService} from "./auth/sevices/AuthService";
import {XBoxService} from "./auth/sevices/XBoxService";
import {MinecraftService} from "./minecraft/services/MinecraftService";
import {UserService} from "./user/services/UserService";
import {UserRepository} from "./user/repositories/UserRepository";
import {RankRepository} from "./rank/repositories/RankRepository";
import {RankController} from "./rank/controller/RankController";
import {Token, TokenSchema} from "./auth/Token";

@Module({
    imports: [
        DrivineModule.withOptions(<DrivineModuleOptions>{
            connectionProviders: [DatabaseRegistry.buildOrResolveFromEnv('NEO4J')]
        }),
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGODB),
        MongooseModule.forFeature([
            {name: Token.name, schema: TokenSchema}
        ]),
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 10,
        }),
        HttpModule
    ],
    controllers: [
        AuthController,
        UserController,
        RankController
    ],
    providers: [
        AuthService,
        XBoxService,
        MinecraftService,
        UserService,
        UserRepository,

        RankRepository
    ]
})
export class AppModule {
}
