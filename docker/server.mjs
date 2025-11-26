// server.mjs
import { Server } from '@hocuspocus/server'
import { Database } from '@hocuspocus/extension-database'
import pkg from 'pg'

const { Pool } = pkg

// Uses DATABASE_URL from your docker-compose
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const server = Server.configure({
  port: 1234,

  extensions: [
    new Database({
      // Load document from DB
      fetch: async ({ documentName }) => {
        const { rows } = await pool.query(
          'SELECT data FROM documents WHERE name = $1',
          [documentName],
        )
        // node-postgres returns Buffer which is Uint8Array-compatible
        return rows[0]?.data ?? null
      },

      // Store document in DB
      store: async ({ documentName, state }) => {
        await pool.query(
          `
          INSERT INTO documents (name, data)
          VALUES ($1, $2)
          ON CONFLICT (name) DO UPDATE
          SET data = EXCLUDED.data, updated_at = now()
        `,
          [documentName, state],
        )
      },
    }),
  ],
})

server.listen()
console.log('Hocuspocus running on port 1234 with Postgres persistence')

