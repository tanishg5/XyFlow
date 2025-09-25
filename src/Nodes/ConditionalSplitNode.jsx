import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

function ConditionalSplitNode({ data }) {
  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-purple-500 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} />
      
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-full">
          <GitBranch className="text-purple-600" size={16} />
        </div>
        <div>
          <div className="font-semibold">{data.label}</div>
          <div className="text-sm text-gray-600">Split based on condition</div>
        </div>
      </div>
    </div>
  );
}

export default ConditionalSplitNode;