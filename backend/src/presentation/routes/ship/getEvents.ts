import rescue from 'express-rescue'
import { HttpError } from '@expresso/expresso'
import { ShipService } from '../../../services/ShipService'
import { ShipNotFoundError } from '../../../domain/ship/errors/ShipNotFoundError'

export function factory (service: ShipService) {
  return [
    /**
     * Route handler
     * =============
     */
    rescue(async (req, res) => {
      const ship = await service.find(req.params.shipId)

      res.status(200).json(ship.persistedEvents)
    }),
    (err, _req, _res, next) => {
      if (err instanceof ShipNotFoundError) return next(new HttpError.NotFound({ message: err.message, code: 'ship_not_found' }))

      next(err)
    }
  ]
}
