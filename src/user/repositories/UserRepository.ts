import {Injectable} from "@nestjs/common";
import * as path from "path";
import {
    CypherStatement,
    InjectCypher,
    InjectPersistenceManager,
    PersistenceManager,
    QuerySpecification
} from "@liberation-data/drivine";
import {Rank} from "../Rank";
import {User} from "../User";

@Injectable()
export class UserRepository {

    static CYPHER_PATH = path.join(__dirname, '/../cypher/');

    constructor(
        @InjectPersistenceManager('NEO4J') readonly persistenceManager: PersistenceManager,
        @InjectCypher(UserRepository.CYPHER_PATH, 'create') readonly createUser: CypherStatement,
        @InjectCypher(UserRepository.CYPHER_PATH, 'get.user') readonly getAsUser: CypherStatement,
        @InjectCypher(UserRepository.CYPHER_PATH, 'get.member') readonly getAsMember: CypherStatement
    ) {
    }

    public async create(uuid: string, name: string, minecraftVersion: '1.8' | '1.12' | '1.16' | null, rankId: number): Promise<User> {
        // first check if a user with the same uuid already exists
        const user: User | null = await this.get(uuid);

        if (user)
            return user;

        const userObj: User = new User(uuid, name, minecraftVersion);
        await this.persistenceManager.execute(new QuerySpecification(this.createUser).bind([userObj.uuid, userObj.name, userObj.minecraftVersion]));

        // link user to rank
        await this.persistenceManager.execute(new QuerySpecification(`MATCH (u:User {uuid: '${uuid}'}) with u MATCH (r:Rank {id: ${rankId}}) with u, r MERGE (u)-[:RANK]->(r)`));

        return userObj;
    }

    public async get(uuid: string): Promise<User | null> {
        return this.persistenceManager.maybeGetOne(new QuerySpecification<User>(this.getAsUser).bind([uuid]).transform(User));
    }

    public async exists(uuid: string): Promise<boolean> {
        return (await this.persistenceManager.maybeGetOne(new QuerySpecification(`MATCH (u:User {uuid: '${uuid}'}) return u`))) !== null;
    }

    public async getRank(uuid: string): Promise<Rank> {
        return this.persistenceManager.maybeGetOne(new QuerySpecification<Rank>(`MATCH (u:User {uuid: '${uuid}'})-[RANK]->(r:Rank) return r`));
    }
}
