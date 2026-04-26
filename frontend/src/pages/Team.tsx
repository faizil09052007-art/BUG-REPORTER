import React from 'react';
import { Users, ShieldCheck, Code2, TestTube2, Eye } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <ShieldCheck className="w-5 h-5 text-red-400" />,
  developer: <Code2 className="w-5 h-5 text-blue-400" />,
  qa: <TestTube2 className="w-5 h-5 text-green-400" />,
  stakeholder: <Eye className="w-5 h-5 text-purple-400" />,
};
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-400 border-red-500/20',
  developer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  qa: 'bg-green-500/10 text-green-400 border-green-500/20',
  stakeholder: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export const TeamPage = () => {
  const { user } = useAuth();

  // Display the currently logged-in user as the team member
  const teamMembers = user ? [
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      initials: user.name?.slice(0, 2).toUpperCase() || 'U',
      isYou: true,
    }
  ] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your team members and their roles.
        </p>
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(ROLE_ICONS).map(([role, icon]) => (
          <div key={role} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            {icon}
            <div>
              <p className="text-sm font-medium capitalize">{role}</p>
              <p className="text-xs text-muted-foreground">
                {role === 'admin' ? 'Full access' :
                 role === 'developer' ? 'Dev access' :
                 role === 'qa' ? 'Testing access' : 'View only'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map(member => (
          <div key={member.id} className="bg-card border rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {member.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{member.name}</p>
                {member.isYou && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium shrink-0">You</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{member.email}</p>
              <span className={`inline-flex items-center gap-1.5 mt-2 text-xs px-2 py-0.5 rounded border font-medium capitalize ${ROLE_COLORS[member.role] || ''}`}>
                {ROLE_ICONS[member.role]}
                {member.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-card border border-dashed rounded-xl p-8 text-center text-muted-foreground">
        <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">Invite Team Members</p>
        <p className="text-xs mt-1">User invitation management coming soon.</p>
      </div>
    </div>
  );
};

export default TeamPage;
