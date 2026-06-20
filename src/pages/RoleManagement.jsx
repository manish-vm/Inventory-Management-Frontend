import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Loader2, Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { roleAPI } from '../api/api';

const Checkbox = ({ checked, indeterminate, onChange, label }) => {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800" />;
};

const stateFor = (ids, selected) => {
  const count = ids.filter((id) => selected.has(id)).length;
  return { checked: ids.length > 0 && count === ids.length, indeterminate: count > 0 && count < ids.length };
};

const TreeCheckbox = ({ tree, selected, setSelected, expanded, setExpanded }) => {
  const toggleMany = (ids, shouldSelect) => setSelected((previous) => {
    const next = new Set(previous);
    ids.forEach((id) => shouldSelect ? next.add(id) : next.delete(id));
    return next;
  });
  const expand = (key) => setExpanded((previous) => ({ ...previous, [key]: !previous[key] }));

  return <div className="divide-y divide-slate-200 dark:divide-slate-700">
    {tree.map((category) => {
      const subcategories = category.subcategories || [];
      const subcategoryIds = subcategories.map((subcategory) => subcategory.id).filter(Boolean);
      const productIds = subcategories.flatMap((subcategory) => subcategory.products.map((product) => product.id));
      const stageIds = subcategories.flatMap((subcategory) => subcategory.products.flatMap((product) => product.stages.map((stage) => stage.id)));
      const categoryChildIds = [...subcategoryIds, ...productIds, ...stageIds];
      const categoryState = stateFor(categoryChildIds, selected);
      return <div key={category.id} className="py-2">
        <div className="flex items-center gap-2 px-1 py-2">
          <button type="button" onClick={() => expand(`c-${category.id}`)} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
            {expanded[`c-${category.id}`] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <Checkbox label={category.name} checked={categoryState.checked || (categoryChildIds.length === 0 && selected.has(category.id))} indeterminate={categoryState.indeterminate} onChange={() => toggleMany([category.id, ...categoryChildIds], !(categoryState.checked || selected.has(category.id)))} />
          <button type="button" onClick={() => expand(`c-${category.id}`)} className="flex-1 text-left font-semibold text-slate-800 dark:text-white">{category.name}</button>
          <span className="text-xs text-slate-400">{subcategories.length} subcategories</span>
        </div>
        {expanded[`c-${category.id}`] && <div className="ml-6 border-l border-slate-200 pl-3 dark:border-slate-700">
          {subcategories.length ? subcategories.map((subcategory) => {
            const subcategoryProductIds = subcategory.products.map((product) => product.id);
            const subcategoryStageIds = subcategory.products.flatMap((product) => product.stages.map((stage) => stage.id));
            const subcategoryChildIds = [...subcategoryProductIds, ...subcategoryStageIds];
            const subcategoryState = stateFor(subcategoryChildIds, selected);
            const subcategoryKey = subcategory.id || `uncategorized-${category.id}`;
            return <div key={subcategoryKey}>
              <div className="flex items-center gap-2 py-2">
                <button type="button" onClick={() => expand(`s-${subcategoryKey}`)} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
                  {expanded[`s-${subcategoryKey}`] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <Checkbox label={subcategory.name} checked={subcategoryState.checked || (subcategoryChildIds.length === 0 && Boolean(subcategory.id) && selected.has(subcategory.id))} indeterminate={subcategoryState.indeterminate} onChange={() => toggleMany([...(subcategory.id ? [subcategory.id] : []), ...subcategoryChildIds], !subcategoryState.checked)} />
                <button type="button" onClick={() => expand(`s-${subcategoryKey}`)} className="flex-1 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">{subcategory.name}</button>
                <span className="text-xs text-slate-400">{subcategory.products.length} products</span>
              </div>
              {expanded[`s-${subcategoryKey}`] && <div className="ml-6 border-l border-slate-200 pl-3 dark:border-slate-700">
                {subcategory.products.length ? subcategory.products.map((product) => {
                  const productStageIds = product.stages.map((stage) => stage.id);
                  const productState = stateFor(productStageIds, selected);
                  return <div key={product.id}>
                    <div className="flex items-center gap-2 py-2">
                      <button type="button" onClick={() => expand(`p-${product.id}`)} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700">{expanded[`p-${product.id}`] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>
                      <Checkbox label={product.name} checked={productState.checked || (productStageIds.length === 0 && selected.has(product.id))} indeterminate={productState.indeterminate} onChange={() => toggleMany([product.id, ...productStageIds], !(productState.checked || selected.has(product.id)))} />
                      <button type="button" onClick={() => expand(`p-${product.id}`)} className="flex-1 text-left text-sm font-medium text-slate-600 dark:text-slate-300">{product.name}</button>
                    </div>
                    {expanded[`p-${product.id}`] && <div className="ml-6 border-l border-slate-200 pl-5 dark:border-slate-700">{product.stages.length ? product.stages.map((stage) => <label key={stage.id} className="flex cursor-pointer items-center gap-3 py-2 text-sm text-slate-600 dark:text-slate-300"><Checkbox label={stage.name} checked={selected.has(stage.id)} indeterminate={false} onChange={() => toggleMany([stage.id], !selected.has(stage.id))} /><span>{stage.name}</span><span className="text-xs text-slate-400">Level {stage.stageNumber}</span></label>) : <p className="py-2 text-xs italic text-slate-400">No stages configured</p>}</div>}
                  </div>;
                }) : <p className="py-2 text-xs italic text-slate-400">No products in this subcategory</p>}
              </div>}
            </div>;
          }) : <p className="py-3 text-xs italic text-slate-400">No subcategories in this category</p>}
        </div>}
      </div>;
    })}
  </div>;
};

const RoleDrawer = ({ open, role, tree, loadingTree, onClose, onSaved }) => {
  const [roleName, setRoleName] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [expanded, setExpanded] = useState({});
  const [saving, setSaving] = useState(false);
  const [roleNameError, setRoleNameError] = useState('');

  useEffect(() => {
    if (!open) return;
    const selectedIds = [...(role?.categories || []), ...(role?.subcategories || []), ...(role?.products || []), ...(role?.stages || [])].map(String);
    setRoleName(role?.roleName || '');
    setRoleNameError('');
    setSelected(new Set(selectedIds));
    const openNodes = {};
    (role?.permissions || []).forEach((category) => {
      openNodes[`c-${category.categoryId}`] = true;
      (category.subcategories || []).forEach((subcategory) => {
        openNodes[`s-${subcategory.subcategoryId || `uncategorized-${category.categoryId}`}`] = true;
        subcategory.products.forEach((product) => { openNodes[`p-${product.productId}`] = true; });
      });
    });
    setExpanded(openNodes);
  }, [open, role]);

  const submit = async (event) => {
    event.preventDefault();
    if (!roleName.trim()) {
      const message = `Role name is required to ${role?._id ? 'update' : 'create'} the role`;
      setRoleNameError(message);
      toast.error(message);
      return;
    }
    setRoleNameError('');
    const categoryIds = tree.map((item) => item.id);
    const subcategoryIds = tree.flatMap((item) => (item.subcategories || []).map((subcategory) => subcategory.id).filter(Boolean));
    const productIds = tree.flatMap((item) => (item.subcategories || []).flatMap((subcategory) => subcategory.products.map((product) => product.id)));
    const stageIds = tree.flatMap((item) => (item.subcategories || []).flatMap((subcategory) => subcategory.products.flatMap((product) => product.stages.map((stage) => stage.id))));
    const payload = { roleName: roleName.trim(), categories: categoryIds.filter((id) => selected.has(id)), subcategories: subcategoryIds.filter((id) => selected.has(id)), products: productIds.filter((id) => selected.has(id)), stages: stageIds.filter((id) => selected.has(id)) };
    setSaving(true);
    try {
      if (role?._id) await roleAPI.update(role._id, payload); else await roleAPI.create(payload);
      toast.success(role?._id ? 'Role updated successfully' : 'Role created successfully');
      onSaved();
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to save role'); }
    finally { setSaving(false); }
  };

  return <div className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
    <button type="button" aria-label="Close role drawer" onClick={onClose} className={`absolute inset-0 bg-slate-950/45 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
    <aside className={`absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-slate-800 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">{role?._id ? 'Edit Role' : 'Create Role'}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select categories, subcategories, products, and stages.</p></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <label className="mb-5 block text-sm font-medium text-slate-700 dark:text-slate-200">Role Name
            <input value={roleName} onChange={(event) => { setRoleName(event.target.value); if (event.target.value.trim()) setRoleNameError(''); }} maxLength={80} placeholder="Enter role name" aria-invalid={Boolean(roleNameError)} className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${roleNameError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-600'}`} />
            {roleNameError && <span className="mt-2 block text-sm font-normal text-red-600 dark:text-red-400">{roleNameError}</span>}
          </label>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-900/50 dark:text-slate-200">Permission Tree</div>
            <div className="px-3">{loadingTree ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary-600" /></div> : tree.length ? <TreeCheckbox tree={tree} selected={selected} setSelected={setSelected} expanded={expanded} setExpanded={setExpanded} /> : <p className="py-12 text-center text-sm text-slate-500">No category, subcategory, product, or stage data is available.</p>}</div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold dark:border-slate-600">Cancel</button>
          <button disabled={saving || loadingTree} className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{role?._id ? 'Update Role' : 'Create Role'}</button>
        </div>
      </form>
    </aside>
  </div>;
};

const RoleViewModal = ({ role, loading, onClose }) => {
  if (!role && !loading) return null;

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button type="button" aria-label="Close role details" onClick={onClose} className="absolute inset-0 bg-slate-950/50" />
    <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Role permissions</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{role?.roleName || 'Loading role...'}</h2></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"><X className="h-5 w-5" /></button>
      </div>
      <div className="overflow-y-auto p-6">
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary-600" /></div> : !role?.permissions?.length ? <p className="py-12 text-center text-sm text-slate-500">No permissions are assigned to this role.</p> : <div className="space-y-4">
          {role.permissions.map((category) => <div key={String(category.categoryId)} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><ChevronDown className="h-4 w-4 text-primary-600" />{category.categoryName}</div>
            <div className="ml-2 mt-3 border-l border-slate-200 pl-5 dark:border-slate-700">
              {(category.subcategories || []).map((subcategory, subcategoryIndex) => <div key={String(subcategory.subcategoryId || subcategoryIndex)} className="mb-3 last:mb-0">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{subcategory.subcategoryName}</p>
                <div className="ml-2 mt-2 border-l border-slate-200 pl-5 dark:border-slate-700">
                  {(subcategory.products || []).map((product) => <div key={String(product.productId)} className="mb-3 last:mb-0">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{product.productName}</p>
                    {(product.stages || []).length > 0 && <ul className="ml-4 mt-1 space-y-1 text-sm text-slate-500 dark:text-slate-400">{product.stages.map((stage) => <li key={String(stage.stageId)} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary-500" />{stage.stageName}</li>)}</ul>}
                  </div>)}
                </div>
              </div>)}
              {category.products?.map((product) => <div key={String(product.productId)} className="mb-3"><p className="text-sm font-medium text-slate-600 dark:text-slate-300">{product.productName}</p><ul className="ml-4 mt-1 space-y-1 text-sm text-slate-500">{(product.stages || []).map((stage) => <li key={String(stage.stageId)} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary-500" />{stage.stageName}</li>)}</ul></div>)}
            </div>
          </div>)}
        </div>}
      </div>
      <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-700"><button type="button" onClick={onClose} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-primary-600 dark:hover:bg-primary-700">Close</button></div>
    </div>
  </div>;
};

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTree, setLoadingTree] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const [viewRole, setViewRole] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState(null);

  const loadRoles = async () => { try { setError(''); setRoles((await roleAPI.getAll()).data || []); } catch (error) { setError(error.response?.data?.message || 'Unable to load roles.'); } finally { setLoading(false); } };
  const loadTree = async () => { if (tree.length) return; setLoadingTree(true); try { setTree((await roleAPI.getPermissionTree()).data || []); } catch (error) { toast.error(error.response?.data?.message || 'Unable to load permission tree'); } finally { setLoadingTree(false); } };
  useEffect(() => { loadRoles(); }, []);
  const createRole = async () => { setActiveRole(null); setDrawerOpen(true); await loadTree(); };
  const viewRoleDetails = async (id) => { setViewRole(null); setViewLoading(true); try { setViewRole((await roleAPI.getById(id)).data); } catch (error) { toast.error(error.response?.data?.message || 'Unable to load role'); } finally { setViewLoading(false); } };
  const editRole = async (id) => { setDrawerOpen(true); setLoadingTree(true); try { const [roleResponse, treeResponse] = await Promise.all([roleAPI.getById(id), tree.length ? Promise.resolve({ data: tree }) : roleAPI.getPermissionTree()]); setActiveRole(roleResponse.data); setTree(treeResponse.data || []); } catch (error) { toast.error(error.response?.data?.message || 'Unable to load role'); setDrawerOpen(false); } finally { setLoadingTree(false); } };
  const deleteRole = async (role) => {
    if (!window.confirm(`Delete the role "${role.roleName}"? This action cannot be undone.`)) return;
    setDeletingRoleId(role._id);
    try {
      await roleAPI.delete(role._id);
      setRoles((currentRoles) => currentRoles.filter((item) => item._id !== role._id));
      toast.success('Role deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete role');
    } finally {
      setDeletingRoleId(null);
    }
  };
  const filtered = roles.filter((role) => role.roleName.toLowerCase().includes(search.toLowerCase()));

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Role Management</h1><p className="text-slate-500 dark:text-slate-400">Create roles and assign category, product, and stage access.</p></div><button onClick={createRole} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-primary-700"><Plus className="h-5 w-5" />Create Role</button></div>
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 p-4 dark:border-slate-700"><div className="relative max-w-md"><Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles..." className="w-full rounded-xl border border-slate-300 bg-transparent py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:text-white" /></div></div>
      {loading ? <div className="flex h-56 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div> : error ? <div className="p-10 text-center text-red-600">{error}<button onClick={loadRoles} className="ml-2 underline">Retry</button></div> : filtered.length === 0 ? <div className="flex flex-col items-center py-16 text-slate-500"><ShieldCheck className="mb-3 h-10 w-10 text-slate-300" /><p>{search ? 'No matching roles found.' : 'No roles created yet.'}</p></div> : <div className="divide-y divide-slate-200 dark:divide-slate-700">{filtered.map((role) => <div key={role._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/40"><button onClick={() => viewRoleDetails(role._id)} className="flex min-w-0 flex-1 items-center gap-4 text-left"><div className="rounded-xl bg-primary-50 p-2.5 text-primary-600 dark:bg-primary-900/30"><ShieldCheck className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900 dark:text-white">{role.roleName}</p><p className="text-sm text-slate-500">{role.categories?.length || 0} categories · {role.subcategories?.length || 0} subcategories · {role.products?.length || 0} products · {role.stages?.length || 0} stages</p></div></button><button onClick={() => editRole(role._id)} title="Edit role" aria-label={`Edit ${role.roleName}`} className="rounded-lg p-2 text-slate-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30"><Pencil className="h-4 w-4" /></button><button onClick={() => deleteRole(role)} disabled={deletingRoleId === role._id} title="Delete role" aria-label={`Delete ${role.roleName}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/30">{deletingRoleId === role._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button></div>)}</div>}
    </div>
    <RoleDrawer open={drawerOpen} role={activeRole} tree={tree} loadingTree={loadingTree} onClose={() => setDrawerOpen(false)} onSaved={() => { setDrawerOpen(false); setLoading(true); loadRoles(); }} />
    <RoleViewModal role={viewRole} loading={viewLoading} onClose={() => { setViewRole(null); setViewLoading(false); }} />
  </div>;
};

export default RoleManagement;
