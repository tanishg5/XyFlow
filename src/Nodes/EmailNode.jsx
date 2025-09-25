import { Handle, Position } from '@xyflow/react';
import { Mail } from 'lucide-react';
function EmailNode({ data }) {
  return (
    <div className="px-4 py-3 shadow-md rounded-md bg-white border-2 border-blue-500 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <Mail className="text-blue-600" size={16} />
        </div>
        <div>
          <div className="font-semibold">{data.label}</div>
          <div className="text-sm text-gray-600">Send email to contacts</div>
        </div>
      </div>
    </div>
  );
}

export default EmailNode;