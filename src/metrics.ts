import { IMetricsComponent } from '@well-known-components/interfaces'
import { getDefaultHttpMetrics, validateMetricsDeclaration } from '@well-known-components/metrics'
import { metricDeclarations as logsMetricsDeclarations } from '@well-known-components/logger'

export const metricDeclarations = {
  ...getDefaultHttpMetrics(),
  ...logsMetricsDeclarations,
  collaborative_editor_server_connection_count: {
    help: 'Number of connected peers',
    type: IMetricsComponent.GaugeType
  },
  collaborative_editor_server_state_size: {
    help: 'Collaborative editor state size in bytes',
    type: IMetricsComponent.GaugeType,
    labelNames: ['hash']
  },
  collaborative_editor_server_sent_bytes: {
    help: 'Sent size in bytes',
    type: IMetricsComponent.HistogramType,
    labelNames: ['hash']
  },
  collaborative_editor_server_recv_bytes: {
    help: 'Receive size in bytes',
    type: IMetricsComponent.HistogramType,
    labelNames: ['hash']
  }
}

// type assertions
validateMetricsDeclaration(metricDeclarations)
