import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Department } from '../../types/database';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Building2, Plus, Edit2, Mail, UserCheck, CheckCircle } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const { departments, saveDepartment } = useSystem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Partial<Department> | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [hod, setHod] = useState('');

  const handleOpenCreate = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setContactEmail('');
    setHod('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Department) => {
    setEditingDept(d);
    setName(d.name);
    setCode(d.code);
    setContactEmail(d.contact_email);
    setHod(d.head_of_department || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactEmail.trim()) return;

    saveDepartment({
      ...(editingDept?.id ? { id: editingDept.id } : {}),
      name: name.trim(),
      code: (code || name.substring(0, 4)).toUpperCase().trim(),
      contact_email: contactEmail.trim(),
      head_of_department: hod.trim(),
      is_active: editingDept?.is_active ?? true,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink-primary">College Departments</h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Academic divisions, facility teams, and administrative units handling grievances.
          </p>
        </div>

        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate} className="self-start sm:self-auto shrink-0">
          New Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="p-5 rounded-xl border border-border bg-white space-y-3 hover:border-slate-300 transition-colors shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {dept.code}
                </span>
                <h4 className="text-sm font-semibold text-ink-primary mt-1.5">{dept.name}</h4>
              </div>

              <button
                onClick={() => handleOpenEdit(dept)}
                className="p-1 text-ink-secondary hover:text-ink-primary hover:bg-surface rounded-md"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs text-ink-secondary">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{dept.contact_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{dept.head_of_department || 'Head not assigned'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingDept ? 'Edit Department' : 'Add Department'}
          description="Maintain operational routing contact info."
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Department Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Electrical Engineering & Computing"
                className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ELEC"
                  className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="dept@cet.ac.in"
                  className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Head of Department / Officer
              </label>
              <input
                type="text"
                value={hod}
                onChange={(e) => setHod(e.target.value)}
                placeholder="e.g. Dr. Arthur Pendelton"
                className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Department
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
