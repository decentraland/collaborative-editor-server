export enum MessageType {
  Init = 1,
  ParticipantJoined = 2,
  ParticipantLeft = 3,
  Crdt = 4
}

const decoder = new TextDecoder()
const encoder = new TextEncoder()

export function decodeMessage(data: Uint8Array): [MessageType, Uint8Array] {
  const msgType = data.at(0) as number
  return [msgType, data.subarray(1)]
}

export function encodeMessage(msgType: MessageType, message: Uint8Array): Uint8Array {
  const packet = new Uint8Array(message.byteLength + 1)
  packet.set([msgType])
  packet.set(message, 1)
  return packet
}

export function createParticipantJoinedMessage(address: string): Uint8Array {
  return encodeMessage(MessageType.ParticipantJoined, new Uint8Array(encoder.encode(address)))
}

export function createParticipantLeftMessage(address: string): Uint8Array {
  return encodeMessage(MessageType.ParticipantLeft, new Uint8Array(encoder.encode(address)))
}

export function createCrdtMessage(crdt: Uint8Array): Uint8Array {
  return encodeMessage(MessageType.Crdt, crdt)
}

export function createInitMessage(participants: string[]): Uint8Array {
  const data = JSON.stringify(participants)
  const buff = new Uint8Array(data.length + 1)
  const view = new DataView(buff.buffer)
  let offset = 0
  view.setUint8(offset, MessageType.Init)
  offset += 1
  buff.set(encoder.encode(data), offset)
  return buff
}

export function decodeJSON(data: Uint8Array) {
  return JSON.parse(decoder.decode(data))
}
