import { IEventEntity } from '@irontitan/paradox'
import { IEntityConstructor } from '@irontitan/paradox/dist/interfaces/IEntityConstructor'
import cloneDeep from 'lodash.clonedeep'
import { ObjectId } from 'mongodb'
import { HarperDBClient } from '../clients/HarperDBClient'
export class BaseRepository<Entity extends IEventEntity> {
  protected database: HarperDBClient
  protected tableName: string
  protected entity: IEntityConstructor<Entity>

  constructor (client: HarperDBClient, tableName: string, entity: IEntityConstructor<Entity>) {
    this.tableName = tableName
    this.database = client
    this.entity = entity
  }

  async findById (id: string | ObjectId): Promise<Entity | null> {
    if (!ObjectId.isValid(id)) return null

    const document = await this.database.NoSQLFindByID<Entity>(id.toString(), this.tableName, ['state', 'events'])
    if (!document) return null
    return new this.entity().setPersistedEvents(document.events)
  }

  async save (entity: Entity): Promise<Entity> {
    const localEntity = cloneDeep(entity)
    const document = {
      _id: localEntity.id,
      state: localEntity.state,
      events: localEntity.persistedEvents.concat(localEntity.pendingEvents)
    }
    const result = await this.database.NoSQLUpsert([document], this.tableName)
    if (!result.upserted_hashes.includes(document._id.toString())) throw new Error(result.message)

    return localEntity.confirmEvents()
  }

  async getAll (): Promise<Entity[]> {
    const documents = await this.database.SQLFindAll<{ events: Entity['events'] }>(this.tableName)
    return documents.map(document => new this.entity().setPersistedEvents(document.events))
  }
}
