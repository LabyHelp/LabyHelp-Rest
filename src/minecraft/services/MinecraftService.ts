import {Injectable, Logger} from "@nestjs/common";
import {MinecraftProfile} from "../../utility/MinecraftProfile";
import axios from "axios";

@Injectable()
export class MinecraftService {

    readonly logger: Logger = new Logger(MinecraftService.name);
    readonly SERVER_ID: string = process.env.SERVER_ID ?? "4ed1f46bbe04bc756bcb17c0c7ce3e4632f06a48"

    public async authenticate(uuid: string, accessToken: string): Promise<boolean> {
        // https://wiki.vg/Protocol_Encryption#Authentication
        return axios.post("https://sessionserver.mojang.com/session/minecraft/join", {
            accessToken: accessToken,
            selectedProfile: uuid,
            serverId: this.SERVER_ID
        }).then(async (res) => {
            return res.status === 204;
        }).catch((error) => {
            this.logger.error(error);
            return false;
        });
    }

    public async getMinecraftProfile(accessToken: string): Promise<MinecraftProfile | null> {
        return axios.get('https://api.minecraftservices.com/minecraft/profile', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((response) => {
            const {id} = response.data;

            if (!id) {
                this.logger.error('a error occurred! the users id is null ???');
                return null;
            }

            return response.data as MinecraftProfile;
        }).catch((error) => {
            this.logger.error(error);
            return null;
        });
    }

    public async getMinecraftName(uuid: string): Promise<string | null> {
        return (await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)).data.name ?? null;
    }
}
