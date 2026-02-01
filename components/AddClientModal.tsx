'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    status: 'active' as 'active' | 'inactive',
    notes: '',
  });
  const [projects, setProjects] = useState<Array<{ name: string; budget: string }>>([{ name: '', budget: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProjectField = () => {
    setProjects([...projects, { name: '', budget: '' }]);
  };

  const removeProjectField = (index: number) => {
    if (projects.length > 1) {
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
    setIsSubmitting(true);

    try {
      // Insert client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([formData])
        .select()
        .single();

      if (clientError) throw clientError;

      // Insert projects (at least 1 required)
      if (clientData && projects.length > 0) {
        const validProjects = projects.filter(p => p.name && p.budget);
        
        if (validProjects.length === 0) {
          throw new Error('At least one project with name and budget is required');
        }

        const projectsToInsert = validProjects.map(p => ({
          client_id: clientData.id,
          name: p.name,
          budget: parseFloat(p.budget),
          status: 'not_completed' as const
        }));

        const { error: projectError } = await supabase
          .from('projects')
          .insert(projectsToInsert);

        if (projectError) throw projectError;
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        website: '',
        status: 'active',
        notes: '',
      });
      setProjects([{ name: '', budget: '' }]);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Failed to add client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
            Add New Client
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
              placeholder="Enter client name"
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
              placeholder="client@example.com"
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
              placeholder="+1-555-0000"
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
              placeholder="https://example.com"
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

          {/* Projects Section - REQUIRED */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white">
                Projects * <span className="text-xs text-gray-400">(At least 1 required)</span>
              </label>
              <button
                type="button"
                onClick={addProjectField}
                className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
              >
                + Add Another Project
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((project, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Project {index + 1}</span>
                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProjectField(index)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
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
                      required
                      value={project.budget}
                      onChange={(e) => updateProject(index, 'budget', e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="5000.00"
                    />
                  </div>
                </div>
              ))}
            </div>
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
              placeholder="Additional notes..."
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
              {isSubmitting ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
