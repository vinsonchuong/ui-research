import test from 'ava'
import {TransactionLog} from './transaction-log.js'

test('initializing with a copy of the data', (t) => {
  const log = new TransactionLog()

  log.initialize('1', {
    items: [{id: 1, name: 'Item One'}],
  })

  t.deepEqual(log.getLast(), {
    type: 'initialize',
    version: '1',
    data: {
      items: [{id: 1, name: 'Item One'}],
    },
  })

  t.deepEqual(log.getVersion('1'), {
    type: 'initialize',
    version: '1',
    data: {
      items: [{id: 1, name: 'Item One'}],
    },
  })

  t.throws(() => {
    log.initialize('1', {
      items: [{id: 1, name: 'Item One'}],
    })
  })
})

test('appending updates to the log', (t) => {
  const log = new TransactionLog()

  t.throws(() => {
    log.update('1', '2', {path: [], value: 'Hi'}, {path: [], value: null})
  })

  log.initialize('1', {
    items: [{id: 1, name: 'Item One'}],
  })

  log.update(
    '1',
    '2',
    [{path: ['items', 0, 'name'], value: 'New Name'}],
    [{path: ['items', 0, 'name'], value: 'Item One'}],
  )

  t.deepEqual(log.getLast(), {
    type: 'update',
    fromVersion: '1',
    version: '2',
    update: [{path: ['items', 0, 'name'], value: 'New Name'}],
    inverse: [{path: ['items', 0, 'name'], value: 'Item One'}],
  })

  t.deepEqual(log.getVersion('1'), {
    type: 'initialize',
    version: '1',
    data: {
      items: [{id: 1, name: 'Item One'}],
    },
  })

  t.deepEqual(log.getVersion('2'), {
    type: 'update',
    fromVersion: '1',
    version: '2',
    update: [{path: ['items', 0, 'name'], value: 'New Name'}],
    inverse: [{path: ['items', 0, 'name'], value: 'Item One'}],
  })

  t.throws(() => {
    log.update(
      '1',
      '2',
      [{path: ['items', 0, 'name'], value: 'New Name'}],
      [{path: ['items', 0, 'name'], value: 'Conflicting Update'}],
    )
  })
})
