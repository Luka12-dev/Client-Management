'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types/database.types';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client: Client | null;
}

export default function EditClientModal({ isOpen, onClose, onSuccess, client }: EditClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    status: 'active' as 'active' | 'inactive',
    notes: '',
  });
  const [projects, setProjects] = useState<Array<{ id?: string; name: string; budget: string; isNew?: boolean }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        website: client.website || '',
        status: client.status,
        notes: client.notes || '',
      });

      // Load projects for this client
      loadProjects(client.id);
    }
  }, [client]);

  const loadProjects = async (clientId: string) => {
    setIsLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, budget')
        .eq('client_id', clientId);

      if (error) throw error;

      setProjects(data?.map(p => ({
        id: p.id,
        name: p.name,
        budget: p.budget?.toString() || '0',
        isNew: false
      })) || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const addProjectField = () => {
    setProjects([...projects, { name: '', budget: '', isNew: true }]);
  };

  const removeProjectField = async (index: number) => {
    const project = projects[index];
    
    if (project.id && !project.isNew) {
      // Delete from database
      if (confirm('Delete this project? This will also delete all tasks.')) {
        try {
          const { error } = await supabase.from('projects').delete().eq('id', project.id);
          if (error) throw error;
          setProjects(projects.filter((_, i) => i !== index));
        } catch (error) {
          console.error('Error deleting project:', error);
          alert('Failed to delete project');
        }
      }
    } else {
      // Just remove from state (not saved yet)
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

  const updateProject = (index: number, field: 'name' | 'budget', value: string) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setIsSubmitting(true);

    try {
      // Update client
      const { error: clientError } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', client.id);

      if (clientError) throw clientError;

      // Update/insert projects
      for (const project of projects) {
        if (!project.name || !project.budget) continue;

        if (project.id && !project.isNew) {
          // Update existing project
          const { error } = await supabase
            .from('projects')
            .update({
              name: project.name,
              budget: parseFloat(project.budget)
            })
            .eq('id', project.id);

          if (error) throw error;
        } else if (project.isNew) {
          // Insert new project
          const { error } = await supabase
            .from('projects')
            .insert([{
              client_id: client.id,
              name: project.name,
              budget: parseFloat(project.budget),
              status: 'not_completed'
            }]);

          if (error) throw error;
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />
      
      {/* Modal */}
      <div className="relative z-[10] w-full max-w-2xl bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Edit Client
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Client Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30 transition-colors"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Projects Section */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white">Projects</label>
              <button
                type="button"
                onClick={addProjectField}
                className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
              >
                + Add New Project
              </button>
            </div>

            {isLoadingProjects ? (
              <div className="text-center py-4 text-gray-400">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center text-gray-400">
                No projects yet. Click "Add New Project" to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">
                        {project.isNew ? `New Project ${index + 1}` : `Project ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProjectField(index)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Delete
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                        placeholder="Website Redesign"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Budget (USD) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={project.budget}
                        onChange={(e) => updateProject(index, 'budget', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                        placeholder="5000.00"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 border border-white/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
