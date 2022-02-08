import env from 'sugar-env'

export const config = {
  cors: {
    exposedHeaders: ['x-content-range']
  },
  database: {
    harperdb: {
      uri: env.get('DATABASE_URI')!,
      dbName: env.get('DATABASE_DBNAME')!,
      username: env.get('DATABASE_USERNAME')!,
      password: env.get('DATABASE_PASSWORD')!
    }
  }
}
