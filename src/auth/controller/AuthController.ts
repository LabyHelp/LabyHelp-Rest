import {Body, Controller, Get, Logger, Post, Query, Req, Res} from "@nestjs/common";
import {Request, Response} from "express";
import {XBoxService} from "../sevices/XBoxService";
import {AuthService} from "../sevices/AuthService";
import {MinecraftService} from "../../minecraft/services/MinecraftService";
import FailResponse from "../../utility/FailResponse";
import ErrorResponse from "../../utility/ErrorResponse";
import ResponseCode from "../../utility/ResponseCode";
import {MinecraftProfile} from "../../utility/MinecraftProfile";
import {ClientType} from "../ClientType";
import TokenPair from "../TokenPair";
import SuccessResponse from "../../utility/SuccessResponse";
import {UserRepository} from "../../user/repositories/UserRepository";

@Controller('/auth')
export class AuthController {

    readonly logger: Logger = new Logger(AuthController.name);

    constructor(
        readonly authService: AuthService,
        readonly minecraftService: MinecraftService,
        readonly xboxService: XBoxService,
        readonly userRepository: UserRepository
    ) {

    }

    @Post('minecraft')
    public async authenticate(
        @Req() req: Request,
        @Res() res: Response,
        @Body('uuid') uuid: string,
        @Body('accessToken') accessToken: string
    ) {
        if (!uuid)
            return new FailResponse('uuid is missing').send(res);

        if (!accessToken)
            return new FailResponse('accessToken is missing').send(res);


        const authenticated: boolean = await this.minecraftService.authenticate(uuid, accessToken);

        if (!authenticated)
            return new ErrorResponse(ResponseCode.UNAUTHORIZED, null).send(res);

        // ensure that the user exists in the db
        if (!await this.userRepository.exists(uuid)) {
            const username = await this.minecraftService.getMinecraftName(uuid);
            await this.userRepository.create(uuid, username, null, 0);
        }

        const tokenPair: TokenPair = await this.authService.generateTokenPair(uuid, ClientType.MINECRAFT);
        return new SuccessResponse(tokenPair).send(res);
    }

    @Get('xbox')
    public async xbox(
        @Req() req: Request,
        @Res() res: Response
    ) {
        await this.xboxService.getAuthCodeUrl(req, res);
    }

    @Get('xbox/redirect')
    public async xboxRedirect(
        @Req() req: Request,
        @Res() res: Response,
        @Query('code') code: string
    ) {
        const msalAccessToken = await this.xboxService.acquireToken(code);

        const accessToken: string = await this.xboxService.getMinecraftAccessToken(msalAccessToken);

        const minecraftProfile: MinecraftProfile | null = await this.minecraftService.getMinecraftProfile(accessToken);

        if (!minecraftProfile) {
            res.redirect(500, "https://labyhelp.de/redirect?error=couldn't%20get%20minecraft%20profile%20information");
            return;
        }

        // ensure that the user exists in the db
        // rank id = 0 means player rank
        await this.userRepository.create(minecraftProfile.id, minecraftProfile.name, null, 0);

        const tokenPair: TokenPair = await this.authService.generateTokenPair(minecraftProfile.id, ClientType.WEB);
        res.redirect(200, `https://labyhelp.de/redirect?code=${tokenPair.token}&refresh_token=${tokenPair.refresh_token}`);
    }

    @Post('authorize')
    public async authorize(
        @Req() req: Request,
        @Res() res: Response
    ) {
        return (await this.authService.authorize(req)).send(res);
    }

    @Post('refresh')
    public async refresh(
        @Body('token') token: string,
        @Body('refresh_token') refresh_token: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        if (!(token && refresh_token)) {
            token = req.cookies['labyhelp__token'];
            refresh_token = req.cookies['labyhelp__refresh_token'];
        }

        if (!(token || refresh_token)) {
            return new FailResponse(`${!token ? 'token' : 'refresh_token'} is missing`).send(res);
        }

        return (await this.authService.refreshToken(token, refresh_token, res)).send(res);
    }
}
