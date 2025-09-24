import React, { useEffect, useState } from 'react'
import { Graph, GraphState } from '@gravity-ui/graph'
import {
  GraphCanvas,
  GraphBlock,
  useGraph,
  GraphBlockAnchor,
} from '@gravity-ui/graph/react'

const config = {
  settings: {
    // Camera controls
    canDragCamera: true,
    canZoomCamera: true,

    // Block interactions
    canDragBlocks: true,
    canDuplicateBlocks: true,
    canChangeBlockGeometry: 'all',

    // Connection settings
    canCreateNewConnections: true,
    canDeleteConnections: true,
    showConnectionArrows: true,
    useBezierConnections: true,

    // Visual settings
    scaleFontSize: 1,
    useBlocksAnchors: true,
    showConnectionLabels: false,
  },
  viewConfiguration: {
    colors: {
      block: {
        background: 'rgba(37, 27, 37, 1)',
        border: 'rgba(229, 229, 229, 0.2)',
        selectedBorder: 'rgba(255, 190, 92, 1)',
      },
      connection: {
        background: 'rgba(255, 255, 255, 0.5)',
        selectedBackground: 'rgba(234, 201, 74, 1)',
      },
      anchor: {
        background: 'rgba(255, 190, 92, 1)',
      },
      canvas: {
        layerBackground: 'rgba(22, 13, 27, 1)',
        dots: 'rgba(255, 255, 255, 0.2)',
      },
    },
  },
}

export function GraphEditorExample() {
  const { graph, setEntities, start } = useGraph(config)
  const [draggingAnchor, setDraggingAnchor] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setEntities({
      blocks: [
        {
          is: 'block-text',
          id: 'block1',
          x: 100,
          y: 100,
          width: 120,
          height: 80,
          selected: false,
          name: 'Block #1',
          anchors: [
            {
              id: 'block1_out',
              blockId: 'block1',
              type: 'OUT',
              position: 'right',
            },
          ],
        },
        {
          id: 'block2',
          is: 'block-action',
          x: 300,
          y: 100,
          width: 120,
          height: 80,
          selected: false,
          name: 'Block #2',
          anchors: [
            {
              id: 'block2_in',
              blockId: 'block2',
              type: 'IN',
              position: 'left',
            },
            {
              id: 'block2_out',
              blockId: 'block2',
              type: 'OUT',
              position: 'right',
            },
          ],
        },
        {
          id: 'block3',
          is: 'block-action',
          x: 500,
          y: 100,
          width: 120,
          height: 80,
          selected: false,
          name: 'Block #3',
          anchors: [
            {
              id: 'block3_in',
              blockId: 'block3',
              type: 'IN',
              position: 'left',
            },
          ],
        },
      ],
      connections: [],
    })
    start()
    graph.zoomTo('center', { padding: 100 })
  }, [graph, setEntities, start])

  // Обработчики событий мыши
  const handleMouseDown = (e, anchor) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Mouse down on anchor:', anchor)
    setDraggingAnchor(anchor)
  }

  const handleMouseUp = (e, targetAnchor) => {
    e.preventDefault()
    e.stopPropagation()

    if (
      draggingAnchor &&
      targetAnchor &&
      draggingAnchor.id !== targetAnchor.id
    ) {
      console.log(
        'Creating connection from:',
        draggingAnchor.id,
        'to:',
        targetAnchor.id
      )

      // Создаем новую связь
      const newConnection = {
        sourceBlockId: draggingAnchor.blockId,
        sourceAnchorId: draggingAnchor.id,
        targetBlockId: targetAnchor.blockId,
        targetAnchorId: targetAnchor.id,
      }

      // Получаем текущие связи и добавляем новую
      const currentConnections = graph.getConnections()
      const updatedConnections = [...currentConnections, newConnection]

      // Обновляем граф
      graph.setConnections(updatedConnections)
    }

    setDraggingAnchor(null)
  }

  const handleMouseMove = (e) => {
    if (draggingAnchor) {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
  }

  const renderBlockFn = (graph, block) => {
    return (
      <GraphBlock graph={graph} block={block}>
        {/* Block content */}
        <div className="block-content">{block.name}</div>

        {/* Render anchors */}
        {block.anchors?.map((anchor) => {
          return (
            <GraphBlockAnchor
              key={anchor.id}
              graph={graph}
              anchor={anchor}
              position="absolute"
              data-position={anchor.position}
              className={`anchor anchor-${anchor.type.toLowerCase()}`}
              onMouseDown={(e) => handleMouseDown(e, anchor)}
              onMouseUp={(e) => handleMouseUp(e, anchor)}
            />
          )
        })}
      </GraphBlock>
    )
  }

  return (
    <div
      className="graph-container"
      onMouseMove={handleMouseMove}
      onMouseUp={() => setDraggingAnchor(null)}
    >
      <GraphCanvas
        graph={graph}
        renderBlock={renderBlockFn}
        className="custom-graph"
      />

      {/* Временная пунктирная линия при перетаскивании */}
      {draggingAnchor && (
        <div
          className="connection-preview"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <line
              x1={mousePosition.x}
              y1={mousePosition.y}
              x2={mousePosition.x}
              y2={mousePosition.y}
              stroke="rgba(255, 190, 92, 0.8)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
