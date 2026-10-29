import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  FileSpreadsheet,
  KeyRound,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { activateStaff, deactivateStaff, getLeaderStatus, getStaff, importStaffCsv, inviteStaff, resetStaffPassword, updateStaff } from './staffApi';
import { ROLES } from '../../../utils/roles';

const roles = [
  ROLES.STAFF,
  ROLES.LEADER,
  ROLES.VICE_LEADER,
  ROLES.ADMINISTRATOR,
  ROLES.EXAM_OFFICER,
];

const blankForm = {
  email: '',
  role: ROLES.STAFF,
};

const permissions = {
  ADMIN: {
    canCreateStaff: true,
    canEditStaff: true,
    canChangeRole: true,
    canChangeStatus: true,
    canResetPassword: true,
  },
};

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [statusActionId, setStatusActionId] = useState('');
  const [staffToDeactivate, setStaffToDeactivate] = useState(null);
  const [deactivationError, setDeactivationError] = useState('');
  const [hasLeader, setHasLeader] = useState(null);
  const [leaderStatusError, setLeaderStatusError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modal, setModal] = useState(null);
  const [menu, setMenu] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [copied, setCopied] = useState(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState('');
  const [csvResult, setCsvResult] = useState(null);

  const csvInputRef = useRef(null);

  // Temporary local role.
  // Later this will come from authenticated user data.
  const currentUserRole = 'ADMIN';
  const access = permissions[currentUserRole];

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await getStaff();
      setStaff(normalizeStaff(response));
      return true;
    } catch (requestError) {
      setLoadError(requestError?.response?.data?.message || 'Unable to load school staff.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(loadStaff, 0);
    return () => window.clearTimeout(request);
  }, [loadStaff]);

  useEffect(() => {
    let active = true;
    getLeaderStatus()
      .then((response) => {
        if (active) setHasLeader(response?.hasLeader === true);
      })
      .catch((requestError) => {
        if (active) setLeaderStatusError(requestError?.response?.data?.message || 'Unable to check the school leader status.');
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((member) => {
      const matchesSearch =
        !query ||
        `${member.firstName} ${member.lastName} ${member.loginId} ${member.email} ${member.role}`
          .toLowerCase()
          .includes(query);

      const matchesRole =
        roleFilter === 'ALL' || member.role === roleFilter;

      const matchesStatus =
        statusFilter === 'ALL' || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staff, search, roleFilter, statusFilter]);

  const activeCount = staff.filter(
    (member) => member.status === 'ACTIVE'
  ).length;

  const inactiveCount = staff.filter(
    (member) => member.status === 'INACTIVE'
  ).length;

  const staffRoleCount = staff.filter(
    (member) => member.role === ROLES.STAFF
  ).length;

  const openCreate = (role = ROLES.STAFF) => {
    setActionError('');
    setActionMessage('');
    setModalError('');
    setModalMessage('');
    setForm({ ...blankForm, role });
    setModal({ type: 'create' });
  };

  const openEdit = (member) => {
    setModalError('');
    setModalMessage('');
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
    });

    setModal({
      type: 'edit',
      member,
    });

    setMenu(null);
  };

  const openView = (member) => {
    setModal({
      type: 'view',
      member,
    });

    setMenu(null);
  };

  const saveStaff = async (event) => {
    event.preventDefault();

    if (modal.type === 'edit') {
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();

      if (!firstName || !lastName || !form.email.trim() || !form.role) {
        setModalError('Complete all required staff details before saving.');
        return;
      }

      if (!modal.member.id) {
        setModalError('This staff record is missing its ID, so it cannot be updated.');
        return;
      }

      setStatusActionId(modal.member.id);
      setModalError('');
      setModalMessage('');
      try {
        const response = await updateStaff(modal.member.id, {
          firstName,
          surName: lastName,
          email: form.email.trim(),
          phoneNumber: form.phone?.trim() || '',
          role: form.role,
        });
        setModal(null);
        const refreshed = await loadStaff();
        const message = response?.message || 'Staff details updated successfully.';
        if (refreshed) setActionMessage(message);
        else setActionError(`${message} The staff list could not be refreshed; retry loading it.`);
      } catch (requestError) {
        setModalError(requestError?.response?.data?.message || 'Unable to update staff details.');
      } finally {
        setStatusActionId('');
      }
      return;
    } else {
      const email = form.email.trim();
      if (!email || !form.role) {
        setModalError('Enter an email address and select a role before sending the invitation.');
        return;
      }

      setStatusActionId('invitation');
      setModalError('');
      setModalMessage('');
      try {
        const response = await inviteStaff({ email, role: form.role });
        const refreshed = await loadStaff();

        if (form.role === ROLES.LEADER) {
          try {
            const leaderResponse = await getLeaderStatus();
            setHasLeader(leaderResponse?.hasLeader === true);
            setLeaderStatusError('');
          } catch (requestError) {
            setLeaderStatusError(requestError?.response?.data?.message || 'Unable to refresh the school leader status.');
          }
        }

        setModal(null);
        const message = response?.message || `${formatRole(form.role)} invitation sent successfully.`;
        if (refreshed) setActionMessage(message);
        else setActionError(`${message} The staff list could not be refreshed; retry loading it.`);
      } catch (requestError) {
        console.log(requestError?.response?.data || requestError);
        setModalError(requestError?.response?.data?.message || 'Unable to send the staff invitation.');
      } finally {
        setStatusActionId('');
      }
      return;
    }
  };

  const toggleStatus = (member) => {
    setMenu(null);
    setActionError('');
    setActionMessage('');
    if (!member.id) {
      setActionError('This staff record is missing its ID, so its status cannot be changed.');
      return;
    }
    if (member.status === 'ACTIVE') {
      setStaffToDeactivate(member);
      setDeactivationError('');
      return;
    }
    changeStaffStatus(member, true);
  };

  const changeStaffStatus = async (member, activate) => {
    setStatusActionId(member.id);
    setActionError('');
    setActionMessage('');
    setDeactivationError('');
    try {
      const response = activate
        ? await activateStaff(member.id)
        : await deactivateStaff(member.id);
      setStaffToDeactivate(null);
      const refreshed = await loadStaff();
      const message = response?.message || `Staff account ${activate ? 'reactivated' : 'deactivated'} successfully.`;
      if (refreshed) {
        setActionMessage(message);
      } else {
        setActionError(`${message} The staff list could not be refreshed; retry loading it.`);
      }
    } catch (requestError) {
      const message = requestError?.response?.data?.message || `Unable to ${activate ? 'reactivate' : 'deactivate'} this staff account.`;
      if (activate) setActionError(message);
      else setDeactivationError(message);
    } finally {
      setStatusActionId('');
    }
  };

  const confirmDeactivateStaff = () => {
    if (staffToDeactivate) changeStaffStatus(staffToDeactivate, false);
  };

  const resetPassword = (member) => {
    setModalError('');
    setModalMessage('');
    setModal({
      type: 'reset-password',
      member,
    });

    setMenu(null);
  };

  const handleResetPassword = async () => {
    if (!modal?.member?.id) {
      setModalError('This staff record is missing its ID, so its password cannot be reset.');
      return;
    }

    setStatusActionId(modal.member.id);
    setModalError('');
    setModalMessage('');
    try {
      const response = await resetStaffPassword(modal.member.id);
      setModalMessage(response?.message || "A temporary password has been sent to the staff member's registered email.");
    } catch (requestError) {
      setModalError(requestError?.response?.data?.message || 'Unable to reset this staff member’s password. Please try again.');
    } finally {
      setStatusActionId('');
    }
  };

  const copyLoginId = async (loginId) => {
    try {
      await navigator.clipboard.writeText(loginId);

      setCopied(loginId);

      setTimeout(() => {
        setCopied(null);
      }, 1800);
    } catch {
      // Clipboard unavailable.
    }
  };

  const handleCsvSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'csv' && extension !== 'xlsx') {
      setCsvError('Choose a .csv or .xlsx file to import staff.');
      setCsvResult(null);
      setShowCsvModal(true);
      return;
    }

    setCsvError('');
    setCsvResult(null);
    setCsvLoading(true);
    setShowCsvModal(true);
    try {
      const records = await parseStaffImportFile(file, extension);
      const validation = validateStaffImportRecords(records);
      if (validation.errors.length) {
        throw new Error(formatStaffImportErrors(validation.errors));
      }

      const response = await importStaffCsv({ staff: validation.staff });
      setCsvResult(response);
      const refreshed = await loadStaff();
      if (!refreshed) {
        setCsvError('Staff were imported successfully, but the staff directory could not be refreshed. Reload the page to see the latest data.');
      }
    } catch (requestError) {
      setCsvError(
        requestError?.response?.data?.message ||
          (requestError?.code === 'ECONNABORTED' || requestError?.code === 'ETIMEDOUT'
            ? 'The staff import took longer than expected and timed out. Check the staff directory before retrying, as the server may have completed the import.'
            : null) ||
          requestError?.message ||
          'Unable to import staff. Check the file and try again.',
      );
    } finally {
      setCsvLoading(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csv =
      'firstName,surName,email,role\n' +
      'Sample,Staff One,staff.one@example.com,STAFF\n' +
      'Sample,Staff Two,staff.two@example.com,ADMINISTRATOR\n';

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'scholanode-staff-template.csv';

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#071A52]"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <section className="relative mt-5 overflow-hidden rounded-3xl bg-linear-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-2xl shadow-[#071A52]/15 sm:p-9">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-36 border-cyan-300/10" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
                <Building2 size={17} />
                School administration
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                People and access
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Staff Management
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-blue-100">
                Manage your school's staff accounts, roles, login IDs and
                account status from one place.
              </p>
            </div>

            {access.canCreateStaff && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-[#071A52] shadow-sm transition hover:bg-cyan-300"
                >
                  <Mail size={18} />
                  Invite staff
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCsvError('');
                    setCsvResult(null);
                    setShowCsvModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15"
                >
                  <FileSpreadsheet size={18} />
                  Import CSV / Excel
                </button>

                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleCsvSelect}
                  className="sr-only"
                />
              </div>
            )}
          </div>
        </section>

        {leaderStatusError && (
          <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {leaderStatusError}
          </div>
        )}

        {hasLeader === false && (
          <section className="mt-5 overflow-hidden rounded-3xl border border-cyan-200 bg-linear-to-r from-cyan-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800"><UserCheck size={23} /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Recommended next step</p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#071A52]">Invite a leader to lead your school</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Your school does not have a leader account yet. Invite a leader now, or continue setting up your staff directory.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openCreate(ROLES.LEADER)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463]"
              >
                <Mail size={17} /> Invite a leader
              </button>
            </div>
          </section>
        )}

        {/* =====================================================
            DIRECTORY INTRO
        ====================================================== */}

        <header className="mt-8 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
              Staff directory
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">
              Your school team
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-500">
            Invite staff individually or import multiple staff accounts from
            a CSV file.
          </p>
        </header>

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Total staff"
            value={staff.length}
          />

          <SummaryCard
            icon={UserCheck}
            label="Active"
            value={activeCount}
            highlight
          />

          <SummaryCard
            icon={UserRound}
            label="Staff"
            value={staffRoleCount}
          />

          <SummaryCard
            icon={UserX}
            label="Inactive"
            value={inactiveCount}
          />
        </div>

        {(loadError || actionError || actionMessage) && (
          <div className={`mt-5 flex items-center justify-between gap-4 rounded-2xl border p-4 text-sm ${loadError || actionError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`} role={loadError || actionError ? 'alert' : 'status'}>
            <span>{loadError || actionError || actionMessage}</span>
            {loadError && <button type="button" onClick={loadStaff} disabled={loading} className="shrink-0 font-bold underline disabled:opacity-50">{loading ? 'Loading…' : 'Retry'}</button>}
            {!loadError && <button type="button" aria-label="Dismiss message" onClick={() => { setActionError(''); setActionMessage(''); }} className="shrink-0 rounded-lg p-1 hover:bg-black/5"><X size={16} /></button>}
          </div>
        )}

        {/* =====================================================
            DIRECTORY CONTROLS
        ====================================================== */}

        <section className="mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
                Staff directory
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">
                School staff
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-72">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search staff..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className={filterClass}
              >
                <option value="ALL">All roles</option>

                {roles.map((role) => (
                  <option key={role} value={role}>
                    {formatRole(role)}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={filterClass}
              >
                <option value="ALL">All status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </section>

        {/* =====================================================
            DESKTOP TABLE
        ====================================================== */}

        {loading ? (
          <div className="mt-5 flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-500">
            <Loader2 size={20} className="animate-spin text-cyan-600" /> Loading school staff…
          </div>
        ) : loadError ? null : (
          <>
        <section className="mt-5 hidden overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Staff member
                  </th>

                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Login ID
                  </th>

                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Role
                  </th>

                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStaff.map((member) => (
                  <StaffRow
                    key={member.id}
                    member={member}
                    menu={menu === member.id}
                    copied={copied === member.loginId}
                    onMenu={() =>
                      setMenu((current) =>
                        current === member.id ? null : member.id
                      )
                    }
                    onView={() => openView(member)}
                    onEdit={() => openEdit(member)}
                    onToggleStatus={() => toggleStatus(member)}
                    onResetPassword={() => resetPassword(member)}
                    onCopy={() => copyLoginId(member.loginId)}
                    canEdit={access.canEditStaff}
                    canChangeStatus={access.canChangeStatus}
                    canResetPassword={access.canResetPassword}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =====================================================
            MOBILE CARDS
        ====================================================== */}

        <section className="mt-5 space-y-4 md:hidden">
          {filteredStaff.map((member) => (
            <MobileStaffCard
              key={member.id}
              member={member}
              menu={menu === member.id}
              onMenu={() =>
                setMenu((current) =>
                  current === member.id ? null : member.id
                )
              }
              onView={() => openView(member)}
              onEdit={() => openEdit(member)}
              onToggleStatus={() => toggleStatus(member)}
              onResetPassword={() => resetPassword(member)}
              canEdit={access.canEditStaff}
              canChangeStatus={access.canChangeStatus}
              canResetPassword={access.canResetPassword}
            />
          ))}
        </section>

        {filteredStaff.length === 0 && (
          <EmptyState
            search={
              search ||
              roleFilter !== 'ALL' ||
              statusFilter !== 'ALL'
            }
            onCreate={openCreate}
          />
        )}
          </>
        )}
      </div>

      {/* =====================================================
          STAFF MODAL
      ====================================================== */}

      {modal && (
        <StaffModal
          modal={modal}
          form={form}
          setForm={setForm}
          saving={modal.type === 'create'
            ? statusActionId === 'invitation'
            : statusActionId === modal.member?.id}
          error={modalError}
          message={modalMessage}
          onClose={() => { if (!statusActionId) setModal(null); }}
          onSave={saveStaff}
          onResetPassword={handleResetPassword}
        />
      )}

      {/* =====================================================
          CSV MODAL
      ====================================================== */}

      {showCsvModal && (
        <CsvImportModal
          onClose={() => { if (!csvLoading) setShowCsvModal(false); }}
          onDownloadTemplate={downloadCsvTemplate}
          onChooseFile={() => csvInputRef.current?.click()}
          loading={csvLoading}
          error={csvError}
          result={csvResult}
        />
      )}

      {staffToDeactivate && (
        <DeactivateStaffModal
          member={staffToDeactivate}
          saving={statusActionId === staffToDeactivate.id}
          error={deactivationError}
          onCancel={() => { if (!statusActionId) setStaffToDeactivate(null); }}
          onConfirm={confirmDeactivateStaff}
        />
      )}
    </main>
  );
}

/* =========================================================
   DESKTOP STAFF ROW
========================================================= */

function StaffRow({
  member,
  menu,
  copied,
  onMenu,
  onView,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onCopy,
  canEdit,
  canChangeStatus,
  canResetPassword,
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <Avatar member={member} />

          <div>
            <p className="font-bold text-[#071A52]">
              {member.firstName} {member.lastName}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {member.email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-5">
        <button
          type="button"
          onClick={onCopy}
          title="Copy login ID"
          className="group inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-[#071A52]"
        >
          {member.loginId}

          {copied ? (
            <CheckCircle2
              size={14}
              className="text-emerald-600"
            />
          ) : (
            <Copy
              size={14}
              className="text-slate-400 group-hover:text-cyan-600"
            />
          )}
        </button>
      </td>

      <td className="px-4 py-5">
        <RoleBadge role={member.role} />
      </td>

      <td className="px-4 py-5">
        <StatusBadge status={member.status} />
      </td>

      <td className="px-4 py-5 text-sm font-semibold text-slate-500">
        {formatDate(member.dateJoined)}
      </td>

      <td className="px-6 py-5">
        <div className="flex justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={onMenu}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#071A52]"
            >
              <MoreVertical size={18} />
            </button>

            {menu && (
              <ActionMenu
                member={member}
                onView={onView}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onResetPassword={onResetPassword}
                canEdit={canEdit}
                canChangeStatus={canChangeStatus}
                canResetPassword={canResetPassword}
              />
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE STAFF CARD
========================================================= */

function MobileStaffCard({
  member,
  menu,
  onMenu,
  onView,
  onEdit,
  onToggleStatus,
  onResetPassword,
  canEdit,
  canChangeStatus,
  canResetPassword,
}) {
  return (
    <article className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar member={member} />

          <div>
            <h3 className="font-extrabold text-[#071A52]">
              {member.firstName} {member.lastName}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {member.email}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <MoreVertical size={18} />
          </button>

          {menu && (
            <ActionMenu
              member={member}
              onView={onView}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onResetPassword={onResetPassword}
              canEdit={canEdit}
              canChangeStatus={canChangeStatus}
              canResetPassword={canResetPassword}
            />
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoBox label="Login ID" value={member.loginId} />

        <InfoBox
          label="Role"
          value={formatRole(member.role)}
        />

        <InfoBox
          label="Status"
          value={<StatusBadge status={member.status} />}
        />

        <InfoBox
          label="Joined"
          value={formatDate(member.dateJoined)}
        />
      </div>
    </article>
  );
}

/* =========================================================
   ACTION MENU
========================================================= */

function ActionMenu({
  member,
  onView,
  onEdit,
  onToggleStatus,
  onResetPassword,
  canEdit,
  canChangeStatus,
  canResetPassword,
}) {
  return (
    <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
      <button
        type="button"
        onClick={onView}
        className={menuItem}
      >
        <Eye size={16} />
        View staff
      </button>

      {canEdit && member.role !== ROLES.LEADER && (
        <button
          type="button"
          onClick={onEdit}
          className={menuItem}
        >
          <Edit3 size={16} />
          Edit staff
        </button>
      )}

      {canResetPassword && (
        <button
          type="button"
          onClick={onResetPassword}
          className={menuItem}
        >
          <KeyRound size={16} />
          Reset password
        </button>
      )}

      {canChangeStatus && (
        <button
          type="button"
          onClick={onToggleStatus}
          className={`${menuItem} ${
            member.status === 'ACTIVE'
              ? 'text-amber-700 hover:bg-amber-50'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          {member.status === 'ACTIVE' ? (
            <UserX size={16} />
          ) : (
            <UserCheck size={16} />
          )}

          {member.status === 'ACTIVE'
            ? 'Deactivate account'
            : 'Activate account'}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   STAFF MODAL
========================================================= */

function StaffModal({
  modal,
  form,
  setForm,
  saving,
  error,
  message,
  onClose,
  onSave,
  onResetPassword,
}) {
  const isView = modal.type === 'view';
  const isReset = modal.type === 'reset-password';
  const member = modal.member;

  if (isReset) {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#071A52]">
            <KeyRound size={25} />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold text-[#071A52]">
            Reset password
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            A temporary password will be sent to the staff member&apos;s registered email. They will need to change it after signing in.
          </p>

          {error && <p role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left text-sm leading-5 text-rose-700">{error}</p>}
          {message && <p role="status" className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm leading-5 text-emerald-700">{message}</p>}

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Staff member
            </p>

            <p className="mt-1 font-bold text-[#071A52]">
              {member.firstName} {member.lastName}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {member.loginId}
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={secondaryButton}
            >
              {message ? 'Close' : 'Cancel'}
            </button>

            {!message && <button
              type="button"
              onClick={onResetPassword}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {saving ? 'Sending temporary password…' : 'Reset password'}
            </button>}
          </div>
        </div>
      </ModalShell>
    );
  }

  if (isView) {
    return (
      <ModalShell onClose={onClose}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
              Staff profile
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">
              Staff details
            </h2>
          </div>

          <StatusBadge status={member.status} />
        </div>

        <div className="mt-7 flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
          <Avatar member={member} large />

          <div>
            <h3 className="text-xl font-extrabold text-[#071A52]">
              {member.firstName} {member.lastName}
            </h3>

            <div className="mt-2">
              <RoleBadge role={member.role} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <DetailItem
            icon={ShieldCheck}
            label="Login ID"
            value={member.loginId}
          />

          <DetailItem
            icon={Mail}
            label="Email"
            value={member.email}
          />

          <DetailItem
            icon={Phone}
            label="Phone"
            value={member.phone || 'Not provided'}
          />

          <DetailItem
            icon={Users}
            label="Role"
            value={formatRole(member.role)}
          />

          <DetailItem
            icon={CheckCircle2}
            label="Joined"
            value={formatDate(member.dateJoined)}
          />
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className={secondaryButton}
          >
            Close
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
          Staff management
        </p>

        <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">
          {modal.type === 'edit'
            ? 'Edit staff member'
            : form.role === ROLES.LEADER ? 'Invite leader' : 'Invite staff'}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {modal.type === 'edit'
            ? "Update this staff member's information."
            : 'Create a staff account by providing their email and assigning an appropriate role.'}
        </p>
      </div>

      <form onSubmit={onSave} className="mt-7 space-y-5">
        {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-5 text-rose-700">{error}</p>}
        {modal.type === 'create' ? (
          <>
            <Field
              label="Staff email"
              type="email"
              value={form.email}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  email: value,
                }))
              }
              placeholder="staff@example.com"
              required
            />

            {form.role === ROLES.LEADER ? (
              <SelectField label="Role" value={ROLES.LEADER} onChange={() => {}}>
                <option value={ROLES.LEADER}>{formatRole(ROLES.LEADER)}</option>
              </SelectField>
            ) : (
              <SelectField
                label="Role"
                value={form.role}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    role: value,
                  }))
                }
              >
                {roles.filter((role) => role !== ROLES.LEADER).map((role) => (
                  <option key={role} value={role}>
                    {formatRole(role)}
                  </option>
                ))}
              </SelectField>
            )}

            <div className="flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
              <Mail
                size={19}
                className="mt-0.5 shrink-0 text-cyan-600"
              />

              <div>
                <p className="text-sm font-bold text-cyan-900">
                  An invitation will be sent
                </p>

                <p className="mt-1 text-sm leading-6 text-cyan-800">
                  ScholaNode will create the staff account, generate
                  a login ID and temporary password, and send the
                  credentials to the staff member by email. On first
                  login, the staff member will complete their profile
                  and change the temporary password.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="First name"
                value={form.firstName}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    firstName: value,
                  }))
                }
                placeholder="e.g. Aisha"
                required
              />

              <Field
                label="Last name"
                value={form.lastName}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    lastName: value,
                  }))
                }
                placeholder="e.g. Ibrahim"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    email: value,
                  }))
                }
                placeholder="staff@school.com"
                required
              />

              <Field
                label="Phone"
                value={form.phone}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    phone: value,
                  }))
                }
                placeholder="08012345678"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Role"
                value={form.role}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    role: value,
                  }))
                }
              >
                {roles.filter((role) => role !== ROLES.LEADER).map((role) => (
                  <option key={role} value={role}>
                    {formatRole(role)}
                  </option>
                ))}
              </SelectField>
            </div>
          </>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={secondaryButton}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving changes…
              </>
            ) : modal.type === 'edit' ? (
              <>
                <Edit3 size={16} />
                Save changes
              </>
            ) : (
              <>
                <Mail size={16} />
                Send invitation
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* =========================================================
   CSV IMPORT MODAL
========================================================= */

function CsvImportModal({
  onClose,
  onDownloadTemplate,
  onChooseFile,
  loading,
  error,
  result,
}) {
  const requiredColumns = [
    'firstName',
    'surName',
    'email',
    'role',
  ];
  const resultData = result?.data || {};
  const emailFailures = Array.isArray(resultData.emailFailures)
    ? resultData.emailFailures.length
    : Number(resultData.emailFailures) || 0;

  return (
    <ModalShell onClose={onClose}>
      {/* Header */}
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#071A52]">
          <FileSpreadsheet size={24} />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
          Bulk staff onboarding
        </p>

        <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">
          Import staff from CSV or Excel
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Add multiple staff members at once using a CSV file or an Excel
          workbook (.xlsx). Excel imports use the first worksheet.
        </p>
      </div>

      {/* =====================================================
          HOW IMPORT WORKS
      ====================================================== */}

      <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
            <Users size={17} />
          </div>

          <div>
            <p className="text-sm font-bold text-cyan-900">
              Import staff from CSV or Excel
            </p>

            <p className="mt-2 text-sm leading-6 text-cyan-800">
              Prepare your staff list in a spreadsheet and upload it as a
              <strong> CSV file or .xlsx workbook</strong>. For Excel workbooks,
              only the first worksheet is processed.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-[#071A52]">
          How file import works
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <CsvStep
            number="1"
            title="Prepare"
            description="Fill in the staff details using our template."
          />

          <CsvStep
            number="2"
            title="Save the file"
            description="Save as .csv or .xlsx. Only the first Excel worksheet is imported."
          />

          <CsvStep
            number="3"
            title="Upload"
            description="Choose the completed CSV or Excel file."
          />
        </div>
      </div>

      {/* =====================================================
          TEMPLATE
      ====================================================== */}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#071A52]">
              Start with our CSV template
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The template contains the exact column names and two valid
              example records. Replace the example names and email addresses
              with real staff details before importing.
            </p>
          </div>

          <button
            type="button"
            onClick={onDownloadTemplate}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-[#071A52] transition hover:bg-cyan-50"
          >
            <FileSpreadsheet size={16} />
            Download template
          </button>
        </div>
      </div>

      {/* =====================================================
          REQUIRED COLUMNS
      ====================================================== */}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-[#071A52]">
          Required file columns
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your CSV or Excel file must contain these exact column names in the
          first row:
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {requiredColumns.map((field) => (
            <span
              key={field}
              className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
            >
              {field}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <p className="text-xs leading-5 text-emerald-800">
            <strong>Login IDs and passwords are not included in the CSV.</strong>{' '}
            ScholaNode will generate each staff member's login ID and temporary
            password automatically when the accounts are created.
          </p>
        </div>
      </div>

      {/* =====================================================
          IMPORTANT NOTE
      ====================================================== */}

      <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-start gap-2.5">
          <FileSpreadsheet
            size={17}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <p className="text-xs leading-5 text-amber-800">
            <strong>Both CSV and .xlsx files are accepted.</strong> Excel
            workbooks are read from the first worksheet only. Empty rows are
            ignored; every non-empty staff row must pass validation before
            anything is submitted. The downloaded template contains example
            records—replace them before importing, or the examples will be
            submitted as staff accounts.
          </p>
        </div>
      </div>

      {/* =====================================================
          ACTIONS
      ====================================================== */}

      {(loading || error || result) && (
        <div className="mt-6 scroll-mb-6" aria-live="polite">
          {loading && (
            <div role="status" className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm font-semibold text-cyan-900">
              <Loader2 size={18} className="animate-spin" />
              Validating the file and importing staff records…
            </div>
          )}

          {error && (
            <p role="alert" className="whitespace-pre-line rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-5 text-rose-700">
              {error}
            </p>
          )}

          {result && (
            <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-bold">{result.message || 'Staff import completed.'}</p>
              <p className="mt-2">
                Imported: {Number(resultData.totalImported) || 0}
                {' · '}Invitation emails sent: {Number(resultData.emailsSent) || 0}
                {' · '}Email failures: {emailFailures}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onDownloadTemplate}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <FileSpreadsheet size={16} />
          Download CSV template
        </button>

        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`${secondaryButton} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {result ? 'Close' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={onChooseFile}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            {loading ? 'Importing…' : result ? 'Import another file' : 'Choose CSV or Excel file'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* =========================================================
   CSV STEP
========================================================= */

function CsvStep({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#071A52] text-xs font-extrabold text-white">
          {number}
        </span>

        <p className="text-sm font-bold text-[#071A52]">
          {title}
        </p>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   MODAL SHELL
========================================================= */

function ModalShell({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A52]/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-1 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Avatar({ member, large = false }) {
  const initials =
    `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#071A52] font-extrabold text-white ${
        large ? 'h-16 w-16 text-xl' : 'h-11 w-11 text-sm'
      }`}
    >
      {initials}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-3xl border bg-white p-5 shadow-sm ${
        highlight
          ? 'border-emerald-200'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-sky-50 text-[#071A52]'
          }`}
        >
          <Icon size={19} />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p
            className={`mt-1 text-xl font-extrabold ${
              highlight
                ? 'text-emerald-700'
                : 'text-[#071A52]'
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-[#071A52]">
      {formatRole(role)}
    </span>
  );
}

function StatusBadge({ status }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }

  if (status === 'SUSPENDED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Suspended
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Inactive
    </span>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <div className="mt-1 text-sm font-bold text-slate-700">
        {value}
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={15} />

        <p className="text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-2 break-all text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        {children}
      </select>
    </div>
  );
}

function EmptyState({
  search,
  onCreate,
}) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-[#071A52]">
        <Search size={28} />
      </div>

      <h2 className="mt-5 text-xl font-extrabold text-[#071A52]">
        {search ? 'No staff found' : 'No staff yet'}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {search
          ? 'Try another name, login ID, role or status.'
          : 'Invite your first staff member or import multiple staff accounts from a CSV file.'}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 font-bold text-white"
        >
          <Mail size={18} />
          Invite staff
        </button>
      )}
    </div>
  );
}

function DeactivateStaffModal({ member, saving, error, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A52]/50 p-4 backdrop-blur-sm">
      <section role="alertdialog" aria-modal="true" aria-labelledby="deactivate-staff-title" aria-describedby="deactivate-staff-description" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertCircle size={23} />
        </div>
        <h2 id="deactivate-staff-title" className="mt-5 text-2xl font-extrabold text-[#071A52]">Deactivate staff account?</h2>
        <p id="deactivate-staff-description" className="mt-2 text-sm leading-6 text-slate-600">
          You are about to deactivate <span className="font-bold text-[#071A52]">{member.firstName} {member.lastName}</span>{member.loginId ? ` (${member.loginId})` : ''}. This will change their account status and may prevent them from accessing the school portal.
        </p>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-800">
          Continue only if you intend to disable this staff account. You can reactivate it later.
        </div>
        {error && <p role="alert" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-5 text-rose-700">{error}</p>}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={saving} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 disabled:opacity-50">Keep account active</button>
          <button type="button" onClick={onConfirm} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Deactivating…' : 'Deactivate account'}
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10';

const filterClass =
  'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10';

const secondaryButton =
  'rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50';

const menuItem =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50';

const staffImportHeaders = ['firstName', 'surName', 'email', 'role'];
const allowedImportRoles = new Set([
  'STAFF',
  'EXAM_OFFICER',
  'VICE_LEADER',
  'ADMINISTRATOR',
]);
const maxStaffImportRecords = 1000;
const staffImportEmailPattern =
  /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

async function parseStaffImportFile(file, extension) {
  const XLSX = await import('@e965/xlsx');
  const fileContent = extension === 'csv'
    ? await file.text()
    : await file.arrayBuffer();
  const workbook = XLSX.read(fileContent, {
    type: extension === 'csv' ? 'string' : 'array',
    raw: false,
    cellDates: false,
  });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The selected file does not contain a worksheet.');
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    header: 1,
    defval: '',
    blankrows: true,
    raw: false,
  });
  const headerRowIndex = rows.findIndex((row) =>
    row.some((cell) => String(cell ?? '').trim() !== ''),
  );
  if (headerRowIndex < 0) {
    throw new Error('The selected file is empty. Add the required column headers and staff records.');
  }

  const headers = rows[headerRowIndex].map((cell, index) => {
    const value = String(cell ?? '');
    return index === 0 ? value.replace(/^\uFEFF/, '') : value;
  });
  const errors = [];
  const headerIndexes = {};

  for (const header of staffImportHeaders) {
    const indexes = headers
      .map((value, index) => value === header ? index : -1)
      .filter((index) => index >= 0);
    if (indexes.length === 0) {
      errors.push(`Missing required column "${header}".`);
    } else if (indexes.length > 1) {
      errors.push(`Required column "${header}" appears more than once.`);
    } else {
      headerIndexes[header] = indexes[0];
    }
  }

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  const records = rows
    .slice(headerRowIndex + 1)
    .map((row, index) => ({
      rowNumber: headerRowIndex + index + 2,
      row,
    }))
    .filter(({ row }) => row.some((cell) => String(cell ?? '').trim() !== ''))
    .map(({ rowNumber, row }) => ({
      rowNumber,
      firstName: row[headerIndexes.firstName],
      surName: row[headerIndexes.surName],
      email: row[headerIndexes.email],
      role: row[headerIndexes.role],
    }));

  return records;
}

function validateStaffImportRecords(records) {
  const errors = [];
  const staff = [];
  const normalizedEmails = new Map();

  if (records.length === 0) {
    errors.push('No staff records were found below the header row.');
  }
  if (records.length > maxStaffImportRecords) {
    errors.push(`A maximum of ${maxStaffImportRecords} staff records can be imported at once; this file contains ${records.length}.`);
  }

  records.forEach((record) => {
    const firstName = String(record.firstName ?? '').trim();
    const surName = String(record.surName ?? '').trim();
    const email = String(record.email ?? '').trim().toLowerCase();
    const role = String(record.role ?? '').trim().toUpperCase();
    const rowErrors = [];

    if (firstName.length < 2 || firstName.length > 50) {
      rowErrors.push('firstName must be 2–50 characters');
    }
    if (surName.length < 2 || surName.length > 50) {
      rowErrors.push('surName must be 2–50 characters');
    }
    if (!staffImportEmailPattern.test(email)) {
      rowErrors.push('email must be a valid email address');
    } else {
      const matchingRows = normalizedEmails.get(email) || [];
      matchingRows.push(record.rowNumber);
      normalizedEmails.set(email, matchingRows);
    }
    if (!allowedImportRoles.has(role)) {
      rowErrors.push(`role must be one of ${[...allowedImportRoles].join(', ')}`);
    }

    if (rowErrors.length) {
      errors.push(`Row ${record.rowNumber}: ${rowErrors.join('; ')}.`);
    }
    staff.push({ firstName, surName, email, role });
  });

  normalizedEmails.forEach((rowNumbers) => {
    if (rowNumbers.length > 1) {
      errors.push(`Duplicate email "${String(records.find((record) => record.rowNumber === rowNumbers[0])?.email ?? '').trim().toLowerCase()}" appears on rows ${rowNumbers.join(', ')}.`);
    }
  });

  return { errors, staff };
}

function formatStaffImportErrors(errors) {
  const visibleErrors = errors.slice(0, 20);
  const remainingCount = errors.length - visibleErrors.length;
  if (remainingCount > 0) {
    visibleErrors.push(`…and ${remainingCount} more validation issue${remainingCount === 1 ? '' : 's'}.`);
  }
  return visibleErrors.join('\n');
}

function formatRole(role) {
  return role
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function normalizeStaff(response) {
  const records = Array.isArray(response?.staff) ? response.staff : [];
  return records.map((member) => ({
    ...member,
    id: member.id ?? member._id ?? member.staffId ?? '',
    firstName: member.firstName ?? '',
    lastName: member.surName ?? member.lastName ?? member.surname ?? '',
    phone: member.phoneNumber ?? member.phone ?? '',
    dateJoined: member.dateJoined ?? member.createdAt ?? '',
    role: member.role === 'VICE' ? 'VICE_LEADER' : member.role ?? '',
    status: member.status ?? 'INACTIVE',
  }));
}