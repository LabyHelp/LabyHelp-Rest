import {
    InjectPersistenceManager,
    PersistenceManager,
    QuerySpecification
} from "@liberation-data/drivine";
import {Rank} from "../../user/Rank";

export class RankRepository {

    constructor(
        @InjectPersistenceManager('NEO4J') readonly persistenceManager: PersistenceManager
    ) {
    }

    public async getRanks(): Promise<Rank[]> {
        return this.persistenceManager.query(new QuerySpecification<Rank>('MATCH (r:Rank) return r'));
    }

    public async getRankById(id: number): Promise<Rank | null> {
        return this.persistenceManager.maybeGetOne(new QuerySpecification<Rank>(`MATCH (r:Rank {id: ${id}) return r`));
    }
}
