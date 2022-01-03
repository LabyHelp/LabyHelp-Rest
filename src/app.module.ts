import {HttpModule, Module} from '@nestjs/common';
import {DatabaseRegistry, DrivineModule, DrivineModuleOptions} from "@liberation-data/drivine";
import {ConfigModule} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";
import {ThrottlerModule} from "@nestjs/throttler";

@Module({
    imports: [
        DrivineModule.withOptions(<DrivineModuleOptions>{
            connectionProviders: [DatabaseRegistry.buildOrResolveFromEnv('NEO4J')]
        }),
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_SRV),
        MongooseModule.forFeature([]),
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 10,
        }),
        HttpModule
    ],
    controllers: [],
    providers: []
})
export class AppModule {
}
