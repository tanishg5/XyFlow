const layoutNodes = async (nodes, edges) => {
    const elkNodes = nodes.map(node => ({
      id: node.id,
      width: 200,   // adjust based on your node size
      height: 80,
    }));
  
    const elkEdges = edges.map(edge => ({
      id: edge.id || `${edge.source}-${edge.target}`,
      sources: [edge.source],
      targets: [edge.target],
    }));
  
    const graph = {
      id: 'root',
      layoutOptions: { 'elk.algorithm': 'layered' },
      children: elkNodes,
      edges: elkEdges,
    };
  
    const { children: laidOutNodes } = await elk.layout(graph);
  
    const updatedNodes = nodes.map(node => {
      const laidOutNode = laidOutNodes.find(n => n.id === node.id);
      return {
        ...node,
        position: { x: laidOutNode.x, y: laidOutNode.y },
      };
    });
  
    return updatedNodes;
  };
  