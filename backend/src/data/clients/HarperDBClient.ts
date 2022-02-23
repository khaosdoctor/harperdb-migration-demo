import { config } from '../../app-config'
import Axios, { AxiosInstance } from 'axios'

interface HarperDBReturnTypeBase {
  message: string
  skipped_hashed: string[]
}

interface HarperNoSQLUpsertType extends HarperDBReturnTypeBase {
  upserted_hashes: string[]
}

interface HarperNoSQLUpdateType extends HarperDBReturnTypeBase {
  updated_hashes: string[]
}

type HarperNoSQLReturnType<T> = T extends 'upsert'
  ? HarperNoSQLUpsertType : T extends 'update'
? HarperNoSQLUpdateType : never

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

  async SQLFindAll<Entity> (tableName: string) {
    const url = `${this.#client.defaults.baseURL?.replace('9925', '9926')}/api/${tableName}`
    const { data } = await Axios.get<Entity[]>(url, { auth: this.#client.defaults.auth })
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

  async NoSQLUpdate (records: Object[], tableName: string) {
    const { data } = await this.#client.post<HarperNoSQLReturnType<'update'>>('/', {
      operation: 'update',
      table: tableName,
      schema: this.#schema,
      records
    })

    return data
  }

  async NoSQLFindByID<Entity> (recordID: string | number, tableName: string, projection: string[] = ['*']) {
    const { data } = await this.#client.post<Entity[]>('/', {
      operation: 'search_by_hash',
      table: tableName,
      schema: this.#schema,
      hash_values: [recordID],
      get_attributes: projection
    })

    return data[0]
  }
}
