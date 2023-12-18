import { IMetricsComponent } from '@well-known-components/interfaces'
import { getDefaultHttpMetrics, validateMetricsDeclaration } from '@well-known-components/metrics'
import { metricDeclarations as logsMetricsDeclarations } from '@well-known-components/logger'

export const metricDeclarations = {
  ...getDefaultHttpMetrics(),
  ...logsMetricsDeclarations,
  collaborative_editor_server_room_count: {
    help: 'Current number of rooms',
    type: IMetricsComponent.GaugeType
  },
  collaborative_editor_server_connection_count: {
    help: 'Current number of connected peers',
    type: IMetricsComponent.GaugeType
  },
  collaborative_editor_server_recv_bytes: {
    help: 'Received size in bytes per room',
    type: IMetricsComponent.CounterType,
    labelNames: ['room', 'msg_type']
  },
  collaborative_editor_server_sent_bytes: {
    help: 'Sent size in bytes per room',
    type: IMetricsComponent.CounterType,
    labelNames: ['room', 'msg_type']
  },
  collaborative_editor_server_recv_count: {
    help: 'Received number of messages per room',
    type: IMetricsComponent.GaugeType,
    labelNames: ['room', 'msg_type']
  },
  collaborative_editor_server_sent_count: {
    help: 'Sent number of messages per room',
    type: IMetricsComponent.GaugeType,
    labelNames: ['room', 'msg_type']
  },
  collaborative_editor_server_unknown_sent_messages_total: {
    help: 'Total amount of unknown messages received',
    type: IMetricsComponent.CounterType,
    labelNames: ['room']
  }
}

// type assertions
validateMetricsDeclaration(metricDeclarations)
