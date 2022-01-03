import {Injectable, Logger, Param, Post} from "@nestjs/common";
import AbstractResponse from "../../utility/AbstractResponse";
import FailResponse from "../../utility/FailResponse";

@Injectable()
export class AuthService {

    readonly logger: Logger = new Logger(AuthService.name);

    constructor() {

    }

    // General authentication with uuid and session token (for minecraft auth) or username and pw (for team members)
    public authenticate(credentials: string, username?: string, uuid?: string): AbstractResponse {
        if (!credentials)
            return new FailResponse('credentials are missing!');

        if (!(username && uuid))
            return new FailResponse('username or uuid is missing');

        if (uuid) {
            this.logger.log('trying to authenticate minecraft user... (only uuid is present)');
        } else {
            this.logger.log('trying to authenticate labyhelp user... (only username is present)');
        }
    }

    // 2. xBox
    @Post('xbox/oauth')
    public xboxCallback(
        @Param('token') token: string
    ) {

    }
}
