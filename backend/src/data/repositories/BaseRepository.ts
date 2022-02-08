import { HarperDBClient } from '../clients/HarperDBClient'
import { ObjectId } from 'mongodb'
import { IEventEntity } from '@irontitan/paradox'
import { IEntityConstructor } from '@irontitan/paradox/dist/interfaces/IEntityConstructor'
import cloneDeep from 'lodash.clonedeep'

export class BaseRepository<Entity extends IEventEntity> {
  protected database: HarperDBClient
  protected tableName: string
  protected entity: IEntityConstructor<Entity>
  constructor (client: HarperDBClient, tableName: string, entity: IEntityConstructor<Entity>) {
    this.database = client
    this.tableName = tableName
    this.entity = entity
  }

  async findById (id: string | ObjectId): Promise<Entity | null> {
    if (!ObjectId.isValid(id)) return null
    const oid = new ObjectId(id)

    const document = await this.database.NoSQLFindByID<Entity>(oid.toString(), this.tableName, ['state', 'events'])
    if (!document) return null

    return new this.entity().setPersistedEvents(document.events)
  }

  async save (entity: Entity): Promise<Entity> {
    const localEntity = cloneDeep(entity)
    const document = {
      _id: entity.id,
      state: localEntity.state,
      events: localEntity.persistedEvents.concat(localEntity.pendingEvents)
    }
    const result = await this.database.NoSQLUpsert([document], this.tableName)
    console.log(result)
    if (!result.upserted_hashes.includes(document._id.toString())) throw new Error(result.message)
    return entity.confirmEvents()
  }

  async getAll (): Promise<Entity[]> {
    const documents = await this.database.SQLFindAll<Entity>(this.tableName, '*', `search_json('deletedAt', state) IS NULL`)
    return documents.map((document) => new this.entity().setPersistedEvents(document.events))
  }
}
