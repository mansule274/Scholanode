import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  FileSpreadsheet,
  KeyRound,
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

const storageKey = 'scholanode-staff';

const starterStaff = [
  {
    id: '1',
    firstName: 'Aisha',
    lastName: 'Ibrahim',
    email: 'aisha.ibrahim@school.com',
    phone: '08031234567',
    gender: 'FEMALE',
    role: 'TEACHER',
    status: 'ACTIVE',
    loginId: 'SCHSTF0001',
    dateJoined: '2026-09-05',
  },
  {
    id: '2',
    firstName: 'Abdulrahman',
    lastName: 'Musa',
    email: 'abdulrahman.musa@school.com',
    phone: '08039876543',
    gender: 'MALE',
    role: 'TEACHER',
    status: 'ACTIVE',
    loginId: 'SCHSTF0002',
    dateJoined: '2026-09-06',
  },
  {
    id: '3',
    firstName: 'Fatima',
    lastName: 'Yusuf',
    email: 'fatima.yusuf@school.com',
    phone: '08034567890',
    gender: 'FEMALE',
    role: 'ADMINISTRATOR',
    status: 'ACTIVE',
    loginId: 'SCHSTF0003',
    dateJoined: '2026-09-01',
  },
  {
    id: '4',
    firstName: 'Sani',
    lastName: 'Bello',
    email: 'sani.bello@school.com',
    phone: '08037654321',
    gender: 'MALE',
    role: 'EXAM_OFFICER',
    status: 'ACTIVE',
    loginId: 'SCHSTF0004',
    dateJoined: '2026-09-07',
  },
  {
    id: '5',
    firstName: 'Maryam',
    lastName: 'Umar',
    email: 'maryam.umar@school.com',
    phone: '08033445566',
    gender: 'FEMALE',
    role: 'TEACHER',
    status: 'INACTIVE',
    loginId: 'SCHSTF0005',
    dateJoined: '2026-08-28',
  },
  {
    id: '6',
    firstName: 'Ibrahim',
    lastName: 'Abdullahi',
    email: 'ibrahim.abdullahi@school.com',
    phone: '08032221100',
    gender: 'MALE',
    role: 'VICE',
    status: 'ACTIVE',
    loginId: 'SCHSTF0006',
    dateJoined: '2026-08-20',
  },
];

const roles = [
  'TEACHER',
  'ADMINISTRATOR',
  'EXAM_OFFICER',
  'VICE',
];

