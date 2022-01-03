import {Injectable} from "@nestjs/common";
import path from "path";
import {CypherStatement, InjectCypher, InjectPersistenceManager, PersistenceManager} from "@liberation-data/drivine";

@Injectable()
export class UserRepository {

    static CYPHER_PATH = path.join(__dirname, '/../cypher/');

    constructor(
        @InjectPersistenceManager('NEO4J') readonly persistenceManager: PersistenceManager,
        @InjectCypher(UserRepository.CYPHER_PATH, 'create') readonly create: CypherStatement
    ) {
    }
}
