import { upgradeWebSocketResponse } from '@well-known-components/http-server/dist/ws'
import { HandlerContextWithPath, WebSocket } from '../../types'
import { IHttpServerComponent } from '@well-known-components/interfaces'

export async function wsHandler(
  context: Pick<
    HandlerContextWithPath<'logs' | 'wsRegistry', '/iws/:session'>,
    'components' | 'params' | 'request' | 'url' | 'verification'
  >
): Promise<IHttpServerComponent.IResponse> {
  const {
    components: { logs, wsRegistry },
    verification
  } = context
  const logger = logs.getLogger('websocket-handler')

  logger.log(`Websocket requested. Auth: ${verification!.auth}`)

  const sessionId = context.params.session

  return upgradeWebSocketResponse((socket) => {
    const ws = socket as any as WebSocket
    ws.sessionId = sessionId
    ws.address = verification!.auth

    wsRegistry.addSocketToRoom(ws)
  })
}
