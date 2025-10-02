import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useCallback } from 'react';
import StartNode from './Nodes/StartNode';
import EmailNode from './Nodes/EmailNode';
import ConditionalSplitNode from './Nodes/ConditionalSplitNode';
import PlusNode from './Nodes/PlusNode';
import Toolbar from './Components/Toolbar';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

async function layoutGraph(nodes, edges) {
  const elkNodes = nodes.map((node) => ({
    id: node.id,
    width: 220,
    height: 90,
  }));

  const elkEdges = edges.map((edge) => ({
    id: edge.id || `${edge.source}-${edge.target}`,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.layered.direction': 'DOWN',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      'elk.spacing.nodeNode': '80'
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const { children: laidOut } = await elk.layout(graph);
  const idToPos = new Map(laidOut.map((n) => [n.id, { x: n.x || 0, y: n.y || 0 }]));
  return nodes.map((n) => ({ ...n, position: idToPos.get(n.id) || n.position }));
}

function App() {
  const reactFlow = useReactFlow();

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
      const timestampBase = Date.now();

      // Incoming edges into the selected node
      const incomingEdges = edges.filter((e) => e.target === selectedNode);

      // Direct outgoing targets from the selected node
      const directOutgoing = edges.filter((e) => e.source === selectedNode).map((e) => e.target);

      // Expand outgoing targets by skipping over any immediate plus placeholders to reach real nodes
      const expandedOutgoingTargets = new Set();
      const plusNodesToRemove = new Set();

      directOutgoing.forEach((targetId) => {
        const targetNode = nodes.find((n) => n.id === targetId);
        if (!targetNode) return;
        if (targetNode.type !== 'plus') {
          expandedOutgoingTargets.add(targetId);
        } else {
          // mark this placeholder for removal
          plusNodesToRemove.add(targetId);
          // find the next real nodes that this plus connects to (if any)
          const nextTargets = edges.filter((e) => e.source === targetId).map((e) => e.target);
          nextTargets.forEach((nt) => {
            const ntNode = nodes.find((n) => n.id === nt);
            if (ntNode && ntNode.type !== 'plus') {
              expandedOutgoingTargets.add(nt);
            }
          });
        }
      });

      const outgoingTargets = Array.from(expandedOutgoingTargets);

      // Build replacement edges. If there are downstream targets, connect each incoming source to each downstream target.
      // If there are no downstream targets, create a replacement plus under each incoming source and connect to it.
      const replacementEdges = [];
      const replacementPlusNodes = [];

      if (outgoingTargets.length > 0) {
        incomingEdges.forEach((incEdge, idx) => {
          outgoingTargets.forEach((tId) => {
            replacementEdges.push({
              id: `edge-${incEdge.source}-${tId}-${timestampBase}-${idx}`,
              source: incEdge.source,
              target: tId,
              sourceHandle: incEdge.sourceHandle,
            });
          });
        });
      } else {
        // No downstream, fallback to placeholder
        const spacingX = 150;
        const offsetY = 150;
        incomingEdges.forEach((incEdge, idx) => {
          const sourceNode = nodes.find((n) => n.id === incEdge.source);
          const xOffset = incEdge.sourceHandle === 'true' ? -spacingX : incEdge.sourceHandle === 'false' ? spacingX : 0;
          const plusId = `plus-${timestampBase}-${idx}`;
          replacementPlusNodes.push({
            id: plusId,
            type: 'plus',
            position: { x: (sourceNode?.position.x || 0) + xOffset, y: (sourceNode?.position.y || 0) + offsetY },
            data: { label: '+' },
          });
          replacementEdges.push({
            id: `edge-${incEdge.source}-${plusId}-${timestampBase}-${idx}`,
            source: incEdge.source,
            target: plusId,
            sourceHandle: incEdge.sourceHandle,
          });
        });
      }

      // Remove the selected node and any child plus placeholders we decided to drop
      const nextNodes = nodes.filter(
        (n) => n.id !== selectedNode && !plusNodesToRemove.has(n.id)
      ).concat(replacementPlusNodes);

      // Remove edges connected to the selected node and to any removed child plus nodes, then add replacement edges
      const nextEdges = edges.filter(
        (e) =>
          e.source !== selectedNode &&
          e.target !== selectedNode &&
          !plusNodesToRemove.has(e.source) &&
          !plusNodesToRemove.has(e.target)
      ).concat(replacementEdges);

      setNodes(nextNodes);
      setEdges(nextEdges);

      // Re-layout smoothly after removal
      layoutGraph(nextNodes, nextEdges).then((laidOutNodes) => {
        setNodes(laidOutNodes);
        reactFlow.fitView({ padding: 0.2, duration: 500 });
      });

      setSelectedNode(null);
    }
  }, [selectedNode, nodes, edges, reactFlow]);
  

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
  
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      // Map toolbar's generic "Add" to an email node type
      const normalizedType = type === 'generic' ? 'email' : type;
  
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
        type: normalizedType,
        position: plusNode.position,
        data: {
          label:
            normalizedType === 'email'
              ? 'Send Email'
              : normalizedType === 'conditional'
              ? 'Conditional Split'
              : 'New Node',
        },
      };
  
      // Determine source handles
      const sourceHandles = normalizedType === 'conditional' ? ['true', 'false'] : ['default'];
  
      // Create + nodes for each source handle below the new node and spread horizontally
      const spacing = 200;
      const startX = plusNode.position.x - ((sourceHandles.length - 1) * spacing) / 2;
      const newPlusNodes = sourceHandles.map((h, idx) => ({
        id: `plus-${Date.now()}-${idx}`,
        type: 'plus',
        position: { x: startX + idx * spacing, y: plusNode.position.y + 150 },
        data: { label: '+' },
      }));
  
      // Update nodes: replace + node with new node, add new + nodes
      const nextNodes = nodes.map((n) => (n.id === plusNode.id ? newNode : n)).concat(newPlusNodes);
  
      // Update edges
      const incomingEdges = edges.filter((e) => e.target === plusNode.id);
      const nextEdges = [
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

      setNodes(nextNodes);
      setEdges(nextEdges);

      // Re-layout smoothly after insertion
      layoutGraph(nextNodes, nextEdges).then((laidOutNodes) => {
        setNodes(laidOutNodes);
        reactFlow.fitView({ padding: 0.2, duration: 500 });
      });
    },
    [nodes, edges, reactFlow]
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
