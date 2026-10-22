import React, { useState } from 'react';
import { User, School, Property, PropertyReport, AuditLog } from '../types';
import { StorageService } from '../services/storageService';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  AlertTriangle, 
  School as SchoolIcon, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Trash2, 
  MapPin, 
  Filter, 
  Compass,
  ArrowUpRight,
  RefreshCw,
  BadgeAlert,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  schools: School[];
  properties: Property[];
  onRefreshProperties: () => void;
  onExploreMap: (schoolId?: string) => void;
  onViewPropertyDetails: (property: Property) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  schools,
  properties,
  onRefreshProperties,
  onExploreMap,
  onViewPropertyDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'reports' | 'schools' | 'logs'>('listings');
  const [propertyFilter, setPropertyFilter] = useState<'all' | 'approved' | 'pending' | 'suspended'>('all');

  // Stored state
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [reports, setReports] = useState<PropertyReport[]>(() => StorageService.getReports());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    if (propertyFilter === 'all') return true;
    return p.status === propertyFilter;
  });

  const ownersList = users.filter((u) => u.role === 'owner');
  const studentsList = users.filter((u) => u.role === 'student');

  // Handle Approve Listing
  const handleApprove = (propId: string) => {
    StorageService.updatePropertyStatus(propId, 'approved', undefined, user);
    onRefreshProperties();
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Handle Suspend Listing
  const handleSuspend = (propId: string) => {
    const reason = prompt('Ilagay ang dahilan ng pagsususpinde:', 'Policy clarification needed');
    if (reason !== null) {
      StorageService.updatePropertyStatus(propId, 'suspended', reason, user);
      onRefreshProperties();
      setAuditLogs(StorageService.getAuditLogs());
    }
  };

  // Handle Delete Listing
  const handleDelete = (propId: string) => {
    if (confirm('Sigurado ka ba na buburahin ang listing na ito sa database?')) {
      StorageService.deleteProperty(propId, user);
      onRefreshProperties();
      setAuditLogs(StorageService.getAuditLogs());
    }
  };

  // Handle Toggle Owner Verification
  const handleToggleVerifyOwner = (owner: User) => {
    const nextStatus = !owner.isVerifiedOwner;
    StorageService.verifyOwner(owner.id, nextStatus);
    setUsers(StorageService.getUsers());
    onRefreshProperties();
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Handle Toggle Listing Verification Badge
  const handleToggleVerifyListing = (propId: string) => {
    StorageService.togglePropertyVerification(propId, user);
    onRefreshProperties();
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Handle Reset Demo Listings
  const handleResetDemo = () => {
    if (confirm('I-load ang default sample boarding houses at reviews para sa Capiz campuses?')) {
      StorageService.resetDemoData();
      onRefreshProperties();
      setAuditLogs(StorageService.getAuditLogs());
      alert('Matagumpay na na-load ang sample listings at student reviews!');
    }
  };

  // Handle Report Status
  const handleUpdateReportStatus = (reportId: string, status: 'reviewed' | 'dismissed') => {
    StorageService.updateReportStatus(reportId, status, user);
    setReports(StorageService.getReports());
    setAuditLogs(StorageService.getAuditLogs());
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-6">
      {/* 1. Admin Header Bar */}
      <div className="bg-[#173747] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#075E59]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#075E59] text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-[#087F78] shrink-0">
              <ShieldCheck className="w-7 h-7 text-[#F6B52E]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Capiz BH Moderation & Admin Control
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F6B52E] text-[#173747]">
                  System Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span>Account: <strong className="text-white">admin@board.com</strong></span>
                <span className="text-slate-500">·</span>
                <span>Jurisdiction: Buong Lalawigan ng Capiz (Roxas City at 16 Municipalities)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetDemo}
              className="py-2.5 px-4 rounded-xl bg-[#087F78] hover:bg-[#075E59] text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/20 shadow-sm"
              title="I-restore ang default sample Capiz boarding houses at reviews"
            >
              <Sparkles className="w-4 h-4 text-[#F6B52E]" />
              <span>I-load Sample Listings</span>
            </button>
            <button
              type="button"
              onClick={() => onExploreMap()}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/10"
            >
              <Compass className="w-4 h-4 text-[#F6B52E]" />
              <span>Buksan ang Map</span>
            </button>
          </div>
        </div>

        {/* Admin KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-[11px] font-medium text-slate-300">Total BH Listings</div>
            <div className="text-xl font-black text-white tabular-nums mt-0.5">
              {properties.length}
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-[11px] font-medium text-slate-300">Pending Review</div>
            <div className="text-xl font-black text-amber-400 tabular-nums mt-0.5">
              {properties.filter((p) => p.status === 'pending').length}
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-[11px] font-medium text-slate-300">Registered Owners</div>
            <div className="text-xl font-black text-white tabular-nums mt-0.5">
              {ownersList.length}
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-[11px] font-medium text-slate-300">Registered Students</div>
            <div className="text-xl font-black text-white tabular-nums mt-0.5">
              {studentsList.length}
            </div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-[11px] font-medium text-slate-300">Reports Pending</div>
            <div className="text-xl font-black text-rose-400 tabular-nums mt-0.5">
              {reports.filter((r) => r.status === 'pending').length}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'listings'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Listing Moderation ({properties.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Owners ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BadgeAlert className="w-4 h-4" />
          <span>Reports & Complaints ({reports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schools')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'schools'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <SchoolIcon className="w-4 h-4" />
          <span>Capiz Campuses ({schools.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-[#075E59] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB A: LISTINGS MODERATION */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Sub-filters */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#075E59]" />
              <span className="text-xs font-bold text-slate-700">Filter Status:</span>
              <div className="flex gap-1 ml-2">
                {(['all', 'approved', 'pending', 'suspended'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPropertyFilter(st)}
                    className={`py-1 px-2.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      propertyFilter === st
                        ? 'bg-[#075E59] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Nagpapakita ng {filteredProperties.length} sa {properties.length} listings
            </span>
          </div>

          {/* Listings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Boarding House</th>
                    <th className="p-3.5">May-ari (Owner)</th>
                    <th className="p-3.5">Lokasyon (Capiz)</th>
                    <th className="p-3.5">Malapit sa Campus</th>
                    <th className="p-3.5">Upa / Month</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProperties.map((prop) => {
                    const nearestSchool = schools.find((s) => s.id === prop.nearestSchoolId);
                    const isVerified = Boolean(prop.isVerifiedListing ?? prop.isOwnerVerified);
                    return (
                      <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={prop.coverImage}
                              alt={prop.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-[#173747]">{prop.name}</div>
                              <div className="text-[11px] text-slate-400">{prop.propertyType} · {prop.roomType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">{prop.ownerName}</div>
                          <div className="text-[11px] text-slate-500">{prop.ownerPhone}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-700">{prop.barangay}</div>
                          <div className="text-[11px] text-slate-500">{prop.municipality}, Capiz</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-[#075E59]">{nearestSchool?.shortName || 'Campus'}</span>
                          <div className="text-[10px] text-slate-400">~{prop.distanceToSchoolKm} km</div>
                        </td>
                        <td className="p-3.5 font-bold text-[#173747] tabular-nums">
                          ₱{prop.monthlyRent.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleVerifyListing(prop.id)}
                            className="cursor-pointer hover:opacity-85 transition-opacity"
                            title="I-click para i-toggle ang Verified / Unverified badge"
                          >
                            <VerifiedBadge
                              isVerified={isVerified}
                              variant="compact"
                              size="xs"
                              showUnverified={true}
                            />
                          </button>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                              prop.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : prop.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => onViewPropertyDetails(prop)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-[#075E59]"
                              title="Preview Listing"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleVerifyListing(prop.id)}
                              className={`py-1 px-2 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs border transition-colors ${
                                isVerified
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                              }`}
                              title={isVerified ? 'I-set bilang Unverified' : 'I-set bilang Verified'}
                            >
                              <ShieldCheck className="w-3 h-3 text-[#075E59]" />
                              <span>{isVerified ? 'Verified' : 'Unverified'}</span>
                            </button>

                            {prop.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApprove(prop.id)}
                                className="py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                                title="Approve Listing"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            )}

                            {prop.status === 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleSuspend(prop.id)}
                                className="py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                                title="Suspend Listing"
                              >
                                <span>Suspend</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(prop.id)}
                              className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Owners Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#173747]">
                  Mga Rehistradong May-ari ng Boarding House (Landlords)
                </h3>
                <p className="text-xs text-slate-500">Maaaring i-verify ng Admin ang kanilang pagkakakilanlan.</p>
              </div>
              <span className="text-xs font-bold text-[#075E59] bg-[#075E59]/10 py-1 px-2.5 rounded-full">
                {ownersList.length} Owners
              </span>
            </div>

            {ownersList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Wala pang rehistradong BH Owner. Mag-register ang mga may-ari gamit ang Register form.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Pangalan</th>
                      <th className="p-3">Business Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Verification</th>
                      <th className="p-3 text-right">Aksyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ownersList.map((owner) => (
                      <tr key={owner.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{owner.name}</td>
                        <td className="p-3 text-slate-600">{owner.businessName || '—'}</td>
                        <td className="p-3 text-slate-600">{owner.email}</td>
                        <td className="p-3 text-slate-600">{owner.phone || '—'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              owner.isVerifiedOwner
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {owner.isVerifiedOwner ? 'Verified Landlord' : 'Unverified'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleVerifyOwner(owner)}
                            className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                              owner.isVerifiedOwner
                                ? 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            {owner.isVerifiedOwner ? 'Revoke Verification' : 'Verify Owner'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Students Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#173747]">
                  Mga Rehistradong Estudyante sa Capiz
                </h3>
                <p className="text-xs text-slate-500">Mga mag-aaral na naghahanap ng tirahan malapit sa kanilang eskwelahan.</p>
              </div>
              <span className="text-xs font-bold text-[#075E59] bg-[#075E59]/10 py-1 px-2.5 rounded-full">
                {studentsList.length} Students
              </span>
            </div>

            {studentsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Wala pang rehistradong estudyante. Mag-register ang mga estudyante gamit ang Register form.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Pangalan</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Preferred Campus</th>
                      <th className="p-3">Petsa ng Rehistro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentsList.map((st) => {
                      const campus = schools.find((s) => s.id === st.preferredSchoolId);
                      return (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{st.name}</td>
                          <td className="p-3 text-slate-600">{st.email}</td>
                          <td className="p-3 text-slate-600">{st.phone || '—'}</td>
                          <td className="p-3 font-semibold text-[#075E59]">{campus?.shortName || 'Capiz College'}</td>
                          <td className="p-3 text-slate-500">{new Date(st.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB C: REPORTS & COMPLAINTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#173747]">
                Mga Ulat at Reklamo mula sa mga Estudyante
              </h3>
              <p className="text-xs text-slate-500">I-verify ang mga presyo, lokasyon, o patakaran ng mga boarding house.</p>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 py-1 px-2.5 rounded-full border border-rose-200">
              {reports.filter((r) => r.status === 'pending').length} Pending
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Walang reklamo o reports na naisumite sa kasalukuyan.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#173747]">{rep.propertyName}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rep.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : rep.status === 'reviewed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {rep.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <strong>Rason:</strong> {rep.reason}
                    </div>
                    <div className="text-xs text-slate-500">
                      <strong>Detalye:</strong> {rep.details}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Iniulat ni {rep.reporterName} noong {new Date(rep.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rep.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateReportStatus(rep.id, 'reviewed')}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                        >
                          Mark Reviewed
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateReportStatus(rep.id, 'dismissed')}
                          className="py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB D: CAPIZ CAMPUSES DIRECTORY */}
      {activeTab === 'schools' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#173747]">
              Direktoryo ng mga Kolehiyo at Pamantasan sa Capiz
            </h3>
            <p className="text-xs text-slate-500">
              12+ mga verified campuses sa Roxas City, Pilar, Pontevedra, Mambusao, Sigma, Dumarao, at Tapaz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((school) => {
              const count = properties.filter((p) => p.nearestSchoolId === school.id).length;
              return (
                <div key={school.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <SchoolIcon className="w-4 h-4 text-[#075E59]" />
                      <h4 className="font-bold text-xs text-[#173747]">{school.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{school.address}</p>
                    <div className="mt-2 text-[10px] font-mono text-slate-400">
                      Coords: {school.lat.toFixed(4)}° N, {school.lng.toFixed(4)}° E
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#075E59]">
                      {count} Boarding Houses malapit
                    </span>
                    <button
                      type="button"
                      onClick={() => onExploreMap(school.id)}
                      className="text-xs font-bold text-slate-700 hover:text-[#075E59] flex items-center gap-1"
                    >
                      <span>Tingnan</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB E: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#173747]">System Audit Logs</h3>
            <span className="text-xs text-slate-500">{auditLogs.length} events recorded</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-800">{log.action}</div>
                  <div className="text-[11px] text-slate-500">{log.notes || 'No extra notes'}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">By: {log.adminName}</div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
