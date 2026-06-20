import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit, Loader2, Plus, Trash2, X } from 'lucide-react';
import { defectDetailAPI } from '../api/api';

const emptyForm = { type: 'reject', name: '', isActive: true };

const typeLabel = {
  reject: 'Reject',
  rework: 'Rework',
  both: 'Common (Reject & Rework)'
};

const DefectDetailManager = ({ onClose }) => {
  const [defects, setDefects] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(
    () => ({
      reject: defects.filter((item) => item.type === 'reject'),
      rework: defects.filter((item) => item.type === 'rework'),
      both: defects.filter((item) => item.type === 'both')
    }),
    [defects]
  );

  const fetchDefects = async () => {
    setLoading(true);
    try {
      const response = await defectDetailAPI.getAll();
      setDefects(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch defect details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefects();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Defect detail name is required');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await defectDetailAPI.update(editing._id, formData);
        toast.success('Defect detail updated');
      } else {
        await defectDetailAPI.create(formData);
        toast.success('Defect detail created');
      }
      resetForm();
      fetchDefects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save defect detail');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      type: item.type,
      name: item.name,
      isActive: item.isActive !== false
    });
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await defectDetailAPI.delete(item._id);
      toast.success('Defect detail deleted');
      fetchDefects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete defect detail');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Defect Details</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage reject and rework options for employee inspections.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[320px_1fr]">
          <form onSubmit={handleSubmit} className="h-fit rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Plus className="h-4 w-4" />
              {editing ? 'Edit Defect Detail' : 'Add Defect Detail'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                <select
                  value={formData.type}
                  onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                >
                  <option value="reject">Reject</option>
                  <option value="rework">Rework</option>
                  <option value="both">Common (Reject &amp; Rework)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Defect Detail *</label>
                <input
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) => setFormData((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                Active
              </label>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? 'Update' : 'Create'}
                </button>
                {editing && (
                  <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="grid gap-4 md:grid-cols-2">
            {['reject', 'rework', 'both'].map((type) => (
              <section key={type} className="rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{typeLabel[type]} Details</h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {loading ? (
                    <div className="p-4 text-sm text-slate-500">Loading...</div>
                  ) : grouped[type].length === 0 ? (
                    <div className="p-4 text-sm text-slate-500">No {typeLabel[type].toLowerCase()} details added.</div>
                  ) : (
                    grouped[type].map((item) => (
                      <div key={item._id} className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button type="button" onClick={() => handleEdit(item)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => handleDelete(item)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectDetailManager;
