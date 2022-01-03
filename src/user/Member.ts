export class Member {

    private readonly about: string = "";
    private readonly notes: string = "";
    private readonly birthday: string = "";
    private readonly teams: string[];
    private readonly active: boolean = false;

    constructor(about: string, notes: string, birthday: string, teams: string[], active: boolean) {
        this.about = about;
        this.notes = notes;
        this.birthday = birthday;
        this.teams = teams;
        this.active = active;
    }

    public getAbout() {
        return this.about;
    }

    public getNotes() {
        return this.notes;
    }

    public getBirthday() {
        return this.birthday;
    }

    public getTeams() {
        return this.teams;
    }

    public isActive() {
        return this.active;
    }
}
