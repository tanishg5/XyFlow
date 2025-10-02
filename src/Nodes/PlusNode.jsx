import { Handle, Position } from '@xyflow/react';

export default function PlusNode({ data }) {
  return (
    <div className="relative p-3 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg text-center text-gray-600 cursor-pointer hover:bg-gray-300 transition-all">
      {data.label || '+'}

      <Handle
        type="target"
        position={Position.Top}
        id="plus-target"
      />
    </div>
  );
}
