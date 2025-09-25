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





// import React, { useState, useCallback } from 'react';
// import {
//   ReactFlow,
//   addEdge,
//   useNodesState,
//   useEdgesState,
//   Controls,
//   Background,
//   MiniMap,
//   Handle,
//   Position,
// } from '@xyflow/react';
// import { Mail, Plus, Trash2, GitBranch, Play } from 'lucide-react';

// import '@xyflow/react/dist/style.css';

// // Custom Node Components
// function StartNode({ data }) {
//   return (
//     <div className="px-4 py-3 shadow-md rounded-full bg-white border-2 border-green-500 min-w-[120px] text-center">
//       <Handle type="source" position={Position.Bottom} />
//       <div className="flex items-center justify-center space-x-2">
//         <Play className="text-green-500" size={16} />
//         <span className="font-semibold"></span>
//       </div>
//     </div>
//   );
// }

// function EmailNode({ data }) {
//   return (
//     <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-blue-500 min-w-[200px]">
//       <Handle type="target" position={Position.Top} />
//       <Handle type="source" position={Position.Bottom} />
      
//       <div className="flex items-center space-x-3">
//         <div className="p-2 bg-blue-100 rounded-full">
//           <Mail className="text-blue-600" size={16} />
//         </div>
//         <div>
//           <div className="font-semibold">{data.label}</div>
//           <div className="text-sm text-gray-600">Send email to contacts</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ConditionalSplitNode({ data }) {
//   return (
//     <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-purple-500 min-w-[200px]">
//       <Handle type="target" position={Position.Top} />
//       <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} />
//       <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} />
      
//       <div className="flex items-center space-x-3">
//         <div className="p-2 bg-purple-100 rounded-full">
//           <GitBranch className="text-purple-600" size={16} />
//         </div>
//         <div>
//           <div className="font-semibold">{data.label}</div>
//           <div className="text-sm text-gray-600">Split based on condition</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Toolbar Component
// function Toolbar({ onAddNode, onRemoveSelected, selectedNode }) {
//   const tools = [
//     { 
//       id: 'email', 
//       label: 'Email', 
//       icon: Mail, 
//       color: 'bg-blue-500',
//       action: () => onAddNode('email')
//     },
//     { 
//       id: 'add-node', 
//       label: 'Add Node', 
//       icon: Plus, 
//       color: 'bg-green-500',
//       action: () => onAddNode('email')
//     },
//     { 
//       id: 'remove-node', 
//       label: 'Remove Node', 
//       icon: Trash2, 
//       color: 'bg-red-500',
//       action: onRemoveSelected,
//       disabled: !selectedNode
//     },
//     { 
//       id: 'conditional-split', 
//       label: 'Conditional Split', 
//       icon: GitBranch, 
//       color: 'bg-purple-500',
//       action: () => onAddNode('conditional')
//     },
//   ];

//   return (
//     <div className="bg-gray-100 border-b border-gray-200 p-4">
//       <div className="flex items-center space-x-4">
//         <h1 className="text-xl font-semibold text-gray-800">Workflow Builder</h1>
//         <div className="flex space-x-2">
//           {tools.map((tool) => {
//             const IconComponent = tool.icon;
//             return (
//               <button
//                 key={tool.id}
//                 onClick={tool.action}
//                 disabled={tool.disabled}
//                 className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${tool.color} ${
//                   tool.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
//                 } transition-opacity`}
//               >
//                 <IconComponent size={18} />
//                 <span>{tool.label}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Main Flow Component
// function FlowCanvas() {
//   const [nodes, setNodes, onNodesChange] = useNodesState([
//     {
//       id: '1',
//       type: 'start',
//       position: { x: 250, y: 50 },
//       data: { label: 'Start' },
//     },
//   ]);
  
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [selectedNode, setSelectedNode] = useState(null);

//   const onConnect = useCallback(
//     (params) => setEdges((eds) => addEdge(params, eds)),
//     [setEdges]
//   );

//   const onAddNode = useCallback((type) => {
//     const newNodeId = `${Date.now()}`;
//     const lastNode = nodes[nodes.length - 1];
    
//     const newNode = {
//       id: newNodeId,
//       type,
//       position: { 
//         x: lastNode.position.x, 
//         y: lastNode.position.y + 120 
//       },
//       data: { 
//         label: type === 'email' ? 'Send Email' : 
//                type === 'conditional' ? 'Conditional Split' : 'New Node' 
//       },
//     };

//     setNodes((nds) => [...nds, newNode]);
//   }, [nodes, setNodes]);

//   const onRemoveSelected = useCallback(() => {
//     if (selectedNode && selectedNode !== '1') { // Don't remove start node
//       setNodes((nds) => nds.filter(node => node.id !== selectedNode));
//       setEdges((eds) => eds.filter(edge => 
//         edge.source !== selectedNode && edge.target !== selectedNode
//       ));
//       setSelectedNode(null);
//     }
//   }, [selectedNode, setNodes, setEdges]);

//   const onNodeClick = useCallback((event, node) => {
//     setSelectedNode(node.id);
//   }, []);

//   const onPaneClick = useCallback(() => {
//     setSelectedNode(null);
//   }, []);

//   const nodeTypes = {
//     start: StartNode,
//     email: EmailNode,
//     conditional: ConditionalSplitNode,
//   };

//   return (
//     <div className="h-full w-full">
//       <Toolbar onAddNode={onAddNode} onRemoveSelected={onRemoveSelected} selectedNode={selectedNode} />
      
//       <div className="h-[calc(100vh-80px)]">
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           onConnect={onConnect}
//           onNodeClick={onNodeClick}
//           onPaneClick={onPaneClick}
//           nodeTypes={nodeTypes}
//           fitView
//           className="bg-gray-50"
//         >
//           <Controls />
//           <Background />
//           <MiniMap />
//         </ReactFlow>
//       </div>
//     </div>
//   );
// }

// function App() {
//   return (
//     <div className="h-screen w-screen">
//       <FlowCanvas />
//     </div>
//   );
// }

// export default App;