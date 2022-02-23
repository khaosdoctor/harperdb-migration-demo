'use strict'

// eslint-disable-next-line no-unused-vars,require-await
module.exports = async (server, { hdbCore }) => {

  server.route({
    url: '/ships',
    method: 'GET',
    preParsing: (request, _, done) => {
      request.body = {
        operation: 'sql',
        sql: 'SELECT events FROM ship_manager.ships WHERE search_json("deletedAt", state) IS NULL'
      }
      done()
    },
    preValidation: hdbCore.preValidation,
    handler: hdbCore.request
  })

  server.route({
    url: '/ports',
    method: 'GET',
    handler: (request) => {
      request.body = {
        operation: 'sql',
        sql: 'SELECT events FROM ship_manager.ports WHERE search_json("deletedAt", state) IS NULL'
      }
      return hdbCore.requestWithoutAuthentication(request)
    }
  })
}