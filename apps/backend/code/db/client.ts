// An adapter contract, deliberately not an active database connection.
// Select Prisma, Drizzle or another driver per consuming application.
export interface DatabaseClient {
    connect(): Promise<void>
    ping(): Promise<boolean>
    close(): Promise<void>
}
