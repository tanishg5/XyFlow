import { Handle, Position } from '@xyflow/react';

export default function PlusNode({ data }) {
  return (
    <div className="relative p-3 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg text-center text-gray-600 cursor-pointer hover:bg-gray-300 transition-all">
      {data.label || '+'}

      {/* Target handle in center so nodes can be dropped here */}
      <Handle
        type="target"
        position={Position.Top}
        id="plus-target"
        style={{
          width: 20,
          height: 20,
          background: '#9ca3af',
          borderRadius: '50%',
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          border: '2px solid #6b7280',
        }}
      />
    </div>
  );
}
