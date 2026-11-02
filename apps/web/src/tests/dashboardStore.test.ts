import assert from 'node:assert/strict'
import test from 'node:test'
import { createDashboardStore } from '../store/dashboardStore'

test('dashboard stores are isolated across separate provider instances', () => {
    const alice = createDashboardStore()
    const bob = createDashboardStore()
    alice.getState().setFilter('automation')
    alice.getState().toggleFavorite('backend')
    assert.equal(alice.getState().filter, 'automation')
    assert.equal(bob.getState().filter, 'all')
    assert.deepEqual(bob.getState().favorites, ['web'])
    assert.deepEqual(alice.getState().favorites, ['web', 'backend'])
})

test('favorites toggle and reset to initial state', () => {
    const store = createDashboardStore()
    store.getState().toggleFavorite('web')
    assert.deepEqual(store.getState().favorites, [])
    store.getState().reset()
    assert.deepEqual(store.getState().favorites, ['web'])
})
