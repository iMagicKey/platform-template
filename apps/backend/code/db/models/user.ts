// Storage shape example only. Never expose credential hashes through HTTP DTOs.
export interface UserRecord {
    id: string
    email: string
    passwordHash: string
    createdAt: Date
}
