import test from 'ava'
import * as td from 'testdouble'
import {DataStore} from './data-store.js'

test('getting and updating data', (t) => {
  const store = new DataStore({items: []})

  store.update(['items', 0], {name: 'Item One'})
  t.deepEqual(store.get(), {items: [{name: 'Item One'}]})
  t.deepEqual(store.get(['items']), [{name: 'Item One'}])
  t.deepEqual(store.get(['items', 0]), {name: 'Item One'})

  store.update(['items', 0, 'name'], 'Renamed Item')
  t.deepEqual(store.get(), {items: [{name: 'Renamed Item'}]})
  t.deepEqual(store.get(['items']), [{name: 'Renamed Item'}])
  t.deepEqual(store.get(['items', 0]), {name: 'Renamed Item'})
})

test('subscribing to updates', (t) => {
  const store = new DataStore({items: []})
  const subscriber = td.function()
  store.subscribe(subscriber)

  store.update(['items', 0], {name: 'Item One'})
  td.verify(subscriber(['items', 0], {name: 'Item One'}))

  store.update(['items', 0, 'name'], 'Renamed Item')
  td.verify(subscriber(['items', 0, 'name'], 'Renamed Item'))

  t.pass()
})
