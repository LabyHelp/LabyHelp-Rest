export class User {

    private readonly username: string;
    private readonly password: string | null;
    private readonly email: string | null;
    private readonly minecraft: string;         // contains the uuid of the minecraft player
    private readonly active: boolean = false;

    constructor(username: string, password: string | null = null, email: string | null) {

    }
}
