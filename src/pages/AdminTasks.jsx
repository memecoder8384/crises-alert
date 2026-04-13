import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Dispatch Engine 43', target: 'Warehouse Fire (Sector 7)', status: 'Pending', priority: 'High', assignee: 'Unassigned' },
    { id: 2, title: 'Coordinate Evacuation', target: 'Flash Flooding (Main Ave)', status: 'In Progress', priority: 'Critical', assignee: 'Unit Bravo' },
    { id: 3, title: 'Medical Triage Setup', target: 'Interstate Collision', status: 'Completed', priority: 'Medium', assignee: 'Unit Alpha' }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: '', target: '', assignee: '' });

  const updateStatus = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditDraft({ title: task.title, target: task.target, assignee: task.assignee });
  };

  const saveEdit = () => {
    setTasks(tasks.map(t => t.id === editingId ? { ...t, ...editDraft } : t));
    setEditingId(null);
  };

  const createTask = () => {
    const newId = Date.now();
    setTasks([{
      id: newId,
      title: '',
      target: '',
      priority: 'High',
      status: 'Pending',
      assignee: 'Unassigned'
    }, ...tasks]);
    setEditingId(newId);
    setEditDraft({ title: '', target: '', assignee: 'Unassigned' });
  };

  return (
    <DashboardLayout role="admin">
      <div className="h-full w-full flex flex-col space-y-6 text-left">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4 w-full">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Active Dispatches & Tasks</h1>
            <p className="text-secondary mt-1">Assign ground units and coordinate incident responses.</p>
          </div>
          <Button variant="primary" onClick={createTask}>
            <span className="material-symbols-outlined mr-2 text-[18px]">add_task</span>
            Create Dispatch Order
          </Button>
        </header>

        <Card className="flex-1 overflow-auto p-0 border-t-0 rounded-t-none">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container-high text-primary uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10 border-b border-outline-variant/20">
              <tr>
                <th className="px-6 py-4 border-b border-surface-container w-16 text-center">Edit</th>
                <th className="px-6 py-4 border-b border-surface-container">Task Directive</th>
                <th className="px-6 py-4 border-b border-surface-container">Incident Target</th>
                <th className="px-6 py-4 border-b border-surface-container">Priority</th>
                <th className="px-6 py-4 border-b border-surface-container">Status</th>
                <th className="px-6 py-4 border-b border-surface-container">Assigned Unit</th>
                <th className="px-6 py-4 border-b border-surface-container text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4 text-center">
                    {editingId === task.id ? (
                      <button onClick={saveEdit} title="Save Changes" className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-500/10 transition-colors flex items-center justify-center border border-emerald-500/30 bg-emerald-500/5 shadow-sm mx-auto">
                         <span className="material-symbols-outlined text-[16px]">save</span>
                      </button>
                    ) : (
                      <button onClick={() => startEdit(task)} title="Edit Task" className="p-1.5 rounded-md text-secondary hover:bg-surface-container-high transition-colors flex items-center justify-center border border-outline-variant/50 shadow-sm mx-auto">
                         <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-on-surface font-headline font-bold text-[15px]">
                    {editingId === task.id ? (
                      <input 
                        type="text" 
                        value={editDraft.title}
                        onChange={(e) => setEditDraft({...editDraft, title: e.target.value})}
                        className="w-full min-w-[200px] px-2 py-1.5 border border-primary/30 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-on-surface font-headline"
                        placeholder="Task Name..."
                        autoFocus
                      />
                    ) : (
                      task.title || <span className="italic text-secondary/50">Untitled Task</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-secondary">
                    {editingId === task.id ? (
                      <input 
                        type="text" 
                        value={editDraft.target}
                        onChange={(e) => setEditDraft({...editDraft, target: e.target.value})}
                        className="w-full px-2 py-1.5 border border-primary/30 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-on-surface"
                        placeholder="Facility / Coordinates..."
                      />
                    ) : (
                      task.target || <span className="italic text-secondary/50">Unassigned Area</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${task.priority === 'Critical' ? 'bg-error/10 text-error' : task.priority === 'High' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${task.status === 'Completed' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-amber-500 animate-pulse' : task.status === 'Cancelled' ? 'bg-error' : 'bg-outline-variant'}`}></span>
                       <span className="text-secondary text-xs font-semibold uppercase tracking-wider">{task.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary font-mono text-xs">
                    {editingId === task.id ? (
                      <input 
                        type="text" 
                        value={editDraft.assignee}
                        onChange={(e) => setEditDraft({...editDraft, assignee: e.target.value})}
                        className="w-32 px-2 py-1.5 border border-primary/30 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-on-surface font-mono"
                        placeholder="Unit identifier..."
                      />
                    ) : (
                      task.assignee || 'Unassigned'
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => updateStatus(task.id, 'In Progress')} title="Initiate" className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors flex items-center justify-center">
                         <span className="material-symbols-outlined text-[22px]">play_arrow</span>
                      </button>
                      <button onClick={() => updateStatus(task.id, 'Completed')} title="Mark as Complete" className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-500/10 transition-colors flex items-center justify-center">
                         <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      </button>
                      <button onClick={() => updateStatus(task.id, 'Cancelled')} title="Cancel" className="p-1.5 rounded-md text-error hover:bg-error/10 transition-colors flex items-center justify-center">
                         <span className="material-symbols-outlined text-[20px]">cancel</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminTasks;
