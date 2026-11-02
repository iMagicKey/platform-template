import assert from 'node:assert/strict'
import test from 'node:test'
import { buildApp } from '../../apps/backend/code/app.js'
import { readConfig } from '../../apps/backend/code/config.js'
import { estimateProject, listProjects } from '../../apps/backend/code/modules/projects/projects.service.js'

test('domain service returns versioned reference data', () => {
    const projects = listProjects()
    assert.equal(projects.length, 2)
    assert.ok(projects.some((project) => project.id === 'web'))
})

test('pure estimate uses cents and is independently testable', () => {
    assert.deepEqual(estimateProject({ hours: 3, rateCents: 1750 }), {
        hours: 3,
        rateCents: 1750,
        totalCents: 5250,
    })
    assert.throws(() => estimateProject({ hours: -3, rateCents: 1750 }))
})

test('route transport validates request and produces OpenAPI contract', async () => {
    const app = await buildApp(readConfig({ NODE_ENV: 'test', DOCS_ENABLED: 'true' }))
    try {
        const root = await app.inject('/projects')
        assert.equal(root.statusCode, 200)
        assert.equal(root.json().data.projects[0].id, 'web')
        assert.equal(root.json().error, null)

        const estimate = await app.inject({
            method: 'POST',
            url: '/projects/estimate',
            payload: { hours: 8, rateCents: 2999 },
        })
        assert.equal(estimate.statusCode, 200)
        assert.equal(estimate.json().data.totalCents, 23992)
        assert.equal(estimate.json().error, null)

        const invalid = await app.inject({
            method: 'POST',
            url: '/projects/estimate',
            payload: { hours: -1, rateCents: 'invalid' },
        })
        assert.equal(invalid.statusCode, 400)
        assert.equal(invalid.json().data, null)
        assert.equal(invalid.json().error.code, 'VALIDATION_ERROR')
        assert.ok(Array.isArray(invalid.json().error.issues))

        const openapi = (await app.inject('/openapi.json')).json()
        assert.ok(openapi.paths['/projects'])
        assert.ok(openapi.paths['/projects/estimate'])
        assert.ok(openapi.paths['/projects/estimate'].post.responses['200'])
        assert.ok(openapi.paths['/projects/estimate'].post.responses['400'])
    } finally {
        await app.close()
    }
})
