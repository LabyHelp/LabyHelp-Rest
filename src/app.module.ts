import {HttpModule, Module} from '@nestjs/common';
import {DatabaseRegistry, DrivineModule, DrivineModuleOptions} from "@liberation-data/drivine";

@Module({
    imports: [
        DrivineModule.withOptions(<DrivineModuleOptions>{
            connectionProviders: [DatabaseRegistry.buildOrResolveFromEnv('NEO4J')]
        }),
        HttpModule,
    ],
    controllers: [],
    providers: []
})
export class AppModule {
}
