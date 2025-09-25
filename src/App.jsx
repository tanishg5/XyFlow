import { ReactFlow, Background, Controls, applyEdgeChanges, applyNodeChanges , addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState, useCallback } from 'react';
import EmailNode from './Nodes/EmailNode';
import ConditionalSplitNode from './Nodes/ConditionalSplitNode';
import StartNode from './Nodes/StartNode';
import Toolbar from './Components/Toolbar';
function App() {
  const nodeTypes = {
    email: EmailNode,
    conditional : ConditionalSplitNode,
    start: StartNode
  };
  const initialNodes = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'start' } , type: 'start' },
  ];

  const initialEdges = [];


  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const onAddNode = (type) => {
    const newNodeId = `${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    
    const newNode = {
      id: newNodeId,
      type,
      position: { 
        x: lastNode.position.x, 
        y: lastNode.position.y + 120 
      },
      data: { 
        label: type === 'email' ? 'Send Email' : 
               type === 'conditional' ? 'Conditional Split' : 'New Node' 
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const onRemoveSelected = () => {
    if (selectedNode && selectedNode !== '1') {
      setNodes((nds) => nds.filter(node => node.id !== selectedNode));
      setEdges((eds) => eds.filter(edge => 
        edge.source !== selectedNode && edge.target !== selectedNode
      ));
      setSelectedNode(null);
    }
    else {
      console.log("hoi");
    }
  }

  const onNodeClick = useCallback((event , node) => {
    setSelectedNode(node.id);
    console.log(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
  <div className="h-full w-full flex">
  <Toolbar onAddNode={onAddNode} onRemoveSelected={onRemoveSelected} selectedNode={selectedNode} />
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
    >
      <Background />
      <Controls />
    </ReactFlow>
  </div>
</div>
  );
}

export default App;




