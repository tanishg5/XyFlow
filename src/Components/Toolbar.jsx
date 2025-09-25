import React from 'react';
import { Mail, Plus, Trash2, GitBranch } from 'lucide-react';

function Toolbar({ onAddNode, onRemoveSelected, selectedNode }) {
  const tools = [
    { id: 'email', label: 'Email', icon: Mail, color: 'bg-blue-500',  action: () => onAddNode('email') },
    { id: 'add-node', label: 'Add Node', icon: Plus, color: 'bg-green-500' , action: () => onAddNode('email') },
    { id: 'remove-node', label: 'Remove Node', icon: Trash2, color: 'bg-red-500' ,   disabled: !selectedNode || selectedNode === '1' , action: () => onRemoveSelected()},
    { id: 'conditional-split', label: 'Conditional Split', icon: GitBranch, color: 'bg-purple-500',   action: () => onAddNode('conditional') },
  ];

  return (
    <div className="bg-gray-100 border-r border-gray-200 p-4 h-full w-48 flex flex-col items-start space-y-4">
  <img
    src="https://media.licdn.com/dms/image/v2/D560BAQFcFE5z-JBG1Q/company-logo_200_200/B56ZjVYy1XH8AI-/0/1755926706826/brixi_logo?e=1761782400&v=beta&t=5e-4Vxk1rD3qk53GRx-7KK1TzPfKekPzDNFgOIWywnE"
    alt="Logo"
    className="w-12 h-12 rounded-full mb-4 object-cover"
  />
  {tools.map((tool) => {
    const IconComponent = tool.icon;
    return (
      <button
        key={tool.id}
        onClick={tool.action}
        disabled={tool.disabled}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${tool.color} ${
          tool.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
        } transition-opacity w-full justify-start`}
      >
        <IconComponent size={18} />
        <span>{tool.label}</span>
      </button>
    );
  })}
</div>

  );
}

export default Toolbar;
