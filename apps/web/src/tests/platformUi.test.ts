import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PlatformHeader } from '../components/PlatformHeader'
import { PlatformHero } from '../components/PlatformHero'
import { CapabilityCard } from '../components/CapabilityCard'
import { FeatureTile } from '../components/FeatureTile'
import { HomeContainer } from '../containers/HomeContainer'
import { DashboardStoreProvider } from '../providers/DashboardStoreProvider'

test('dashboard summary uses the singular for the default single favorite', () => {
    const markup = renderToStaticMarkup(createElement(DashboardStoreProvider, { children: createElement(HomeContainer) }))
    assert.match(markup, /1 favorite · Stored/)
})

test('platform hero background uses a Tailwind 4 gradient utility', () => {
    const markup = renderToStaticMarkup(createElement(PlatformHero))
    assert.match(markup, /\bbg-linear-115\b/)
    assert.doesNotMatch(markup, /bg-gradient-to-\[/)
})

test('platform header has a home landmark, in-page navigation and documentation', () => {
    const markup = renderToStaticMarkup(createElement(PlatformHeader))
    assert.match(markup, /iMagic/)
    assert.match(markup, /aria-label="Main navigation"/)
    assert.match(markup, /href="#services"/)
    assert.match(markup, /href="#demo"/)
    assert.match(markup, /docs\/ARCHITECTURE\.md/)
})

test('platform hero names the template and leads to working sections', () => {
    const markup = renderToStaticMarkup(createElement(PlatformHero))
    assert.match(markup, /iMagic/)
    assert.match(markup, /Platform Template/)
    assert.match(markup, /href="#demo"/)
    assert.match(markup, /href="https:\/\/github\.com\/iMagicKey\/platform-template\/blob\/main\/README\.md"/)
})

test('cards preserve semantic links and architecture descriptions', () => {
    const demo = renderToStaticMarkup(
        createElement(CapabilityCard, {
            title: 'Demo',
            description: 'A working example',
            icon: 'calculator',
            href: '#project-estimator',
        })
    )
    assert.match(demo, /href="#project-estimator"/)
    assert.match(demo, /A working example/)
    const feature = renderToStaticMarkup(
        createElement(FeatureTile, {
            title: 'Runtime Store',
            description: 'Local typed state',
            icon: 'layers',
        })
    )
    assert.match(feature, /Runtime Store/)
    assert.match(feature, /Local typed state/)
})
