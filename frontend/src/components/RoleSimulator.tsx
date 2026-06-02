import React, { useState } from 'react';
import { 
  Sparkles, 
  Shield, 
  Building2, 
  GraduationCap, 
  ChevronUp, 
  ChevronDown, 
  X, 
  RefreshCw,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface RoleSimulatorProps {
  currentRole: UserRole;
  currentUser: UserProfile | null;
  onSimulateLogin: (roleType: 'admin' | 'company' | 'faculty') => Promise<void>;
  onLogout: () => void;
}

export default function RoleSimulator({
  currentRole,
  currentUser,
  onSimulateLogin,
  onLogout
}: RoleSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  const roles = [
    {
      id: 'admin',
      name: 'Admin SPSU',
      role: 'Admin' as UserRole,
      description: 'Oversight panel, coordinator invites, and system logs.',
      icon: Shield,
      color: 'from-[#0F766E] to-[#0D9488]',
      textColor: 'text-teal-600',
      badgeBg: 'bg-teal-50 border-teal-200'
    },
    {
      id: 'company',
      name: 'Xebia Recruiter',
      role: 'Company' as UserRole,
      description: 'Publish internships, interview tracking, and offers.',
      icon: Building2,
      color: 'from-[#1E3A8A] to-[#3B82F6]',
      textColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'faculty',
      name: 'Faculty SPSU',
      role: 'Faculty' as UserRole,
      description: 'Review listings, endorse students, verify applications.',
      icon: GraduationCap,
      color: 'from-[#B45309] to-[#F59E0B]',
      textColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 border-amber-200'
    }
  ];

  const handleRoleSwitch = async (roleType: 'admin' | 'company' | 'faculty') => {
    setIsSwitching(roleType);
    try {
      await onSimulateLogin(roleType);
      setIsOpen(false);
    } catch (error) {
      console.error('Role simulation switch failed', error);
    } finally {
      setIsSwitching(null);
    }
  };

  const getActiveRoleDetails = () => {
    if (!currentUser) return { label: 'Guest Mode', icon: HelpCircle, color: 'text-gray-400' };
    switch (currentRole) {
      case 'Admin':
        return { label: 'Admin', icon: Shield, color: 'text-[#0D9488]' };
      case 'Company':
        return { label: `Company (${currentUser.companyName || 'Recruiter'})`, icon: Building2, color: 'text-blue-600' };
      case 'Faculty':
        return { label: `Faculty (${currentUser.college || 'Coordinator'})`, icon: GraduationCap, color: 'text-amber-600' };
      default:
        return { label: `Student (${currentUser.name})`, icon: GraduationCap, color: 'text-editorial-light' };
    }
  };

  const activeDetails = getActiveRoleDetails();
  const ActiveIcon = activeDetails.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-[#0D2D2D] hover:bg-[#0D9488] text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 border border-[#E5E2DE]/30 cursor-pointer animate-fade-in"
        >
          <div className="relative">
            <Sparkles size={16} className="text-[#CCFBF1] animate-pulse" />
            <span className="absolute top-0 right-0 h-1.5 w-1.5 bg-[#0D9488] rounded-full border border-white animate-ping" />
          </div>
          <span className="text-xs font-semibold tracking-wide">Simulation Center</span>
          <ChevronUp size={14} className="text-[#94A3B8]" />
        </button>
      )}

      {/* Glassmorphic Simulation Console */}
      {isOpen && (
        <div className="w-80 bg-white/95 backdrop-blur-xl border border-[#E5E2DE] rounded-2xl shadow-2xl p-5 space-y-4 animate-fade-in-up transition-all duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F0EC]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#0D9488]" />
              <span className="font-serif font-bold text-sm text-[#0D2D2D] tracking-tight">Simulation Control</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[#F9F8F6] rounded-lg text-[#94A3B8] hover:text-[#1A1C1E] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Active Context */}
          <div className="p-3 bg-[#F9F8F6] border border-[#E5E2DE] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white border border-[#E5E2DE] text-[#0D9488]">
                <ActiveIcon size={14} className={activeDetails.color} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider">Current Context</p>
                <p className="text-xs font-bold text-[#1A1C1E] truncate max-w-[150px]">{activeDetails.label}</p>
              </div>
            </div>
            {currentUser && (
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                title="Switch to Guest Mode"
                className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-[#94A3B8] transition-colors cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>

          {/* Simulation Targets */}
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider pl-1">Sign In As</p>
            
            <div className="space-y-2">
              {roles.map((role) => {
                const RoleIcon = role.icon;
                const isCurrent = currentUser && currentRole === role.role && 
                  (role.id !== 'company' || currentUser.companyName === 'Xebia') &&
                  (role.id !== 'faculty' || currentUser.college === 'SPSU');
                const loadingCurrent = isSwitching === role.id;

                return (
                  <button
                    key={role.id}
                    disabled={isSwitching !== null}
                    onClick={() => handleRoleSwitch(role.id as any)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                      isCurrent 
                        ? 'bg-[#0D9488]/5 border-[#0D9488] shadow-xs' 
                        : 'bg-white hover:bg-[#FDFCFB] hover:border-[#64748B]/30 border-[#E5E2DE]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${role.color} text-white shadow-inner`}>
                        <RoleIcon size={16} />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1A1C1E]">{role.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#F1F0EC] border border-[#E5E2DE] text-[#64748B]">
                            {role.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B] mt-0.5 leading-normal max-w-[180px] truncate">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    <div>
                      {loadingCurrent ? (
                        <RefreshCw size={14} className="animate-spin text-[#0D9488]" />
                      ) : isCurrent ? (
                        <span className="h-2 w-2 rounded-full bg-[#0D9488]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#94A3B8] -rotate-90" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Helper Tagline */}
          <div className="text-center pt-1 border-t border-[#F1F0EC]">
            <p className="text-[9px] text-[#94A3B8] font-mono uppercase tracking-widest">
              Incipio Simulation Sandbox v1.1
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
