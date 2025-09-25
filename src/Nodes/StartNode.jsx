import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

function StartNode({ data }) {
  return (
    <div className="px-4 py-3 shadow-md rounded-full bg-white border-2 border-green-500 min-w-[120px] text-center">
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center justify-center space-x-2">
        <Play className="text-green-500" size={16} />
        <span className="font-semibold">{data.label}</span>
      </div>
    </div>
  );
}

export default StartNode;