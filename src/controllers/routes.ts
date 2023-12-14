import { Router } from '@well-known-components/http-server'
import { IHttpServerComponent } from '@well-known-components/interfaces'
import {
  DecentralandSignatureRequiredContext,
  wellKnownComponents as authorizationMiddleware
} from '@dcl/platform-crypto-middleware'
import { AppComponents, GlobalContext } from '../types'
import { statusHandler } from './handlers/status-handler'
import { errorHandler } from '@dcl/platform-server-commons'
import { wsHandler } from './handlers/ws-handler'

const FIVE_MINUTES = 5 * 60 * 1000

async function skipSignedFetch<T>(
  ctx: IHttpServerComponent.DefaultContext<AppComponents>,
  next: () => Promise<IHttpServerComponent.IResponse>
): Promise<IHttpServerComponent.IResponse> {
  const url = new URL(ctx.request.url)
  const address = url.searchParams.get('address')
  if (!address) {
    throw new Error('Missing address')
  }
  console.log(`Skipping signed fetch for address ${address}`)
  ;(ctx as IHttpServerComponent.DefaultContext<AppComponents & DecentralandSignatureRequiredContext<T>>).verification =
    {
      auth: address,
      authMetadata: {} as T
    }

  return await next()
}

// We return the entire router because it will be easier to test than a whole server
export async function setupRouter({ components }: GlobalContext): Promise<Router<GlobalContext>> {
  const { fetch } = components

  const router = new Router<GlobalContext>()
  router.use(errorHandler)

  router.get(
    '/ws/:session',
    authorizationMiddleware({
      optional: false,
      expiration: FIVE_MINUTES,
      fetcher: fetch
    }),
    wsHandler
  )

  router.get('/iws/:session', skipSignedFetch as any, wsHandler)

  router.get('/status', statusHandler)

  return router
}
