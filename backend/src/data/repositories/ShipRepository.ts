import { Ship } from '../../domain/ship/entity'
import { HarperDBClient } from '../clients/HarperDBClient'
import { BaseRepository } from './BaseRepository'

export class ShipRepository extends BaseRepository<Ship> {
  constructor (client: HarperDBClient) {
    super(client, 'ships', Ship)
  }
}
