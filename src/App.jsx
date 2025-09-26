import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useCallback } from 'react';
import StartNode from './Nodes/StartNode';
import EmailNode from './Nodes/EmailNode';
import ConditionalSplitNode from './Nodes/ConditionalSplitNode';
import PlusNode from './Nodes/PlusNode';
import Toolbar from './Components/Toolbar';

function App() {
  const nodeTypes = {
    start: StartNode,
    email: EmailNode,
    conditional: ConditionalSplitNode,
    plus: PlusNode,
  };

  const initialNodes = [
    { id: 'start-1', type: 'start', position: { x: 500, y: 200 }, data: { label: 'Start' } },
    { id: 'plus-1', type: 'plus', position: { x: 500, y: 350 }, data: { label: '+' } },
  ];

  const initialEdges = [{ id: 'edge-start-1-plus-1', source: 'start-1', target: 'plus-1' }];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onNodeClick = useCallback((e, node) => setSelectedNode(node.id), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const onRemoveSelected = useCallback(() => {
    if (selectedNode && !selectedNode.startsWith('start') && !selectedNode.startsWith('plus')) {
      // Remove only non-plus nodes
      setNodes((nds) =>
        nds.filter((n) => n.id !== selectedNode)
      );
  
      // Remove edges connected to deleted node dont keep edges connected to plus nodes
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode));
  
      setSelectedNode(null);
    }
  }, [selectedNode]);
  

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
  
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;
  
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const dropX = event.clientX - reactFlowBounds.left;
      const dropY = event.clientY - reactFlowBounds.top;
  
      // Find the + node closest to drop position
      const plusNodes = nodes.filter((n) => n.type === 'plus');
      if (!plusNodes.length) return;
  
      let plusNode = plusNodes[0];
      let minDistance = Infinity;
      plusNodes.forEach((n) => {
        const dx = n.position.x - dropX;
        const dy = n.position.y - dropY;
        const dist = dx * dx + dy * dy;
        if (dist < minDistance) {
          plusNode = n;
          minDistance = dist;
        }
      });
  
      // Create new node at + node's position
      const newNodeId = `node-${Date.now()}`;
      const newNode = {
        id: newNodeId,
        type,
        position: plusNode.position,
        data: {
          label:
            type === 'email'
              ? 'Send Email'
              : type === 'conditional'
              ? 'Conditional Split'
              : 'New Node',
        },
      };
  
      // Determine source handles
      const sourceHandles = type === 'conditional' ? ['true', 'false'] : ['default'];
  
      // Create + nodes for each source handle
      const spacing = 200;
      const startX = plusNode.position.x - ((sourceHandles.length - 1) * spacing) / 2;
      const newPlusNodes = sourceHandles.map((h, idx) => ({
        id: `plus-${Date.now()}-${idx}`,
        type: 'plus',
        position: { x: startX + idx * spacing, y: plusNode.position.y + 150 },
        data: { label: '+' },
      }));
  
      // Update nodes: replace + node with new node, add new + nodes
      setNodes((nds) =>
        nds.map((n) => (n.id === plusNode.id ? newNode : n)).concat(newPlusNodes)
      );
  
      // Update edges
      const incomingEdges = edges.filter((e) => e.target === plusNode.id);
      const updatedEdges = [
        // Remove edges connected to old + node
        ...edges.filter((e) => e.source !== plusNode.id && e.target !== plusNode.id),
        // Reconnect incoming edges to the new node
        ...incomingEdges.map((e) => ({ ...e, target: newNode.id })),
        // Connect new node's source handles to new + nodes
        ...newPlusNodes.map((p, idx) => ({
          id: `edge-${newNodeId}-${p.id}`,
          source: newNodeId,
          target: p.id,
          sourceHandle: sourceHandles[idx] !== 'default' ? sourceHandles[idx] : undefined,
        })),
      ];
  
      setEdges(updatedEdges);
    },
    [nodes, edges]
  );
  


  const handleAddNode = (type) => {
    const mockEvent = { dataTransfer: { getData: () => type }, preventDefault: () => {} };
    onDrop(mockEvent);
  };

  return (
    <div className="h-full w-full flex">
      <Toolbar selectedNode={selectedNode} onRemoveSelected={onRemoveSelected} onAddNode={handleAddNode} />
      <div className="flex-1" style={{ height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
