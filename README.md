# Kiraale Backend

Property listing and management platform API built with Node.js, Express, and PostgreSQL.

## Quick Start

```bash
# Install dependencies
bun install

# Setup environment
cp .env.example .env

# Run migrations
bun run db:migrate

# Start development server
bun run dev
```

## Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio

## API Testing

Import `/postman/Kiraale-API.postman_collection.json` into Postman for complete API testing.