const blankForm = {
  email: '',
  role: 'TEACHER',
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
  const [staff, setStaff] = useState(() => loadStaff());
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modal, setModal] = useState(null);
  const [menu, setMenu] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [copied, setCopied] = useState(null);
  const [showCsvModal, setShowCsvModal] = useState(false);

  const csvInputRef = useRef(null);

  // Temporary local role.
  // Later this will come from authenticated user data.
  const currentUserRole = 'ADMIN';
  const access = permissions[currentUserRole];

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(staff));
  }, [staff]);

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

  const teacherCount = staff.filter(
    (member) => member.role === 'TEACHER'
  ).length;

  const openCreate = () => {
    setForm(blankForm);
    setModal({ type: 'create' });
  };

  const openEdit = (member) => {
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      gender: member.gender || '',
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

  const saveStaff = (event) => {
    event.preventDefault();

    if (modal.type === 'edit') {
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();

      if (!firstName || !lastName || !form.email.trim() || !form.role) {
        return;
      }

      setStaff((current) =>
        current.map((member) =>
          member.id === modal.member.id
            ? {
                ...member,
                ...form,
                firstName,
                lastName,
                email: form.email.trim(),
                phone: form.phone?.trim() || '',
              }
            : member
        )
      );
    } else {
      if (!form.email.trim() || !form.role) return;

      const nextNumber = getNextStaffNumber(staff);

      const newStaff = {
        id: crypto.randomUUID(),
        ...form,
        firstName: 'Invited',
        lastName: 'Staff',
        email: form.email.trim(),
        loginId: `SCHSTF${String(nextNumber).padStart(4, '0')}`,
        status: 'ACTIVE',
        dateJoined: new Date().toISOString().slice(0, 10),
      };

      setStaff((current) => [newStaff, ...current]);
    }

    setModal(null);
  };

  const toggleStatus = (member) => {
    setStaff((current) =>
      current.map((item) =>
        item.id === member.id
          ? {
              ...item,
              status:
                item.status === 'ACTIVE'
                  ? 'INACTIVE'
                  : 'ACTIVE',
            }
          : item
      )
    );

    setMenu(null);
  };

  const resetPassword = (member) => {
    setModal({
      type: 'reset-password',
      member,
    });

    setMenu(null);
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

  const handleCsvSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    console.log('Staff CSV selected:', file);

    // Backend CSV processing will be connected here later.
    // For now, the selected file is only logged.
    event.target.value = '';
  };

  const downloadCsvTemplate = () => {
    const csv =
      'firstName,lastName,email,phone,gender,role\n' +
      ',,,,,\n';

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

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admin"
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
                  onClick={() => setShowCsvModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15"
                >
                  <FileSpreadsheet size={18} />
                  Import CSV
                </button>

                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvSelect}
                  className="sr-only"
                />
              </div>
            )}
          </div>
        </section>

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
            label="Teachers"
            value={teacherCount}
          />

          <SummaryCard
            icon={UserX}
            label="Inactive"
            value={inactiveCount}
          />
        </div>

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
              </select>
            </div>
          </div>
        </section>

        {/* =====================================================
            DESKTOP TABLE
        ====================================================== */}

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
      </div>

      {/* =====================================================
          STAFF MODAL
      ====================================================== */}

      {modal && (
        <StaffModal
          modal={modal}
          form={form}
          setForm={setForm}
          onClose={() => setModal(null)}
          onSave={saveStaff}
        />
      )}

      {/* =====================================================
          CSV MODAL
      ====================================================== */}

      {showCsvModal && (
        <CsvImportModal
          onClose={() => setShowCsvModal(false)}
          onDownloadTemplate={downloadCsvTemplate}
          onChooseFile={() => {
            setShowCsvModal(false);
            csvInputRef.current?.click();
          }}
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

      {canEdit && (
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
  onClose,
  onSave,
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
            This is a local simulation for now. In the real system,
            the staff member will receive a secure password-reset flow.
          </p>

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
              className={secondaryButton}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white hover:bg-[#0A2463]"
            >
              Confirm reset
            </button>
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
            icon={UserRound}
            label="Gender"
            value={formatGender(member.gender)}
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
            : 'Invite staff'}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {modal.type === 'edit'
            ? "Update this staff member's information."
            : 'Create a staff account by providing their email and assigning an appropriate role.'}
        </p>
      </div>

      <form onSubmit={onSave} className="mt-7 space-y-5">
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
              {roles.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </SelectField>

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
                label="Gender"
                value={form.gender}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    gender: value,
                  }))
                }
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </SelectField>

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
                {roles.map((role) => (
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463]"
          >
            {modal.type === 'edit' ? (
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
}) {
  const requiredColumns = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'gender',
    'role',
  ];

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
          Import staff from CSV
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Add multiple staff members at once by preparing their details in a
          spreadsheet and uploading the finished CSV file to ScholaNode.
        </p>
      </div>

      {/* =====================================================
          WHY CSV
      ====================================================== */}

      <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
            <Users size={17} />
          </div>

          <div>
            <p className="text-sm font-bold text-cyan-900">
              Why use CSV import?
            </p>

            <p className="mt-2 text-sm leading-6 text-cyan-800">
              CSV import saves time when adding many staff members. Instead of
              completing the invitation form one person at a time, you can
              prepare your entire staff list in{' '}
              <strong>Excel, Google Sheets, or another spreadsheet app</strong>
              , then save or export the spreadsheet as a{' '}
              <strong>CSV file</strong> and upload it here.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-[#071A52]">
          How CSV import works
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <CsvStep
            number="1"
            title="Prepare"
            description="Fill in the staff details using our template."
          />

          <CsvStep
            number="2"
            title="Save as CSV"
            description="Export or save the spreadsheet as a .csv file."
          />

          <CsvStep
            number="3"
            title="Upload"
            description="Upload the completed CSV to ScholaNode."
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
              The template already contains the column names expected by
              ScholaNode. Download it, fill in your staff details, then save
              or export it as a CSV file.
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
          Required CSV columns
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your CSV file should contain these column names in the first row:
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
            <strong>CSV is the upload format.</strong> You may use Excel or
            Google Sheets to prepare the staff list, but make sure you save or
            export the completed spreadsheet as a CSV file before uploading it
            to ScholaNode.
          </p>
        </div>
      </div>

      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className={secondaryButton}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onChooseFile}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463]"
        >
          <FileSpreadsheet size={16} />
          Choose CSV file
        </button>
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

function formatRole(role) {
  return role
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatGender(gender) {
  if (!gender) return 'Not provided';

  return gender === 'MALE' ? 'Male' : 'Female';
}

function formatDate(date) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getNextStaffNumber(staff) {
  const numbers = staff
    .map((member) =>
      Number(member.loginId?.replace(/\D/g, ''))
    )
    .filter((number) => Number.isFinite(number));

  return Math.max(0, ...numbers) + 1;
}

function loadStaff() {
  if (typeof window === 'undefined') {
    return starterStaff;
  }

  try {
    const saved = window.localStorage.getItem(storageKey);

    return saved ? JSON.parse(saved) : starterStaff;
  } catch {
    return starterStaff;
  }
}