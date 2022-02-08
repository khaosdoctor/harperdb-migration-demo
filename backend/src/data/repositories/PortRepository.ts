import { HarperDBClient } from '../clients/HarperDBClient'
import { BaseRepository } from './BaseRepository'
import { Port } from '../../domain'

export class PortRepository extends BaseRepository<Port> {
  constructor (client: HarperDBClient) {
    super(client, 'ports', Port)
  }
}
