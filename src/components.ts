import { createDotEnvConfigComponent } from '@well-known-components/env-config-provider'
import { createStatusCheckComponent, getUnderlyingServer } from '@well-known-components/http-server'
import { createLogComponent } from '@well-known-components/logger'
import { createMetricsComponent, instrumentHttpServerWithMetrics } from '@well-known-components/metrics'
import { createFetchComponent } from '@well-known-components/fetch-component'
import { AppComponents, GlobalContext } from './types'
import { metricDeclarations } from './metrics'
import { createUwsHttpServer } from '@well-known-components/http-server/dist/uws'
import { createWSRegistry } from './adapters/wsRegistry'
import { TemplatedApp } from 'uWebSockets.js'

// Initialize all the components of the app
export async function initComponents(): Promise<AppComponents> {
  const config = await createDotEnvConfigComponent({ path: ['.env.default', '.env'] })
  const metrics = await createMetricsComponent(metricDeclarations, { config })
  const logs = await createLogComponent({ metrics })

  const server = await createUwsHttpServer<GlobalContext>({ config, logs }, { compression: false, idleTimeout: 90 })
  await instrumentHttpServerWithMetrics({ metrics, server, config })

  const statusChecks = await createStatusCheckComponent({ server, config })
  const fetch = createFetchComponent()
  const uws = await getUnderlyingServer<TemplatedApp>(server)

  const wsRegistry = createWSRegistry({ logs, metrics }, (room, message) => {
    uws.publish(room, message, true)
  })

  return {
    config,
    logs,
    server,
    statusChecks,
    fetch,
    metrics,
    wsRegistry
  }
}
