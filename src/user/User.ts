import {Rank} from "./Rank";
import {Badge} from "./Badge";

export class User {
    // general stuff
    uuid: string;
    name: string;
    minecraftVersion: '1.8' | '1.12' | '1.16';
    active: boolean;

    // user stuff
    rank: Rank;
    color: string;

    firstNameTag: string;
    secondNameTag: string;
    nameTagBanned: boolean;

    badges: Badge[];
    leftBadge: Badge;
    rightBadge: Badge;

    // team stuff
    serverPartner: string;
    about: string;
    notes: string;
    birthday: string;
    teams: string[];

    constructor(uuid: string, name: string, minecraftVersion: '1.8' | '1.12' | '1.16' | null) {
        this.uuid = uuid;
        this.name = name;
        this.minecraftVersion = minecraftVersion;
    }

}
