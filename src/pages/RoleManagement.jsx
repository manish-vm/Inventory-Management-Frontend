import { useState, useEffect } from 'react';
import { Layers, Users, Loader2, CheckCircle, XCircle, ChevronRight, ChevronDown, Edit2, X } from 'lucide-react';
import { productAPI, manufacturingConfigAPI, employeeAPI } from '../api/api';

const RoleManagement = () => {
  const [productHierarchy, setProductHierarchy] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedLevels, setExpandedLevels] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allEmployees, setAllEmployees] = useState([]);
  const [editingLevel, setEditingLevel] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [updatingEmployees, setUpdatingEmployees] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [productRes, configRes, employeeRes] = await Promise.all([
          productAPI.getAll(),
          manufacturingConfigAPI.getAll(),
          employeeAPI.getEmployees(),
        ]);

        const fetchedProducts = productRes.data || [];
        const fetchedConfigs = configRes.data || [];
        const fetchedEmployees = employeeRes.data || [];

        setAllEmployees(fetchedEmployees);
        const hierarchy = buildHierarchy(fetchedProducts, fetchedConfigs, fetchedEmployees);
        setProductHierarchy(hierarchy);
      } catch (err) {
        console.error('Failed to load role management data:', err);
        setError('Unable to load role management data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const buildHierarchy = (productsData, configsData, employeesData) => {
    return productsData.map((product) => {
      const config = configsData.find(
        (cfg) => String(cfg.productName).trim().toLowerCase() === String(product.productName).trim().toLowerCase()
      );

      let levels = [];
      if (config && Array.isArray(config.stages) && config.stages.length > 0) {
        levels = config.stages.map((stage) => {
          const stageNumber = Number(stage.stageNumber);
          const assignedEmployees = employeesData.filter(
            (emp) => Number(emp.manufacturingLevel) === stageNumber
          );

          return {
            stageNumber,
            stageName: stage.stageName || `Level ${stageNumber}`,
            employees: assignedEmployees,
          };
        });
      }

      return {
        _id: product._id,
        productName: product.productName || product.partNo || 'Unknown product',
        productCode: product.productCode || product.partNo || '-',
        levels,
      };
    });
  };

  const toggleProduct = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const toggleLevel = (productId, levelNumber) => {
    const key = `${productId}-${levelNumber}`;
    setExpandedLevels((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const openEditModal = (level) => {
    const assignedEmployeeIds = new Set(level.employees.map(emp => emp._id));
    setSelectedEmployees(assignedEmployeeIds);
    setEditingLevel(level);
  };

  const closeEditModal = () => {
    setEditingLevel(null);
    setSelectedEmployees(new Set());
  };

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const saveEmployeeAssignments = async () => {
    if (!editingLevel) return;

    setUpdatingEmployees(true);
    try {
      const previouslyAssigned = new Set(editingLevel.employees.map(emp => emp._id));
      const toRemove = Array.from(previouslyAssigned).filter(id => !selectedEmployees.has(id));
      const toAdd = Array.from(selectedEmployees).filter(id => !previouslyAssigned.has(id));

      const promises = [];

      // Remove employees from this level
      toRemove.forEach(employeeId => {
        promises.push(
          employeeAPI.updateEmployee(employeeId, { manufacturingLevel: null })
        );
      });

      // Add employees to this level
      toAdd.forEach(employeeId => {
        promises.push(
          employeeAPI.updateEmployee(employeeId, { manufacturingLevel: editingLevel.stageNumber })
        );
      });

      await Promise.all(promises);

      // Refresh data
      const [productRes, configRes, employeeRes] = await Promise.all([
        productAPI.getAll(),
        manufacturingConfigAPI.getAll(),
        employeeAPI.getEmployees(),
      ]);

      const fetchedProducts = productRes.data || [];
      const fetchedConfigs = configRes.data || [];
      const fetchedEmployees = employeeRes.data || [];

      setAllEmployees(fetchedEmployees);
      const hierarchy = buildHierarchy(fetchedProducts, fetchedConfigs, fetchedEmployees);
      setProductHierarchy(hierarchy);
      closeEditModal();
    } catch (err) {
      console.error('Failed to update employee assignments:', err);
      alert('Error updating employee assignments. Please try again.');
    } finally {
      setUpdatingEmployees(false);
    }
  };

  const filteredProducts = productHierarchy.filter((product) => {
    if (!search.trim()) return true;
    const lower = search.toLowerCase();
    const productMatch = product.productName.toLowerCase().includes(lower) || product.productCode.toLowerCase().includes(lower);
    const levelMatch = product.levels.some((level) => level.stageName.toLowerCase().includes(lower));
    const employeeMatch = product.levels.some((level) => level.employees.some((emp) => emp.name?.toLowerCase().includes(lower) || emp.email?.toLowerCase().includes(lower)));

    return productMatch || levelMatch || employeeMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Role Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Click on products to view levels, then levels to view assigned employees.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, levels, or employees..."
            className="w-full sm:w-80 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 dark:text-red-300">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">No products found.</div>
        ) : (
          <div className="space-y-1 p-4">
            {filteredProducts.map((product) => {
              const isProductExpanded = expandedProducts[product._id];

              return (
                <div key={product._id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  {/* Product Row */}
                  <button
                    onClick={() => toggleProduct(product._id)}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0">
                      {isProductExpanded ? (
                        <ChevronDown className="w-5 h-5 text-primary-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">{product.productName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{product.productCode}</p>
                    </div>
                    <div className="flex-shrink-0 text-slate-500 dark:text-slate-400 text-sm">
                      {product.levels.length} level{product.levels.length !== 1 ? 's' : ''}
                    </div>
                  </button>

                  {/* Levels (Expandable) */}
                  {isProductExpanded && product.levels.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/20">
                      {product.levels.map((level) => {
                        const levelKey = `${product._id}-${level.stageNumber}`;
                        const isLevelExpanded = expandedLevels[levelKey];

                        return (
                          <div key={levelKey} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                            {/* Level Row */}
                            <div className="w-full px-6 py-3 pl-12 flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors">
                              <button
                                onClick={() => toggleLevel(product._id, level.stageNumber)}
                                className="flex items-center gap-4 flex-1 text-left"
                              >
                                <div className="flex-shrink-0">
                                  {isLevelExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 dark:text-white text-sm">{level.stageName}</p>
                                </div>
                                <div className="flex-shrink-0 text-slate-500 dark:text-slate-400 text-xs">
                                  {level.employees.length} employee{level.employees.length !== 1 ? 's' : ''}
                                </div>
                              </button>
                              <button
                                onClick={() => openEditModal(level)}
                                className="flex-shrink-0 p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                                title="Edit employee assignments"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Employees (Expandable) */}
                            {isLevelExpanded && level.employees.length > 0 && (
                              <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700/40">
                                {level.employees.map((employee) => (
                                  <div key={employee._id} className="px-6 py-3 pl-20 flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
                                    <Users className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-slate-900 dark:text-white text-sm">{employee.name}</p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">{employee.email || 'No email'}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {employee.isActive ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                                          <CheckCircle className="w-3 h-3" />
                                          Active
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs">
                                          <XCircle className="w-3 h-3" />
                                          Inactive
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* No Employees Message */}
                            {isLevelExpanded && level.employees.length === 0 && (
                              <div className="px-6 py-3 pl-20 text-sm text-slate-500 dark:text-slate-400 italic">
                                No employees assigned to this level.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* No Levels Message */}
                  {isProductExpanded && product.levels.length === 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-700/20">
                      No manufacturing levels configured for this product.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingLevel && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Assign Employees to {editingLevel.stageName}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Select employees to assign to this level
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {allEmployees.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No employees available.
                </div>
              ) : (
                <div className="space-y-3">
                  {allEmployees.map((employee) => (
                    <label
                      key={employee._id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(employee._id)}
                        onChange={() => toggleEmployeeSelection(employee._id)}
                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{employee.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{employee.email || 'No email'}</p>
                      </div>
                      <div>
                        {employee.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={closeEditModal}
                disabled={updatingEmployees}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEmployeeAssignments}
                disabled={updatingEmployees}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updatingEmployees && <Loader2 className="w-4 h-4 animate-spin" />}
                {updatingEmployees ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default RoleManagement;
