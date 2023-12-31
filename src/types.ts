import type { IFetchComponent } from '@well-known-components/http-server'
import {
  IBaseComponent,
  IConfigComponent,
  IHttpServerComponent,
  ILoggerComponent,
  IMetricsComponent
} from '@well-known-components/interfaces'
import { metricDeclarations } from './metrics'
import { WsUserData } from '@well-known-components/http-server/dist/uws'
import { DecentralandSignatureContext } from '@dcl/platform-crypto-middleware'

export type GlobalContext = {
  components: BaseComponents
}

// components used in every environment
export type BaseComponents = {
  config: IConfigComponent
  logs: ILoggerComponent
  server: IHttpServerComponent<GlobalContext>
  fetch: IFetchComponent
  metrics: IMetricsComponent<keyof typeof metricDeclarations>
  wsRegistry: IWSRegistryComponent
}

// components used in runtime
export type AppComponents = BaseComponents & {
  statusChecks: IBaseComponent
}

// components used in tests
export type TestComponents = BaseComponents & {
  // A fetch component that only hits the test server
  localFetch: IFetchComponent
}

// this type simplifies the typings of http handlers
export type HandlerContextWithPath<
  ComponentNames extends keyof AppComponents,
  Path extends string = any
> = IHttpServerComponent.PathAwareContext<
  IHttpServerComponent.DefaultContext<{
    components: Pick<AppComponents, ComponentNames>
  }>,
  Path
> &
  DecentralandSignatureContext<any>

export type Context<Path extends string = any> = IHttpServerComponent.PathAwareContext<GlobalContext, Path>

export type IWSRegistryComponent = {
  getRooms(): string[]
  getRoomCount(): number
  getConnectionCount(): number
  removeFromRoom(socket: WebSocket): void
  addSocketToRoom(ws: WebSocket): void
}

export type WebSocket = WsUserData & {
  address: string
  sessionId: string
}
