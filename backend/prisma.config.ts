import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Change the hardcoded URL back to this:
    url: env('DATABASE_URL'), 
  },
})