import { AppComponents, IWSRegistryComponent, WebSocket } from '../types'
import {
  createInitMessage,
  createParticipantJoinedMessage,
  createParticipantLeftMessage,
  decodeMessage,
  MessageType
} from '../logic/protocol'

export function createWSRegistry(
  { logs }: Pick<AppComponents, 'logs'>,
  broadcast: (roomId: string, message: Uint8Array) => void
): IWSRegistryComponent {
  const logger = logs.getLogger('ws-registry')
  const registry = new Map<string, Set<WebSocket>>()

  function getRoom(sessionId: string): Set<WebSocket> {
    if (!registry.has(sessionId)) {
      logger.debug('Creating room', { sessionId })
      registry.set(sessionId, new Set<WebSocket>())
    }
    return registry.get(sessionId)!
  }

  function removeFromRoom(socket: WebSocket) {
    const roomInstance = getRoom(socket.sessionId)
    logger.debug('Disconnecting user', {
      room: socket.sessionId,
      address: socket.address!,
      count: roomInstance.size
    })

    roomInstance.delete(socket)

    if (roomInstance.size === 0) {
      logger.debug('Destroying room', {
        room: socket.sessionId,
        count: roomInstance.size
      })
      registry.delete(socket.sessionId)
    }

    socket.off('message')

    broadcast(socket.sessionId, createParticipantLeftMessage(socket.address))
  }

  // receives an authenticated socket and adds it to a room
  function addSocketToRoom(ws: WebSocket) {
    if (!ws.address) throw new Error('Socket did not contain address')
    if (!ws.sessionId) throw new Error('Socket did not contain sessionId')

    const address = ws.address

    logger.debug('Connecting user', {
      room: ws.sessionId,
      address
    })

    const roomInstance = getRoom(ws.sessionId)

    // add the user to the room and hook the 'close', 'error' and 'message' events
    roomInstance.add(ws)

    ws.on('error', (err: any) => {
      logger.error(err)
      removeFromRoom(ws)
    })

    ws.on('close', () => {
      logger.debug('Websocket closed')
      removeFromRoom(ws)
    })

    ws.on('message', (data: ArrayBuffer) => {
      const [messageType] = decodeMessage(new Uint8Array(data))
      if (
        ![MessageType.Crdt, MessageType.ParticipantSelectedEntity, MessageType.ParticipantUnselectedEntity].includes(
          messageType
        )
      ) {
        logger.error(`Received invalid message type ${messageType}`)
        return
      }
      ws.publish(ws.sessionId, data, true)
    })

    // tell the user about the other participants in the room
    const peerIdentities: string[] = []
    for (const peer of roomInstance) {
      if (peer !== ws && peer.address) {
        peerIdentities.push(peer.address)
      }
    }
    const initMessage = createInitMessage(peerIdentities)
    if (ws.send(initMessage, true) !== 1) {
      logger.error('Closing connection: cannot send init message')
      try {
        ws.end()
      } catch {}
      return
    }

    // broadcast to all other participants in the room that this user is joining them
    const joinedMessage = createParticipantJoinedMessage(address)
    broadcast(ws.sessionId, joinedMessage)

    // subscribe the new user to the room
    ws.subscribe(ws.sessionId)
  }

  function getRooms(): string[] {
    const rooms: string[] = []
    for (const key of registry.keys()) {
      rooms.push(key)
    }
    return rooms
  }

  function getRoomCount(): number {
    return registry.size
  }

  function getConnectionCount(): number {
    let count = 0
    for (const session of registry.values()) {
      count += session.size
    }
    return count
  }

  return {
    getRooms,
    getRoomCount,
    getConnectionCount,
    addSocketToRoom,
    removeFromRoom
  }
}
