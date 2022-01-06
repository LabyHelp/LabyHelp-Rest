import {Controller, Get, Put, Query, Req, Res} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {UserRepository} from "../repositories/UserRepository";
import {Request, Response} from "express";
import FailResponse from "../../utility/FailResponse";

@ApiTags('User')
@Controller('/api/user')
export class UserController {

    constructor(
        readonly userRepository: UserRepository
    ) {
    }

    @Get()
    public async get(
        @Req() req: Request,
        @Res() res: Response,
        @Query('uuid') uuid: string
    ) {
        if (!uuid)
            return new FailResponse('uuid is missing').send(res);

        return this.userRepository.get(uuid);
    }
}
