/**
 * Task Manager Component
 */

import React from 'react';
import { CheckSquare } from 'lucide-react';

interface TaskManagerProps {
  tasks?: any[];
  onTaskUpdate?: (taskId: string, data: any) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <CheckSquare className="w-6 h-6 text-green-500" />
        <h2 className="text-xl font-semibold text-gray-900">Task Manager</h2>
      </div>
      <div className="space-y-3">
        {['Book venue', 'Send invitations', 'Choose menu'].map((task, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              aria-label={`Task: ${task}`}
            />
            <span className="text-gray-900">{task}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
