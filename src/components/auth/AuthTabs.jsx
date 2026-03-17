import { motion } from 'framer-motion';

const roles = ['customer', 'admin', 'employee', 'superadmin'];

const formatRoleLabel = (role) => {
  if (role === 'superadmin') return 'SuperAdmin';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const AuthTabs = ({ activeRole, onChange }) => {
  return (
    <div
      className="grid grid-cols-2 gap-2 -mt-[40px] rounded-2xl border border-white/15 bg-white/8 p-2 shadow-inner shadow-black/10 sm:grid-cols-4"
      role="tablist"
      aria-label="Authentication roles"
    >
      {roles.map((role) => {
        const isActive = activeRole === role;

        return (
          <button
            key={role}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`auth-panel-${role}`}
            id={`auth-tab-${role}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(role)}
            className={`relative overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
              isActive ? 'text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="active-auth-tab"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/80 via-blue-500/80 to-violet-500/80 shadow-lg shadow-blue-900/30"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{formatRoleLabel(role)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AuthTabs;
