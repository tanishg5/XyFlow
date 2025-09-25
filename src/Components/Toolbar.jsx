import { Mail, Plus, Trash2, GitBranch } from 'lucide-react';

export default function Toolbar({ selectedNode, onAddNode, onRemoveSelected }) {
  const tools = [
    { id: 'email', label: 'Email', color: 'bg-blue-500', type: 'email', icon: Mail },
    { id: 'add-node', label: 'Add Node', color: 'bg-green-500', type: 'generic', icon: Plus },
    { id: 'remove-node', label: 'Remove Node', color: 'bg-red-500', type: 'remove', icon: Trash2 },
    { id: 'conditional', label: 'Conditional Split', color: 'bg-purple-500', type: 'conditional', icon: GitBranch },
  ];

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-gray-50 border-r border-gray-200 p-6 h-full w-52 flex flex-col items-start space-y-5 shadow-lg">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isDisabled = tool.type === 'remove' && (!selectedNode || selectedNode === '1');

        return (
          <button
            key={tool.id}
            className={`
              flex items-center w-full px-4 py-3 rounded-lg text-white justify-start space-x-2
              ${tool.color} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
              shadow-md transition-all duration-150
            `}
            draggable={tool.type !== 'remove'}
            onDragStart={tool.type !== 'remove' ? (e) => onDragStart(e, tool.type) : undefined}
            onClick={() => {
              if (tool.type === 'remove') onRemoveSelected();
              else onAddNode(tool.type);
            }}
            disabled={isDisabled}
          >
            <Icon size={18} />
            <span className="font-medium text-sm">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
