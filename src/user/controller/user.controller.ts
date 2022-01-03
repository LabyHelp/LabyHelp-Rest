import {Controller, Put} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {UserRepository} from "../repositories/UserRepository";

@ApiTags('User')
@Controller('/api/user')
export class UserController {

    constructor(readonly userRepository: UserRepository) {
    }

    @Put()
    public async create() {

    }
}
