import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Category } from '../../types/database';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const { categories, departments, saveCategory, toggleCategoryActive, deleteCategory } = useSystem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deptId, setDeptId] = useState('');
  const [targetDays, setTargetDays] = useState(5);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setDeptId(departments[0]?.id || '');
    setTargetDays(5);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setDeptId(cat.department_id || departments[0]?.id || '');
    setTargetDays(cat.target_resolution_days);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    try {
      saveCategory({
        ...(editingCat?.id ? { id: editingCat.id } : {}),
        name: name.trim(),
        description: description.trim(),
        department_id: deptId,
        target_resolution_days: Number(targetDays) || 5,
        is_active: editingCat?.is_active ?? true,
      });

      setIsModalOpen(false);
      setSuccessMsg(`Category '${name}' saved successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category.');
    }
  };

  const handleDelete = async (cat: Category) => {
    const res = await deleteCategory(cat.id);
    if (!res.success) {
      setErrorMsg(res.message || 'Cannot delete category.');
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(`Category '${cat.name}' deleted.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-ink-primary">Category Master & Resolution SLAs</h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Configure grievance classifications and target resolution windows.
          </p>
        </div>

        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          New Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[620px]">
            <thead className="bg-surface border-b border-border text-ink-secondary uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Default Department</th>
                <th className="py-3 px-4">Target SLA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-ink-primary">{c.name}</p>
                    {c.description && <p className="text-ink-muted text-[11px] mt-0.5">{c.description}</p>}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-ink-secondary">
                    {c.department?.name || 'College Administration'}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-medium text-ink-primary whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-700" />
                      {c.target_resolution_days} days
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleCategoryActive(c.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        c.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {c.is_active ? 'Active' : 'Deactivated'}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-ink-secondary hover:text-ink-primary hover:bg-surface rounded-md transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-1.5 text-ink-secondary hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingCat ? 'Edit Grievance Category' : 'Create New Category'}
          description="Establish classification and associate standard turnaround times."
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Category Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Campus Wi-Fi & LMS Connectivity"
                className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Description & Scope
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe types of problems handled under this category..."
                className="w-full px-3 py-2 rounded-lg border border-border text-xs text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Responsible Department *
                </label>
                <select
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs text-ink-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-primary mb-1">
                  Target SLA (Days) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={targetDays}
                  onChange={(e) => setTargetDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-border text-xs text-ink-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Category
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
