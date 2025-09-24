import { useEffect, useLayoutEffect, useRef } from 'react'
import { ConnectionLayer } from '@gravity-ui/graph'
import {
  GraphCanvas,
  GraphBlock,
  useGraph,
  GraphBlockAnchor,
  useGraphEvent,
} from '@gravity-ui/graph/react'

const config = {
  viewConfiguration: {
    colors: {
      selection: {
        background: 'rgba(255, 190, 92, 0.1)',
        border: 'rgba(255, 190, 92, 1)',
      },
      connection: {
        background: 'rgba(189, 92, 10, 0.5)',
        selectedBackground: 'rgba(234, 201, 74, 1)',
      },
      block: {
        background: 'rgba(255, 255, 255, 1)',
        border: 'rgba(229, 229, 229, 0.2)',
        selectedBorder: 'rgba(255, 190, 92, 1)',
        text: 'rgba(255, 255, 255, 1)',
      },
      anchor: {
        background: 'rgba(255, 190, 92, 1)',
      },
      canvas: {
        layerBackground: 'rgba(255, 255, 255, 1)',
        belowLayerBackground: 'rgba(255, 255, 255, 1)',
        dots: 'rgba(35,33,33,0.4)',
        border: 'rgba(35,33,33,0.4)',
      },
    },
    constants: {
      block: {
        SCALES: [0.1, 0.2, 0.5],
      },
    },
  },
  settings: {
    canDragCamera: true,
    canZoomCamera: true,
    canDuplicateBlocks: false,
    canChangeBlockGeometry: 'all',
    canCreateNewConnections: true,
    showConnectionArrows: false,
    scaleFontSize: 1,
    useBezierConnections: true,
    useBlocksAnchors: true,
    showConnectionLabels: false,
  },
}

const blockList = [
  {
    is: 'block-text',
    id: 'block1',
    x: 100,
    y: 100,
    width: 150,
    height: 175,
    selected: false,
    name: 'Вопрос ID#1',
    content: ['Ответ 1', 'Ответ 2', 'Ответ 3'],
    anchors: [
      {
        id: 'question_in1',
        blockId: 'block1',
        type: 'IN',
        position: 'top',
      },
      {
        id: 'question_out1',
        blockId: 'block1',
        type: 'OUT',
        position: 'top',
      },
      {
        id: 'answer1_1',
        blockId: 'block1',
        type: 'OUT',
      },
      {
        id: 'answer1_2',
        blockId: 'block1',
        type: 'OUT',
      },
      {
        id: 'answer1_3',
        blockId: 'block1',
        type: 'OUT',
      },
    ],
  },
  {
    id: 'block2',
    is: 'block-action',
    x: 300,
    y: 100,
    width: 150,
    height: 175,
    selected: false,
    name: 'Вопрос ID#2',
    content: ['Ответ 1', 'Ответ 2', 'Ответ 3'],
    anchors: [
      {
        id: 'question_in2',
        blockId: 'block2',
        type: 'IN',
        position: 'top',
      },
      {
        id: 'question_out2',
        blockId: 'block2',
        type: 'OUT',
        position: 'top',
      },
      {
        id: 'answer2_1',
        blockId: 'block2',
        type: 'OUT',
      },
      {
        id: 'answer2_2',
        blockId: 'block2',
        type: 'OUT',
      },
      {
        id: 'answer2_3',
        blockId: 'block2',
        type: 'OUT',
      },
    ],
  },
  {
    id: 'block3',
    is: 'block-action',
    x: 500,
    y: 100,
    width: 150,
    height: 175,
    selected: false,
    name: 'Вопрос ID#3',
    content: ['Ответ 1', 'Ответ 2', 'Ответ 3'],
    anchors: [
      {
        id: 'question_in3',
        blockId: 'block3',
        type: 'IN',
        position: 'top',
      },
      {
        id: 'quation_out3',
        blockId: 'block3',
        type: 'OUT',
        position: 'top',
      },
      {
        id: 'answer3_1',
        blockId: 'block3',
        type: 'OUT',
      },
      {
        id: 'answer3_2',
        blockId: 'block3',
        type: 'OUT',
      },
      {
        id: 'answer3_3',
        blockId: 'block3',
        type: 'OUT',
      },
    ],
  },
]

export function GraphEditor() {
  const { graph, setEntities, start, addLayer } = useGraph(config)
  const connectionLayerRef = useRef(null)

  useEffect(() => {
    setEntities({
      blocks: blockList,
      connections: [],
    })
    start()
    graph.zoomTo('center', { padding: 100 })
  }, [graph, setEntities, start])

  useLayoutEffect(() => {
    const drawLine = (start, end) => {
      const path = new Path2D()
      path.moveTo(start.x, start.y)
      path.lineTo(end.x, end.y)

      return {
        path,
        style: {
          color: config.viewConfiguration.colors.connection.selectedBackground,
          dash: [4, 4],
        },
      }
    }

    connectionLayerRef.current = addLayer(ConnectionLayer, {
      drawLine,
    })
  }, [])

  const renderBlockFn = (graph, block) => {
    return (
      <GraphBlock graph={graph} block={block}>
        {/* Block content */}
        <div className="title">{block.name}</div>
        <div className="answers">
          {block.content.map((answer) => (
            <div className="answer" key={answer}>
              {answer}
            </div>
          ))}
        </div>

        {/* Render anchors */}
        {block.anchors?.map((anchor) => {
          return (
            <GraphBlockAnchor
              key={anchor.id}
              graph={graph}
              anchor={anchor}
              position="absolute"
              data-test="42"
              className={`anchor ${anchor.position}`}
            />
          )
        })}
      </GraphBlock>
    )
  }

  useGraphEvent(
    graph,
    'connection-create-drop',
    ({ sourceAnchorId, targetAnchorId }) => {
      const isSourceQuestionOut = sourceAnchorId.startsWith('question_out')
      const isTargetQuestionOut = targetAnchorId?.startsWith('question_out')

      const isSourceAnswer = sourceAnchorId.startsWith('answer')
      const isTargetAnswer = targetAnchorId?.startsWith('answer')

      if (
        (isSourceQuestionOut && isTargetAnswer) ||
        (isSourceAnswer && isTargetQuestionOut)
      ) {
        const connectionToDelete = graph.connections.$connectionsMap.value.get(
          `${sourceAnchorId}:${targetAnchorId}`
        )

        graph.rootStore.connectionsList.deleteConnections([connectionToDelete])
      }

      const connections = graph.rootStore.getAsConfig().connections

      const conflicts = connections
        .filter(
          (item, i) =>
            (item.sourceAnchorId === sourceAnchorId ||
              item.targetAnchorId === targetAnchorId ||
              item.sourceAnchorId === targetAnchorId ||
              item.targetAnchorId === sourceAnchorId) &&
            i < connections.length - 1
        )
        .map((item) => item.id)

      if (conflicts.length) {
        const connectionsToDelete =
          graph.rootStore.connectionsList.getConnections(conflicts)

        graph.rootStore.connectionsList.deleteConnections(connectionsToDelete)
      }
    }
  )

  return (
    <GraphCanvas
      graph={graph}
      renderBlock={renderBlockFn}
      className="custom-graph"
    />
  )
}
1
