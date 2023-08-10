import test from 'ava'
import {Leader} from './leader.js'
import {Follower} from './follower.js'
import {TestWireClient} from './test-wire-client.js'

test('replicating across multiple copies', async (t) => {
  const leader = new Leader({items: []})

  const wireClient1 = new TestWireClient(leader)
  const follower1 = new Follower(wireClient1)

  const wireClient2 = new TestWireClient(leader)
  const follower2 = new Follower(wireClient2)

  await wireClient1.waitFor('clone')
  await wireClient2.waitFor('clone')

  t.deepEqual(leader.get(), {items: []})
  t.deepEqual(follower1.get(), {items: []})
  t.deepEqual(follower2.get(), {items: []})

  leader.update(['items', 0], {name: 'Item One'})
  await wireClient1.waitFor('receive')
  await wireClient2.waitFor('receive')

  t.deepEqual(leader.get(), {items: [{name: 'Item One'}]})
  t.deepEqual(follower1.get(), {items: [{name: 'Item One'}]})
  t.deepEqual(follower2.get(), {items: [{name: 'Item One'}]})
})

test('allowing writes from followers', async (t) => {
  const leader = new Leader({items: []})

  const wireClient = new TestWireClient(leader)
  const follower = new Follower(wireClient)
  await wireClient.waitFor('clone')

  follower.update(['items', 0], {name: 'Item One'})
  await wireClient.waitFor('send')
  await wireClient.waitFor('receive')

  t.deepEqual(leader.get(), {items: [{name: 'Item One'}]})
  t.deepEqual(follower.get(), {items: [{name: 'Item One'}]})
})

test('resolving conflicts', async (t) => {
  const leader = new Leader({items: [{name: 'Item One'}]})
  const wireClient1 = new TestWireClient(leader)
  const follower1 = new Follower(wireClient1)
  const wireClient2 = new TestWireClient(leader)
  const follower2 = new Follower(wireClient2)

  await wireClient1.waitFor('clone')
  await wireClient2.waitFor('clone')

  t.deepEqual(leader.get(), {items: [{name: 'Item One'}]})
  t.deepEqual(follower1.get(), {items: [{name: 'Item One'}]})
  t.deepEqual(follower2.get(), {items: [{name: 'Item One'}]})

  follower1.update(['items', 0, 'name'], 'New Name')
  follower2.update(['items', 0, 'name'], 'Other New Name')
  await wireClient1.waitFor('send')
  await wireClient2.waitFor('send')

  t.deepEqual(leader.get(), {items: [{name: 'New Name'}]})
  t.deepEqual(follower1.get(), {items: [{name: 'New Name'}]})
  t.deepEqual(follower2.get(), {items: [{name: 'Other New Name'}]})

  await wireClient2.waitFor('get-since')

  t.deepEqual(leader.get(), {items: [{name: 'New Name'}]})
  t.deepEqual(follower1.get(), {items: [{name: 'New Name'}]})
  t.deepEqual(follower2.get(), {items: [{name: 'Other New Name'}]})

  await wireClient1.waitFor('receive')
  await wireClient2.waitFor('receive')

  t.deepEqual(leader.get(), {items: [{name: 'New Name'}]})
  t.deepEqual(follower1.get(), {items: [{name: 'New Name'}]})
  t.deepEqual(follower2.get(), {items: [{name: 'Other New Name'}]})

  await wireClient2.waitFor('send')

  await wireClient1.waitFor('receive')
  await wireClient2.waitFor('receive')

  t.deepEqual(leader.get(), {items: [{name: 'Other New Name'}]})
  t.deepEqual(follower1.get(), {items: [{name: 'Other New Name'}]})
  t.deepEqual(follower2.get(), {items: [{name: 'Other New Name'}]})
})
