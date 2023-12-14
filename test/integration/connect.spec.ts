import { test } from '../components'
import { getIdentity, Identity, makeRequest } from '../utils'
import { IFetchComponent } from '@well-known-components/interfaces'
import { createFetchComponent } from '@well-known-components/fetch-component'

test('connect', function ({ components }) {
  let identity: Identity
  let fetch: IFetchComponent
  beforeEach(async () => {
    identity = await getIdentity()
    fetch = createFetchComponent()
  })

  it('should work with signed-fetch', async () => {
    const { localFetch } = components
    const r = await makeRequest(localFetch, `/ws/some-session`, identity)
    expect(r.status).toBe(101)
    expect(await r.text()).toEqual('')
  })

  it('should fail when no signed-fetch', async () => {
    const { localFetch } = components
    const r = await localFetch.fetch(`/ws/some-session`)
    expect(r.status).toBe(400)
    expect(await r.json()).toMatchObject({
      message: 'Invalid Auth Chain',
      ok: false
    })
  })
})
