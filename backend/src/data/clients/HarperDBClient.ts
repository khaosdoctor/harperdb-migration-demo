import { config } from '../../app-config'
import Axios, { AxiosInstance } from 'axios'

interface HarperNoSQLReturnTypeBase {
  message: string
  skipped_hashes: string[]
}

interface HarperNoSQLUpsertType extends HarperNoSQLReturnTypeBase {
  upserted_hashes: any[]
}

interface HarperNoSQLUpdateType extends HarperNoSQLReturnTypeBase {
  updated_hashes: any[]
}

interface HarperNoSQLDeleteType extends HarperNoSQLReturnTypeBase {
  deletedHashes: any[]
}

type HarperNoSQLReturnType<T> = T extends 'upsert' ? HarperNoSQLUpsertType : T extends 'update' ? HarperNoSQLUpdateType : T extends 'delete' ? HarperNoSQLDeleteType : never

export class HarperDBClient {
  #client: AxiosInstance
  #schema: string = ''

  constructor (connectionConfig: typeof config.database.harperdb) {
    this.#client = Axios.create({
      baseURL: connectionConfig.uri,
      url: '/',
      auth: {
        username: connectionConfig.username,
        password: connectionConfig.password
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    this.#schema = connectionConfig.dbName
  }

  async SQLFindAll<Entity> (tableName: string, projection: string = '*', whereClause: string = '') {
    const { data } = await this.#client.post<Entity[]>('/', {
      operation: 'sql',
      sql: `SELECT ${projection} FROM ${this.#schema}.${tableName} ${whereClause ? `WHERE ${whereClause}` : ''}`
    })
    return data
  }

  async NoSQLUpsert (records: Object[], tableName: string) {
    const { data } = await this.#client.post<HarperNoSQLReturnType<'upsert'>>('/', {
      operation: 'upsert',
      table: tableName,
      schema: this.#schema,
      records
    })
    return data
  }

  async NoSQLUpdate (records: Record<string, any>, tableName: string) {
    const { data } = await this.#client.post<HarperNoSQLReturnType<'update'>>('/', {
      operation: 'update',
      table: tableName,
      schema: this.#schema,
      records
    })
    return data
  }

  async NoSQLFindByID<Entity> (recordID: string | number, tableName: string, projection: string[] = ['*']) {
    const { data } = await this.#client.post<Entity>('/', {
      operation: 'search_by_hash',
      table: tableName,
      schema: this.#schema,
      hash_values: [recordID],
      get_attributes: projection
    })
    return data[0]
  }
}
