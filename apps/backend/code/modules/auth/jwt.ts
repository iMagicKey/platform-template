import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export async function issueApiToken(
    secret: Uint8Array,
    options: { subject: string; audience: string; issuer: string; scope: string },
): Promise<string> {
    if (secret.length < 32) throw new Error('JWT secret must be at least 32 bytes')
    return new SignJWT({ scope: options.scope })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setSubject(options.subject)
        .setAudience(options.audience)
        .setIssuer(options.issuer)
        .setIssuedAt()
        .setExpirationTime('10m')
        .sign(secret)
}

export async function verifyApiToken(
    token: string,
    secret: Uint8Array,
    issuer: string,
    audience: string,
): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, secret, { issuer, audience, algorithms: ['HS256'] })
    return payload
}
