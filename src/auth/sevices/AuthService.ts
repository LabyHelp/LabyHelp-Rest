import {Injectable, Logger} from "@nestjs/common";
import jwt, {JwtPayload} from "jsonwebtoken";
import {Request, Response} from "express";
import ErrorResponse from "../../utility/ErrorResponse";
import ResponseCode from "../../utility/ResponseCode";
import SuccessResponse from "../../utility/SuccessResponse";
import TokenPair from "../TokenPair";
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Token, TokenDocument} from "../Token";
import {ClientType} from "../ClientType";
import AbstractResponse from "../../utility/AbstractResponse";

@Injectable()
export class AuthService {

    readonly logger: Logger = new Logger(AuthService.name);
    readonly TOKEN_SECRET: string = "ubz3wjQZOHZ3Dpuwd1K9KFyR9tu3JwMb5I1IM5lpUnlzX";
    readonly REFRESH_TOKEN_SECRET: string = "4sci8zPO1a8wyGgn7RtJ3HAjudwA5rrJeO6Hwlir5D9Gz";

    constructor(
        @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    ) {
    }

    public async refreshToken(old_token: string, refresh_token: string, res: Response): Promise<AbstractResponse> {
        // check if refresh token is valid
        try {
            const payload: any = jwt.verify(refresh_token, process.env.JWT_REFRESH_TOKEN_SECRET ?? this.REFRESH_TOKEN_SECRET);

            if (payload) {
                const {id, client_type} = payload;

                const token: any = (await this.tokenModel.findOne({user: id, client_type: client_type}))?.toObject();

                if (!token)
                    return new ErrorResponse(ResponseCode.UNAUTHORIZED, `this token doesn't exist`);

                if (token.token !== old_token)
                    return new ErrorResponse(ResponseCode.BAD_REQUEST, 'different jwt token');

                // check if refresh token was already used and does exist
                let exists = false;
                for (const entry of token.refresh_tokens) {
                    if (entry.token === refresh_token) {
                        exists = true;

                        if (entry.used) {
                            // TODO: decide if all user tokens should be revoked or only this specific one
                            await this.tokenModel.deleteOne({id: id, client_type: client_type});
                            return new ErrorResponse(ResponseCode.UNAUTHORIZED, `this refresh_token was already used`);
                        }

                        // mark as used, so it can't be used a second time
                        entry.used = Date.now();
                        break;
                    }
                }

                if (!exists)
                    return new ErrorResponse(ResponseCode.BAD_REQUEST, 'wrong refresh_token');

                const new_token: string = this.generateToken(id, client_type);
                const new_refresh_token = this.generateRefreshToken(id, client_type)

                token.token = new_token;
                token.refresh_tokens.push({
                    token: new_refresh_token,
                    used: null
                });

                delete token._id;
                await this.tokenModel.replaceOne({user: id, client_type: client_type}, token);

                return new SuccessResponse({
                    token: new_token,
                    refresh_token: new_refresh_token
                });
            }
        } catch (e) {
            this.logger.error(e);
        }

        return new ErrorResponse(ResponseCode.UNAUTHORIZED, `the refresh_token isn't valid`);
    }

    public authorize(req: Request) {
        const authHeader = req.headers['authorization'];
        let token: string | undefined = authHeader && authHeader.split(' ')[1];
        let cookie: boolean = false;

        if (!token) {
            if (req.body.token) {
                token = req.body.token;
            } else {
                cookie = true;
                token = req.cookies['labyhelp__token'];
            }
        }

        if (token == 'undefined' || token == 'null')
            return new ErrorResponse(ResponseCode.BAD_REQUEST, 'auth token is missing');

        if (token) {
            const payload: any = this.validateToken(token);

            if (payload && payload.id) {
                if (cookie) {
                    this.logger.log(`authenticated user ${payload.id} via cookie`);

                    return new SuccessResponse({
                        user: null,
                        token: token,
                        refresh_token: req.cookies['labyhelp__refresh_token'] ?? undefined
                    });
                } else {
                    this.logger.log(`authenticated user ${payload.id} via auth header`);

                    return new SuccessResponse({
                        user: null
                    });
                }
            }
        }

        return new ErrorResponse(ResponseCode.UNAUTHORIZED, 'session expired');
    }

    public async generateTokenPair(user: string, clientType: ClientType): Promise<TokenPair> {
        // generate token
        const token = this.generateToken(user, clientType);

        // generate refresh token
        const refreshToken = this.generateRefreshToken(user, clientType);

        await this.tokenModel.findOneAndUpdate({
            user: user,
            client_type: clientType
        }, {
            user: user,
            client_type: clientType,
            token: token,
            refresh_tokens: [{
                token: refreshToken
            }]
        }, {
            upsert: true,
            useFindAndModify: false
        });

        return {
            token: token,
            refresh_token: refreshToken
        } as TokenPair
    }

    private generateToken(id: string, clientType: ClientType): string {
        console.log(jwt);

        return jwt.sign({
                id: id,
                client_type: clientType
            }, process.env.JWT_TOKEN_SECRET ?? this.TOKEN_SECRET,
            {
                expiresIn: '6h'
            }
        );
    }

    private generateRefreshToken(id: string, clientType: ClientType): string {
        return jwt.sign({
                id: id,
                client_type: clientType
            },
            process.env.JWT_REFRESH_TOKEN_SECRET ?? this.REFRESH_TOKEN_SECRET
        );
    }

    public validateToken(token: string): JwtPayload | string | null {
        try {
            return jwt.verify(token, process.env.JWT_TOKEN_SECRET ?? this.TOKEN_SECRET);
        } catch (e) {
            return null;
        }
    }
}
