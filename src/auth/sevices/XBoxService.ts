import {Injectable, Logger} from "@nestjs/common";
import {ConfidentialClientApplication, LogLevel} from "@azure/msal-node";
import {Request, Response} from "express";
import {AuthenticationResult} from "@azure/msal-common";
import axios from "axios";

@Injectable()
export class XBoxService {

    private readonly logger: Logger = new Logger(XBoxService.name);
    private readonly confidentialClientApplication: ConfidentialClientApplication;
    private requestConfiguration: any = {
        authCodeUrlParameters: {
            scopes: ["XboxLive.signin", "XboxLive.offline_access"],
            redirectUri: process.env.NODE_ENV === 'production' ? "https://api.labyhelp.de/auth/xbox/redirect" : "http://localhost:3000/auth/xbox/redirect"
        }, tokenRequest: {
            redirectUri: process.env.NODE_ENV === 'production' ? "https://api.labyhelp.de/auth/xbox/redirect" : "http://localhost:3000/auth/xbox/redirect",
            scopes: ["XboxLive.signin", "XboxLive.offline_access"],
        }
    };

    constructor() {
        const client_id = process.env.MSAL_CLIENT_ID;
        const client_secret = process.env.MSAL_CLIENT_SECRET;

        if (!(client_id || client_secret)) {
            this.logger.error('client_id or client_secret missing');
            return;
        }

        this.confidentialClientApplication = new ConfidentialClientApplication({
            auth: {
                clientId: client_id,
                authority: "https://login.microsoftonline.com/consumers",
                clientSecret: client_secret
            }, system: {
                loggerOptions: {
                    loggerCallback(loglevel, message, containsPii) {
                        console.log(message);
                    }, piiLoggingEnabled: false, logLevel: LogLevel.Verbose,
                }
            }
        });
    }

    public async getAuthCodeUrl(request: Request, response: Response): Promise<void> {
        const authCodeUrlParameters = {...this.requestConfiguration.authCodeUrlParameters};

        if (request.query) {
            // Check for the state parameter
            if (request.query.state) authCodeUrlParameters.state = request.query.state;

            // Check for the prompt parameter
            if (request.query.prompt) authCodeUrlParameters.prompt = request.query.prompt;

            // Check for the loginHint parameter
            if (request.query.loginHint) authCodeUrlParameters.loginHint = request.query.loginHint;

            // Check for the domainHint parameter
            if (request.query.domainHint) authCodeUrlParameters.domainHint = request.query.domainHint;
        }

        await this.confidentialClientApplication.getAuthCodeUrl(authCodeUrlParameters).then((authCodeUrl) => {
            response.redirect(authCodeUrl);
        }).catch((error) => {
            this.logger.error(error);

            response.redirect(500, `https://labyhelp.de/redirect?error=an%20error%20occurred`);
        });
    }

    public async acquireToken(code: string): Promise<string | null> {
        const result: AuthenticationResult | null = await this.confidentialClientApplication.acquireTokenByCode({
            ...this.requestConfiguration.tokenRequest, code
        });

        if (!result)
            return null;

        return result.accessToken;
    }

    public async getMinecraftAccessToken(msalAccessToken: string): Promise<string | null> {
        const xblToken = (await this.getXBLToken(msalAccessToken)).data.Token;

        if (!xblToken) {
            this.logger.error("xbl token is missing");
            return null;
        }

        return await this.getXSTSToken(xblToken).then(async (response) => {
            const xstsToken = response.data.Token;
            const xui = response.data.DisplayClaims.xui[0].uhs;

            if (!(xstsToken || xui)) {
                this.logger.error("xsts token or xui is missing");
                return null;
            }

            const accessToken: string = (await this.getMinecraftJWT(xui, xstsToken)).data.access_token;

            if (!accessToken)
                this.logger.error('could not get the minecraft access_token');

            return accessToken;
        }).catch((error) => {
            if (error.status === 401) {
                switch (error.response.data.XErr) {
                    case 2148916233:
                        this.logger.error("The account doesn't have an Xbox account");
                        break;
                    case 2148916235:
                        this.logger.error("The account is from a country where Xbox Live is not available/banned");
                        break;
                    case 2148916238:
                        this.logger.error("The account is a child (under 18) and cannot proceed unless the account is added to a Family by an adult.");
                        break;
                    default:
                        this.logger.error(error);
                        break;
                }
            }

            return null;
        });
    }

    private async getXBLToken(msalAccessToken: string) {
        return axios.post('https://user.auth.xboxlive.com/user/authenticate', {
            "Properties": {
                "AuthMethod": "RPS", "SiteName": "user.auth.xboxlive.com", "RpsTicket": `d=${msalAccessToken}`
            }, "RelyingParty": "http://auth.xboxlive.com", "TokenType": "JWT"
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    private async getXSTSToken(xblAccessToken: string) {
        return axios.post('https://xsts.auth.xboxlive.com/xsts/authorize', {
            "Properties": {
                "SandboxId": "RETAIL", "UserTokens": [xblAccessToken]
            }, "RelyingParty": "rp://api.minecraftservices.com/", "TokenType": "JWT"
        });
    }

    private async getMinecraftJWT(xui: string, xstsAccessToken: string) {
        return axios.post('https://api.minecraftservices.com/authentication/login_with_xbox', {
            "identityToken": `XBL3.0 x=${xui};${xstsAccessToken}`
        });
    }
}
