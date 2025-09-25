import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useCallback } from 'react';
import EmailNode from './Nodes/EmailNode';
import ConditionalSplitNode from './Nodes/ConditionalSplitNode';
import StartNode from './Nodes/StartNode';
import Toolbar from './Components/Toolbar';

function App() {
  const nodeTypes = {
    email: EmailNode,
    conditional: ConditionalSplitNode,
    start: StartNode,
    generic: StartNode,
  };

  const [nodes, setNodes] = useState([{ id: '1', type: 'start', position: { x: 500, y: 200 }, data: { label: 'Start' } }]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onNodeClick = useCallback((e, node) => setSelectedNode(node.id), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const onAddNode = useCallback(
    (type) => {
      const lastNode = nodes[nodes.length - 1];
      const newNode = {
        id: `${Date.now()}`,
        type,
        position: { x: lastNode.position.x, y: lastNode.position.y + 120 },
        data: { label: type === 'email' ? 'Send Email' : type === 'conditional' ? 'Conditional Split' : 'New Node' },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [nodes]
  );

  const onRemoveSelected = useCallback(() => {
    if (selectedNode && selectedNode !== '1') {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode));
      setSelectedNode(null);
    }
  }, [selectedNode]);

  // Drag-and-drop handlers
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = { x: event.clientX - reactFlowBounds.left, y: event.clientY - reactFlowBounds.top };
      const newNode = {
        id: `${Date.now()}`,
        type,
        position,
        data: { label: type === 'email' ? 'Send Email' : type === 'conditional' ? 'Conditional Split' : 'New Node' },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  return (
    <div className="h-full w-full flex">
      <Toolbar selectedNode={selectedNode} onAddNode={onAddNode} onRemoveSelected={onRemoveSelected} />
      <div className="flex-1" style={{ height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
