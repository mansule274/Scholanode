import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Clock3,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  Link2,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  UserCheck,
  UserPlus,
  UserRound,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  createParent,
  deleteParent,
  getParents,
  importParentsCsv,
  linkStudentToParent,
  unlinkStudentFromParent,
} from './parentApi';
import { getStudents } from './studentsApi';

const relationshipOptions = ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'];
const statusOptions = ['ACTIVE', 'INACTIVE', 'PENDING'];

const blankForm = {
  firstName: '',
  surName: '',
  email: '',
  phoneNumber: '',
};

export default function ParentManagement() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [relationshipFilter, setRelationshipFilter] = useState('ALL');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [copied, setCopied] = useState('');
  const [parentToDelete, setParentToDelete] = useState(null);
  const [deletingParent, setDeletingParent] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const importInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const request = window.setTimeout(() => {
      setLoading(true);
      setLoadError('');
      getParents({
        page,
        limit: pageSize,
        search: search.trim(),
        status: statusFilter,
        relationship: relationshipFilter,
      })
        .then((response) => {
          const data = response?.data;
          if (!Array.isArray(data?.parents) || !data.pagination) {
            throw new Error('The server returned an invalid parent list.');
          }
          if (active) {
            setParents(data.parents);
            setPagination(data.pagination);
            setSelectedIds([]);
          }
        })
        .catch((error) => {
          if (active) {
            setLoadError(
              error?.response?.data?.message ||
                error?.message ||
                'Unable to load parents.'
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, search ? 300 : 0);

    return () => {
      active = false;
      window.clearTimeout(request);
    };
  }, [page, pageSize, search, statusFilter, relationshipFilter, refreshKey]);

  const filteredParents = parents;
  const activeCount = parents.filter((parent) => parent.status === 'ACTIVE').length;
  const linkedCount = parents.filter(
    (parent) => (parent.studentRelationships || []).length > 0
  ).length;
  const linkedStudentCount = new Set(
    parents.flatMap((parent) =>
      (parent.studentRelationships || []).map((item) => item.studentId)
    )
  ).size;

  const openCreate = () => {
    setForm(blankForm);
    setFormError('');
    setModal({ type: 'create' });
    setMenu('');
  };

  const openManageStudents = (parent) => {
    setModal({ type: 'manage-students', parent });
    setMenu('');
  };

  const updateParentRelationships = (parentId, studentRelationships) => {
    setParents((previous) =>
      previous.map((parent) =>
        parent.id === parentId
          ? {
              ...parent,
              studentRelationships,
              childrenCount: studentRelationships.length,
            }
          : parent
      )
    );
  };

  const handleParentImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    setImportError('');
    setImportResult(null);
    setModal({ type: 'import' });

    if (extension !== 'csv' && extension !== 'xlsx') {
      setImportError('Choose a .csv or .xlsx file to import parents.');
      return;
    }

    setImportLoading(true);
    try {
      const records = await parseParentImportFile(file, extension);
      const validation = validateParentImportRecords(records);
      if (validation.errors.length) {
        throw new Error(formatParentImportErrors(validation.errors));
      }

      const response = await importParentsCsv({ parents: validation.parents });
      if (
        response?.success !== true ||
        !response?.data ||
        !Array.isArray(response.data.parents) ||
        !Number.isFinite(Number(response.data.totalImported))
      ) {
        throw new Error(
          response?.message || 'The server returned an invalid parent import response.'
        );
      }

      setImportResult(response);
      setMessage(response.message || 'Parent accounts imported successfully.');
      setPage(1);
      setSelectedIds([]);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setImportError(
        error?.response?.data?.message ||
          (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT'
            ? 'The parent import took longer than expected and timed out. Check the parent directory before retrying, as the server may have completed the import.'
            : null) ||
          error?.message ||
          'Unable to import parents. Check the file and try again.'
      );
    } finally {
      setImportLoading(false);
    }
  };

  const saveParent = async (event) => {
    event.preventDefault();
    const firstName = form.firstName.trim();
    const surName = form.surName.trim();
    const phoneNumber = form.phoneNumber.trim();
    const email = form.email.trim();

    if (!firstName || !surName || !phoneNumber || !email) {
      setFormError('First name, surname, phone number, and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Enter a valid email address.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const response = await createParent({
        firstName,
        surName,
        phoneNumber,
        email,
      });
      setMessage(response?.message || `${firstName} ${surName} was added.`);
      setModal(null);
      setPage(1);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to create the parent.'
      );
    } finally {
      setSaving(false);
    }
  };

  const requestParentDeletion = (parent) => {
    setMenu('');
    setDeleteError('');
    setParentToDelete(parent);
  };

  const confirmParentDeletion = async () => {
    if (!parentToDelete) return;
    setDeletingParent(true);
    setDeleteError('');
    try {
      const response = await deleteParent(parentToDelete.id);
      if (response?.success !== true) {
        throw new Error(response?.message || 'The server did not confirm parent deletion.');
      }

      setParents((previous) => previous.filter((parent) => parent.id !== parentToDelete.id));
      setSelectedIds((previous) => previous.filter((id) => id !== parentToDelete.id));
      setMessage(response.message || 'Parent and all student relationships deleted successfully.');
      setParentToDelete(null);
      if (parents.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        setRefreshKey((value) => value + 1);
      }
    } catch (error) {
      setDeleteError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to permanently delete this parent. Please try again.'
      );
    } finally {
      setDeletingParent(false);
    }
  };

  const toggleSelected = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    );
  };

  const setAllVisibleSelected = () => {
    const visibleIds = filteredParents.map((parent) => parent.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((previous) =>
      allVisibleSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : [...new Set([...previous, ...visibleIds])]
    );
  };

  const exportParents = (records = filteredParents) => {
    const rows = [
      ['firstName', 'surName', 'email', 'phoneNumber', 'status', 'userStatus', 'loginId', 'childrenCount', 'students', 'relationships'],
      ...records.map((parent) => [
        parent.firstName,
        parent.surName,
        parent.email,
        parent.phoneNumber,
        parent.status,
        parent.userStatus,
        parent.loginId,
        parent.childrenCount,
        (parent.studentRelationships || [])
          .map((item) => item.student?.admissionNumber)
          .filter(Boolean)
          .join('; '),
        (parent.studentRelationships || []).map((item) => item.relationship).join('; '),
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
    downloadFile(csv, 'scholanode-parents.csv', 'text/csv;charset=utf-8;');
    setMessage(`${records.length} parent record${records.length === 1 ? '' : 's'} exported.`);
  };

  const copyContact = async (value, id) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      window.setTimeout(() => setCopied(''), 1600);
      setMessage('Contact detail copied to clipboard.');
    } catch {
      setMessage('Clipboard access is unavailable in this browser.');
    }
    setMenu('');
  };

  const selectedParents = parents.filter((parent) => selectedIds.includes(parent.id));
  const allVisibleSelected =
    filteredParents.length > 0 &&
    filteredParents.every((parent) => selectedIds.includes(parent.id));

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1500px]">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#071A52]"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-2xl shadow-[#071A52]/15 sm:p-9">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-cyan-300/10" />
          <div className="absolute bottom-[-2rem] left-[-2rem] h-32 w-32 rounded-full bg-cyan-300/10" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
                <ShieldCheck size={17} />
                School administration
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">People directory</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Parent Management</h1>
              <p className="mt-3 max-w-2xl leading-7 text-blue-100">
                Keep parent and guardian contacts organised, connected to the right students, and ready for school communication.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-[#071A52] shadow-sm transition hover:bg-cyan-300"
              >
                <Plus size={18} /> Add parent
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportError('');
                  setImportResult(null);
                  setModal({ type: 'import' });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15"
              >
                <Upload size={18} /> Import CSV / Excel
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleParentImportFile}
                className="sr-only"
              />
            </div>
          </div>
        </section>

        <header className="mt-8 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Family & contacts</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">Parents and guardians</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-500">
            A parent can be linked to more than one student, and each student link keeps its own relationship label.
          </p>
        </header>

        {message && (
          <div role="status" className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage('')} aria-label="Dismiss message" className="rounded-lg p-1 hover:bg-emerald-100">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Users} label="Parent accounts" value={pagination.total} detail={`${parents.length} on this page`} />
          <SummaryCard icon={UserCheck} label="Active contacts (page)" value={activeCount} detail="Current results" highlight />
          <SummaryCard icon={Link2} label="Linked families (page)" value={linkedCount} detail={`${linkedStudentCount} students connected`} />
          <SummaryCard icon={UserPlus} label="Needs linking (page)" value={parents.length - linkedCount} detail="Current results" />
        </div>

        <section className="mt-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Directory filters</p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">Find a parent</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:flex">
              <div className="relative w-full sm:col-span-2 xl:w-72">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, phone, email or student"
                  className={`${inputClass} pl-10`}
                  aria-label="Search parents"
                />
              </div>
              <FilterSelect value={statusFilter} onChange={(value) => { setStatusFilter(value); setPage(1); }} label="All statuses" options={['ALL', ...statusOptions]} format={formatStatus} />
              <FilterSelect value={relationshipFilter} onChange={(value) => { setRelationshipFilter(value); setPage(1); }} label="All relationships" options={['ALL', ...relationshipOptions]} format={formatRelationship} />
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loadError && (
            <div role="alert" className="flex flex-col gap-3 border-b border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => setRefreshKey((value) => value + 1)}
                disabled={loading}
                className="font-semibold underline disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          )}
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm font-semibold text-slate-700">
              {pagination.total} parent{pagination.total === 1 ? '' : 's'} found
              {selectedIds.length > 0 && <span className="ml-2 text-cyan-700">· {selectedIds.length} selected</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedIds.length > 0 && (
                <button type="button" onClick={() => exportParents(selectedParents)} className={secondaryButton}>
                  <Download size={15} /> Export selected
                </button>
              )}
              <button type="button" onClick={() => exportParents()} className={secondaryButton}>
                <FileSpreadsheet size={15} /> Export {filteredParents.length}
              </button>
              {selectedIds.length > 0 && (
                <button type="button" onClick={() => setSelectedIds([])} className={secondaryButton}>
                  Clear selection
                </button>
              )}
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className={thClass}>
                    <input type="checkbox" aria-label="Select all visible parents" checked={allVisibleSelected} onChange={setAllVisibleSelected} className="h-4 w-4 rounded border-slate-300 accent-[#0A2463]" />
                  </th>
                  <th className={thClass}>Parent / guardian</th>
                  <th className={thClass}>Contact</th>
                  <th className={thClass}>Linked students</th>
                  <th className={thClass}>Relationship</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7}><DirectoryLoading /></td></tr>
                ) : loadError ? (
                  <tr><td colSpan={7}><EmptyState title="Unable to load parents" description="Retry the request to load the parent directory." onAdd={openCreate} /></td></tr>
                ) : filteredParents.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState search={search} onAdd={openCreate} /></td></tr>
                ) : filteredParents.map((parent) => (
                  <ParentRow
                    key={parent.id}
                    parent={parent}
                    selected={selectedIds.includes(parent.id)}
                    onSelect={() => toggleSelected(parent.id)}
                    menu={menu}
                    setMenu={setMenu}
                    onView={() => { setModal({ type: 'view', parent }); setMenu(''); }}
                    onManageStudents={() => openManageStudents(parent)}
                    onDelete={() => requestParentDeletion(parent)}
                    onCopy={(value, id) => copyContact(value, id)}
                    copied={copied}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {loading ? <DirectoryLoading /> : loadError ? <EmptyState title="Unable to load parents" description="Retry the request to load the parent directory." onAdd={openCreate} /> : filteredParents.length === 0 ? <EmptyState search={search} onAdd={openCreate} /> : filteredParents.map((parent) => (
              <ParentCard
                key={parent.id}
                parent={parent}
                selected={selectedIds.includes(parent.id)}
                onSelect={() => toggleSelected(parent.id)}
                menu={menu}
                setMenu={setMenu}
                onView={() => { setModal({ type: 'view', parent }); setMenu(''); }}
                onManageStudents={() => openManageStudents(parent)}
                onDelete={() => requestParentDeletion(parent)}
                onCopy={(value, id) => copyContact(value, id)}
                copied={copied}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>
              Showing {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
              {'–'}{Math.min(pagination.page * pagination.limit, pagination.total)}
              {' '}of {pagination.total} parent records
            </span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft size={14} />Previous</button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button type="button" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next<ChevronRight size={14} /></button>
            </div>
          </div>
        </section>
      </div>

      {modal?.type === 'create' && (
        <ParentFormModal
          form={form}
          setForm={setForm}
          error={formError}
          saving={saving}
          onClose={() => setModal(null)}
          onSubmit={saveParent}
        />
      )}
      {modal?.type === 'view' && (
        <ParentDetailsModal
          parent={modal.parent}
          onClose={() => setModal(null)}
          onCopy={copyContact}
          copied={copied}
        />
      )}
      {modal?.type === 'manage-students' && (
        <ManageStudentsModal
          parent={modal.parent}
          onClose={() => setModal(null)}
          onRelationshipsChange={(studentRelationships) =>
            updateParentRelationships(modal.parent.id, studentRelationships)
          }
        />
      )}
      {modal?.type === 'import' && (
        <ImportModal
          onClose={() => {
            if (!importLoading) setModal(null);
          }}
          onDownloadTemplate={downloadTemplateFromModal}
          onChooseFile={() => importInputRef.current?.click()}
          loading={importLoading}
          error={importError}
          result={importResult}
        />
      )}
      {parentToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-parent-title"
            aria-describedby="delete-parent-description"
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="bg-gradient-to-br from-rose-700 to-red-600 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <AlertTriangle size={24} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-100">Permanent account deletion</p>
                  <h2 id="delete-parent-title" className="mt-1 text-xl font-extrabold">Delete this parent account?</h2>
                </div>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <p id="delete-parent-description" className="text-sm leading-6 text-slate-700">
                You are about to permanently delete <strong>{parentToDelete.firstName} {parentToDelete.surName}</strong> and their user account. This cannot be undone.
              </p>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-bold text-rose-900">What will happen</p>
                <ul className="mt-2 space-y-2 text-sm leading-5 text-rose-800">
                  <li className="flex gap-2"><span aria-hidden="true">•</span><span>The parent account and access will be permanently removed.</span></li>
                  <li className="flex gap-2"><span aria-hidden="true">•</span><span>All {parentToDelete.studentRelationships?.length ?? parentToDelete.childrenCount ?? 0} student relationship{(parentToDelete.studentRelationships?.length ?? parentToDelete.childrenCount ?? 0) === 1 ? '' : 's'} for this parent will be removed.</span></li>
                  <li className="flex gap-2"><span aria-hidden="true">•</span><span>The affected student accounts and student records will remain unchanged.</span></li>
                </ul>
              </div>
              {deleteError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{deleteError}</p>}
              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deletingParent}
                  onClick={() => { setParentToDelete(null); setDeleteError(''); }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keep parent
                </button>
                <button
                  type="button"
                  disabled={deletingParent}
                  onClick={confirmParentDeletion}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingParent ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {deletingParent ? 'Deleting parent…' : 'Permanently delete'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function ParentRow({ parent, selected, onSelect, menu, setMenu, onView, onManageStudents, onDelete, onCopy, copied }) {
  const children = parent.studentRelationships ?? [];
  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <input type="checkbox" aria-label={`Select ${parent.firstName} ${parent.surName}`} checked={selected} onChange={onSelect} className="h-4 w-4 rounded border-slate-300 accent-[#0A2463]" />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar parent={parent} />
          <div className="min-w-0">
            <button type="button" onClick={onView} className="text-left font-semibold text-slate-800 hover:text-[#0A2463]">{parent.firstName} {parent.surName}</button>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400">{parent.loginId || parent.id}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <button type="button" onClick={() => onCopy(parent.phoneNumber, `phone-${parent.id}`)} className="group flex items-center gap-1.5 text-sm text-slate-700 hover:text-[#0A2463]">
          <Phone size={13} className="text-slate-400" /> {parent.phoneNumber}
          {copied === `phone-${parent.id}` && <Check size={13} className="text-emerald-600" />}
        </button>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Mail size={12} className="text-slate-400" />{parent.email || 'No email provided'}</p>
      </td>
      <td className="px-5 py-4">
        {children.length ? (
          <div className="space-y-1">
            {children.slice(0, 2).map(({ student, studentId }) => <p key={studentId} className="text-sm font-medium text-slate-700">{[student?.firstName, student?.surName].filter(Boolean).join(' ') || student?.admissionNumber || 'Student'}<span className="ml-1.5 text-xs font-normal text-slate-400">{student?.admissionNumber || ''}</span></p>)}
            {children.length > 2 && <p className="text-xs font-semibold text-[#0A2463]">+{children.length - 2} more</p>}
          </div>
        ) : <span className="text-sm text-slate-400">No students linked</span>}
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-wrap gap-1.5">{children.length ? children.map(({ studentId, relationship }) => <span key={studentId} className="rounded-full bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-800">{formatRelationship(relationship)}</span>) : <span className="text-sm text-slate-400">—</span>}</div>
      </td>
      <td className="px-5 py-4"><StatusBadge status={parent.status} /></td>
      <td className="px-5 py-4 text-right">
        <div className="relative inline-block text-left">
          <button type="button" onClick={() => setMenu(menu === parent.id ? '' : parent.id)} aria-label={`Actions for ${parent.firstName} ${parent.surName}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><MoreVertical size={18} /></button>
          {menu === parent.id && <ActionMenu parent={parent} onView={onView} onManageStudents={onManageStudents} onDelete={onDelete} onCopy={onCopy} />}
        </div>
      </td>
    </tr>
  );
}

function ParentCard({ parent, selected, onSelect, menu, setMenu, onView, onManageStudents, onDelete, onCopy, copied }) {
  const children = parent.studentRelationships ?? [];
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <input type="checkbox" aria-label={`Select ${parent.firstName} ${parent.surName}`} checked={selected} onChange={onSelect} className="h-4 w-4 shrink-0 rounded border-slate-300 accent-[#0A2463]" />
          <Avatar parent={parent} />
          <div className="min-w-0"><button type="button" onClick={onView} className="truncate text-left font-bold text-slate-800">{parent.firstName} {parent.surName}</button><p className="font-mono text-[11px] text-slate-400">{parent.loginId || parent.id}</p></div>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setMenu(menu === parent.id ? '' : parent.id)} aria-label="Parent actions" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><MoreVertical size={18} /></button>
          {menu === parent.id && <ActionMenu parent={parent} onView={onView} onManageStudents={onManageStudents} onDelete={onDelete} onCopy={onCopy} />}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2"><StatusBadge status={parent.status} /><span className="text-xs text-slate-500">Account {formatStatus(parent.userStatus)}</span></div>
      <div className="mt-4 grid grid-cols-1 gap-2 rounded-2xl bg-slate-50 p-3 text-sm">
        <p className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-slate-400" />{parent.phoneNumber}</p>
        <p className="flex items-center gap-2 break-all text-slate-600"><Mail size={14} className="text-slate-400" />{parent.email || 'No email provided'}</p>
      </div>
      <div className="mt-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Linked students</p>
        {children.length ? <div className="flex flex-wrap gap-2">{children.map(({ student, studentId, relationship }) => <span key={studentId} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">{[student?.firstName, student?.surName].filter(Boolean).join(' ') || student?.admissionNumber || 'Student'} · {formatRelationship(relationship)}</span>)}</div> : <p className="text-sm text-slate-400">No students linked</p>}
      </div>
      {copied === `phone-${parent.id}` && <p className="mt-2 text-xs text-emerald-700">Phone number copied.</p>}
    </article>
  );
}

function ActionMenu({ parent, onView, onManageStudents, onDelete, onCopy }) {
  return (
    <div className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
      <button type="button" onClick={onView} className={menuItem}><Eye size={15} /> View details</button>
      <button type="button" onClick={() => onCopy(parent.phoneNumber, `phone-${parent.id}`)} className={menuItem}><Copy size={15} /> Copy phone number</button>
      <button type="button" onClick={onManageStudents} className={menuItem}><Users size={15} /> Manage students</button>
      <div className="my-1 border-t border-slate-100" />
      <button type="button" onClick={onDelete} className={`${menuItem} text-rose-700 hover:bg-rose-50`}><Trash2 size={15} /> Permanently delete</button>
    </div>
  );
}

function ParentFormModal({ form, setForm, error, saving, onClose, onSubmit }) {
  const setField = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));
  return (
    <ModalShell
      title="Add parent or guardian"
      description="Create a parent account. The invitation will be sent to the required email address."
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required value={form.firstName} onChange={(value) => setField('firstName', value)} placeholder="e.g. Amina" />
          <Field label="Surname" required value={form.surName} onChange={(value) => setField('surName', value)} placeholder="e.g. Abubakar" />
          <Field label="Phone number" required type="tel" value={form.phoneNumber} onChange={(value) => setField('phoneNumber', value)} placeholder="+234 801 234 5678" />
          <Field label="Email address" required type="email" value={form.email} onChange={(value) => setField('email', value)} placeholder="parent@example.com" />
        </div>
        {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="submit" disabled={saving} className={`${primaryButton} disabled:cursor-not-allowed disabled:opacity-60`}>{saving && <Loader2 size={16} className="animate-spin" />}{saving ? 'Creating…' : <><Check size={16} />Add parent</>}</button>
        </div>
      </form>
    </ModalShell>
  );
}

function ManageStudentsModal({ parent, onClose, onRelationshipsChange }) {
  const [linkedStudents, setLinkedStudents] = useState(
    parent.studentRelationships ?? []
  );
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [studentPagination, setStudentPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [studentsRefreshKey, setStudentsRefreshKey] = useState(0);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState('');
  const [relationship, setRelationship] = useState('GUARDIAN');
  const [linkingStudentId, setLinkingStudentId] = useState('');
  const [unlinkingStudentId, setUnlinkingStudentId] = useState('');
  const [pendingUnlink, setPendingUnlink] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    let active = true;
    const request = window.setTimeout(() => {
      setStudentsLoading(true);
      setStudentsError('');
      getStudents({
        page: studentPage,
        limit: 20,
        search: studentSearch.trim(),
      })
        .then((response) => {
          const data = response?.data;
          if (!Array.isArray(data?.students) || !data.pagination) {
            throw new Error('The server returned an invalid student list.');
          }
          if (active) {
            setStudents(data.students);
            setStudentPagination({
              currentPage: Number(data.pagination.currentPage) || studentPage,
              totalPages: Number(data.pagination.totalPages) || 1,
            });
          }
        })
        .catch((error) => {
          if (active) {
            setStudentsError(
              error?.response?.data?.message ||
                error?.message ||
                'Unable to load students.'
            );
          }
        })
        .finally(() => {
          if (active) setStudentsLoading(false);
        });
    }, studentSearch ? 300 : 0);

    return () => {
      active = false;
      window.clearTimeout(request);
    };
  }, [studentPage, studentSearch, studentsRefreshKey]);

  const linkedStudentIds = new Set(
    linkedStudents.map((item) => item.studentId)
  );
  const availableStudents = students.filter(
    (student) => !linkedStudentIds.has(student.id)
  );

  const handleLinkStudent = async (student) => {
    setLinkingStudentId(student.id);
    setActionError('');
    setActionMessage('');
    try {
      const response = await linkStudentToParent({
        parentId: parent.id,
        studentId: student.id,
        relationship,
      });
      const linkedRelationship = response?.relationship;
      if (
        response?.success !== true ||
        !linkedRelationship?.id ||
        linkedRelationship.parentId !== parent.id ||
        linkedRelationship.studentId !== student.id
      ) {
        throw new Error(
          response?.message ||
            'The server did not confirm the parent-student link.'
        );
      }

      const nextRelationships = [
        ...linkedStudents.filter((item) => item.studentId !== student.id),
        {
          ...linkedRelationship,
          student: {
            id: student.id,
            admissionNumber: student.admissionNumber,
            firstName: student.firstName,
            surName: student.surName,
            currentClassId: student.currentClassId,
          },
        },
      ];
      setLinkedStudents(nextRelationships);
      onRelationshipsChange(nextRelationships);
      setActionMessage(response.message || 'Student linked successfully.');
    } catch (error) {
      setActionError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to link this student.'
      );
    } finally {
      setLinkingStudentId('');
    }
  };

  const handleUnlinkStudent = async () => {
    if (!pendingUnlink) return;
    setUnlinkingStudentId(pendingUnlink.studentId);
    setActionError('');
    setActionMessage('');
    try {
      const response = await unlinkStudentFromParent({
        parentId: parent.id,
        studentId: pendingUnlink.studentId,
      });
      if (
        response?.success !== true ||
        response?.unlinkedRelationship?.parentId !== parent.id ||
        response?.unlinkedRelationship?.studentId !== pendingUnlink.studentId
      ) {
        throw new Error(
          response?.message ||
            'The server did not confirm removal of this relationship.'
        );
      }

      const nextRelationships = linkedStudents.filter(
        (item) => item.studentId !== pendingUnlink.studentId
      );
      setLinkedStudents(nextRelationships);
      onRelationshipsChange(nextRelationships);
      setActionMessage(response.message || 'Student unlinked successfully.');
      setPendingUnlink(null);
    } catch (error) {
      setActionError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to unlink this student.'
      );
    } finally {
      setUnlinkingStudentId('');
    }
  };

  return (
    <>
      <ModalShell
        title="Manage students"
        description={`Manage student relationships for ${parent.firstName} ${parent.surName}.`}
        onClose={onClose}
        width="max-w-3xl"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <Avatar parent={parent} />
            <div className="min-w-0">
              <p className="font-semibold text-slate-800">
                {parent.firstName} {parent.surName}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {parent.email || parent.phoneNumber}
              </p>
            </div>
            <span className="ml-auto rounded-full bg-[#0A2463]/10 px-3 py-1 text-xs font-semibold text-[#0A2463]">
              {linkedStudents.length} linked
            </span>
          </div>

          <section>
            <SectionHeading
              title="Currently linked students"
              description="Unlinking removes only this parent-student connection. Neither account nor student record is deleted."
            />
            {linkedStudents.length ? (
              <div className="space-y-2">
                {linkedStudents.map((item) => {
                  const student = item.student;
                  const studentName =
                    [student?.firstName, student?.surName]
                      .filter(Boolean)
                      .join(' ') || 'Student';
                  return (
                    <div
                      key={item.studentId}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2463]/10 text-[#0A2463]">
                        <UserRound size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">
                          {studentName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {student?.admissionNumber ||
                            `Student ID: ${item.studentId}`}
                        </p>
                      </div>
                      <span className="w-fit rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                        {formatRelationship(item.relationship)}
                      </span>
                      <button
                        type="button"
                        disabled={Boolean(unlinkingStudentId) || Boolean(linkingStudentId)}
                        onClick={() => {
                          setActionError('');
                          setPendingUnlink(item);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Link2 size={14} className="rotate-45" />
                        Unlink
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <Users size={21} className="mx-auto text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  No students linked yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Use the student directory below to create a relationship.
                </p>
              </div>
            )}
          </section>

          <section className="border-t border-slate-200 pt-5">
            <SectionHeading
              title="Link another student"
              description="Search the live student directory and choose the parent's relationship to the student."
            />
            <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_12rem]">
              <label className="relative block">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={studentSearch}
                  onChange={(event) => {
                    setStudentSearch(event.target.value);
                    setStudentPage(1);
                    setActionError('');
                    setActionMessage('');
                  }}
                  placeholder="Search name or admission number"
                  aria-label="Search students to link"
                  className={`${inputClass} pl-9`}
                />
              </label>
              <label>
                <span className="sr-only">Relationship</span>
                <select
                  value={relationship}
                  onChange={(event) => setRelationship(event.target.value)}
                  aria-label="Relationship to student"
                  className={inputClass}
                >
                  {relationshipOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatRelationship(option)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {actionError && (
              <p
                role="alert"
                className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
              >
                {actionError}
              </p>
            )}
            {actionMessage && (
              <p
                role="status"
                className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
              >
                {actionMessage}
              </p>
            )}

            {studentsLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
                <Loader2 size={17} className="animate-spin text-[#0A2463]" />
                Loading students…
              </div>
            ) : studentsError ? (
              <div
                role="alert"
                className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              >
                <p>{studentsError}</p>
                <button
                  type="button"
                  onClick={() => setStudentsRefreshKey((current) => current + 1)}
                  className="mt-2 font-semibold underline"
                >
                  Retry loading students
                </button>
              </div>
            ) : availableStudents.length ? (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {availableStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2463]/10 text-[#0A2463]">
                      <UserRound size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">
                        {student.firstName} {student.surName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {student.admissionNumber}
                        {student.currentClass
                          ? ` · ${student.currentClass}${student.currentArm ? ` ${student.currentArm}` : ''}`
                          : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(linkingStudentId) || Boolean(unlinkingStudentId)}
                      onClick={() => handleLinkStudent(student)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0A2463] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#071A52] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {linkingStudentId === student.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Link2 size={14} />
                      )}
                      {linkingStudentId === student.id ? 'Linking…' : 'Link'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                {students.length
                  ? 'All students on this page are already linked to this parent.'
                  : 'No students match this search.'}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page {studentPagination.currentPage} of {studentPagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={studentPage <= 1 || studentsLoading}
                  onClick={() => setStudentPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={studentPage >= studentPagination.totalPages || studentsLoading}
                  onClick={() => setStudentPage((current) => current + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          <div className="flex justify-end border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className={secondaryButton}>
              Close
            </button>
          </div>
        </div>
      </ModalShell>
      {pendingUnlink && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="unlink-student-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertTriangle size={23} />
            </div>
            <h2
              id="unlink-student-title"
              className="mt-4 text-lg font-extrabold text-[#071A52]"
            >
              Unlink this student?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This will remove the relationship between{' '}
              <strong>
                {parent.firstName} {parent.surName}
              </strong>{' '}
              and{' '}
              <strong>
                {[pendingUnlink.student?.firstName, pendingUnlink.student?.surName]
                  .filter(Boolean)
                  .join(' ') ||
                  pendingUnlink.student?.admissionNumber ||
                  'this student'}
              </strong>
              . The parent account and student record will remain unchanged.
            </p>
            {actionError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
              >
                {actionError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={Boolean(unlinkingStudentId)}
                onClick={() => setPendingUnlink(null)}
                className={secondaryButton}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(unlinkingStudentId)}
                onClick={handleUnlinkStudent}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {unlinkingStudentId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Link2 size={16} className="rotate-45" />
                )}
                {unlinkingStudentId ? 'Unlinking…' : 'Unlink student'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function ParentDetailsModal({ parent, onClose, onCopy, copied }) {
  const children = parent.studentRelationships ?? [];
  return (
    <ModalShell title="Parent details" description="Contact information and linked students." onClose={onClose} width="max-w-3xl">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#0A2463]/5 to-cyan-50 p-4 sm:flex-row sm:items-center">
          <Avatar parent={parent} large />
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-[#071A52]">{parent.firstName} {parent.surName}</h3>
            <p className="mt-1 font-mono text-xs text-slate-500">{parent.loginId || parent.id} · Added {formatDate(parent.createdAt)}</p>
            <div className="mt-3 flex flex-wrap gap-2"><StatusBadge status={parent.status} /><span className="text-xs text-slate-500">Account {formatStatus(parent.userStatus)}</span></div>
          </div>
        </div>
        <section>
          <SectionHeading title="Contact details" description="Contact information recorded for this parent or guardian." />
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailBox icon={Phone} label="Primary phone" value={parent.phoneNumber} action={() => onCopy(parent.phoneNumber, `detail-phone-${parent.id}`)} copied={copied === `detail-phone-${parent.id}`} />
            <DetailBox icon={Mail} label="Email address" value={parent.email || 'Not provided'} action={parent.email ? () => onCopy(parent.email, `detail-email-${parent.id}`) : undefined} copied={copied === `detail-email-${parent.id}`} />
            <DetailBox icon={UserRound} label="Login ID" value={parent.loginId || 'Not available'} />
          </div>
        </section>
        <section className="border-t border-slate-200 pt-5">
          <SectionHeading title={`Linked students (${children.length})`} description="Each connection has its own relationship type." />
          {children.length ? <div className="space-y-2">{children.map(({ student, studentId, relationship, isPrimary, receivesNotifications }) => <div key={studentId} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2463]/10 text-[#0A2463]"><UserRound size={18} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-slate-800">{[student?.firstName, student?.surName].filter(Boolean).join(' ') || 'Student'}</p><p className="mt-0.5 text-xs text-slate-500">{student?.admissionNumber || 'Admission number unavailable'}</p><p className="mt-1 text-[11px] text-slate-400">{isPrimary ? 'Primary contact' : 'Additional contact'}{receivesNotifications ? ' · Receives notifications' : ''}</p></div><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{formatRelationship(relationship)}</span></div>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">No students are currently linked to this parent.</div>}
        </section>
        <div className="flex justify-end border-t border-slate-200 pt-4"><button type="button" onClick={onClose} className={secondaryButton}>Close</button></div>
      </div>
    </ModalShell>
  );
}

function ImportModal({
  onClose,
  onDownloadTemplate,
  onChooseFile,
  loading,
  error,
  result,
}) {
  const resultData = result?.data ?? {};
  const emailFailures = Array.isArray(resultData.emailFailures)
    ? resultData.emailFailures
    : [];

  return (
    <ModalShell
      title="Import parents from CSV or Excel"
      description="Create parent and guardian accounts in bulk using a CSV file or Excel workbook."
      onClose={onClose}
      width="max-w-3xl"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm">
            <Users size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-cyan-950">Bulk parent and guardian records</p>
            <p className="mt-1 text-sm leading-6 text-cyan-900">
              Import creates a parent account for each valid row and sends an
              invitation email. Student relationships can be managed after
              the parent accounts are created.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-[#071A52]">How file import works</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ImportStep number="1" title="Prepare" description="Fill in parent details using the CSV template." />
            <ImportStep number="2" title="Save the file" description="Save as .csv or .xlsx. Only the first Excel worksheet is imported." />
            <ImportStep number="3" title="Upload" description="Choose the completed CSV or Excel file to validate and import." />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#071A52]">Start with the parent template</p>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                Contains the exact required columns and two example records.
                Replace the sample details with real parent information before
                importing.
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-[#071A52]">Parent file columns</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your file must contain these exact column names in the first row.
            All columns are required for every parent:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['firstName', 'surName', 'phoneNumber', 'email'].map((field) => (
              <span
                key={field}
                className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
              >
                {field}
              </span>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-xs leading-5 text-emerald-800">
              <strong>Account invitations:</strong> imported parents receive an
              invitation email. Do not include passwords in the file.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <FileSpreadsheet size={17} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs leading-5 text-amber-800">
              <strong>CSV and .xlsx files are accepted.</strong> Excel
              workbooks are read from the first worksheet. Empty rows are
              ignored, and every non-empty row must pass validation before the
              file is submitted. Replace the examples in the template before
              importing.
            </p>
          </div>
        </div>

        {(loading || error || result) && (
          <div className="scroll-mb-6 space-y-3" aria-live="polite">
            {loading && (
              <div role="status" className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm font-semibold text-cyan-900">
                <Loader2 size={18} className="animate-spin" />
                Validating the file and importing parent accounts…
              </div>
            )}
            {error && (
              <p role="alert" className="whitespace-pre-line rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-5 text-rose-700">
                {error}
              </p>
            )}
            {result && (
              <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-bold">{result.message || 'Parent import completed.'}</p>
                <p className="mt-2">
                  Imported: {Number(resultData.totalImported) || 0}
                  {' · '}Invitation emails sent: {Number(resultData.emailsSent) || 0}
                  {' · '}Email failures: {Number(resultData.emailFailureCount) || emailFailures.length}
                </p>
                {emailFailures.length > 0 && (
                  <div className="mt-3 space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                    <p className="font-bold">Invitation email issues</p>
                    {emailFailures.map((failure, index) => (
                      <p key={`${String(failure?.email ?? failure?.parentId ?? failure)}-${index}`}>
                        {formatEmailFailure(failure)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0A2463] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
              {loading ? 'Importing…' : result ? 'Import another file' : 'Choose CSV or Excel file'}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function downloadTemplateFromModal() {
  const csv = [
    'firstName,surName,phoneNumber,email',
    'Amina,Abubakar,+2348012345678,amina@example.com',
    'Musa,Ibrahim,+2348098765432,musa@example.com',
  ].join('\r\n');
  downloadFile(csv, 'scholanode-parent-import-template.csv', 'text/csv;charset=utf-8;');
}

function ImportStep({ number, title, description }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A2463] text-xs font-bold text-white">
        {number}
      </span>
      <p className="mt-3 text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function formatEmailFailure(failure) {
  if (typeof failure === 'string') return failure;
  if (!failure || typeof failure !== 'object') {
    return 'An invitation email could not be sent.';
  }
  return [
    failure.email || failure.parentEmail,
    failure.message || failure.error || failure.reason,
  ]
    .filter(Boolean)
    .join(': ') || 'An invitation email could not be sent.';
}

const parentImportHeaders = ['firstName', 'surName', 'phoneNumber', 'email'];
const parentImportEmailPattern =
  /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

async function parseParentImportFile(file, extension) {
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
    row.some((cell) => String(cell ?? '').trim() !== '')
  );
  if (headerRowIndex < 0) {
    throw new Error('The selected file is empty. Add the required column headers and parent records.');
  }

  const headers = rows[headerRowIndex].map((cell, index) => {
    const value = String(cell ?? '').trim();
    return index === 0 ? value.replace(/^\uFEFF/, '') : value;
  });
  const headerErrors = [];
  const headerIndexes = {};

  for (const header of parentImportHeaders) {
    const indexes = headers
      .map((value, index) => value === header ? index : -1)
      .filter((index) => index >= 0);
    if (indexes.length === 0) {
      headerErrors.push(`Missing required column "${header}".`);
    } else if (indexes.length > 1) {
      headerErrors.push(`Required column "${header}" appears more than once.`);
    } else {
      headerIndexes[header] = indexes[0];
    }
  }
  if (headerErrors.length) {
    throw new Error(headerErrors.join('\n'));
  }

  return rows
    .slice(headerRowIndex + 1)
    .map((row, index) => ({
      rowNumber: headerRowIndex + index + 2,
      row,
    }))
    .filter(({ row }) =>
      row.some((cell) => String(cell ?? '').trim() !== '')
    )
    .map(({ rowNumber, row }) => ({
      rowNumber,
      firstName: row[headerIndexes.firstName],
      surName: row[headerIndexes.surName],
      phoneNumber: row[headerIndexes.phoneNumber],
      email: row[headerIndexes.email],
    }));
}

function validateParentImportRecords(records) {
  const errors = [];
  const parents = [];

  if (records.length === 0) {
    errors.push('No parent records were found below the header row.');
  }

  records.forEach((record) => {
    const firstName = String(record.firstName ?? '').trim();
    const surName = String(record.surName ?? '').trim();
    const phoneNumber = String(record.phoneNumber ?? '').trim();
    const email = String(record.email ?? '').trim().toLowerCase();
    const rowErrors = [];

    if (firstName.length < 2 || firstName.length > 50) {
      rowErrors.push("firstName must be 2–50 characters");
    }
    if (surName.length < 2 || surName.length > 50) {
      rowErrors.push("surName must be 2–50 characters");
    }
    if (phoneNumber.length < 7 || phoneNumber.length > 20) {
      rowErrors.push('phoneNumber must be 7–20 characters');
    }
    if (email.length > 100 || !parentImportEmailPattern.test(email)) {
      rowErrors.push('email must be a valid email address of at most 100 characters');
    }

    if (rowErrors.length) {
      errors.push(`Row ${record.rowNumber}: ${rowErrors.join('; ')}.`);
    }
    parents.push({ firstName, surName, phoneNumber, email });
  });

  return { errors, parents };
}

function formatParentImportErrors(errors) {
  const visibleErrors = errors.slice(0, 20);
  const remainingCount = errors.length - visibleErrors.length;
  if (remainingCount > 0) {
    visibleErrors.push(`…and ${remainingCount} more validation issue${remainingCount === 1 ? '' : 's'}.`);
  }
  return visibleErrors.join('\n');
}

function SummaryCard({ icon: Icon, label, value, detail, highlight = false }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${highlight ? 'border-cyan-200 bg-gradient-to-br from-white to-cyan-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-tight text-[#071A52]">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${highlight ? 'bg-cyan-100 text-cyan-800' : 'bg-[#0A2463]/5 text-[#0A2463]'}`}><Icon size={20} /></span></div>
    </div>
  );
}

function Avatar({ parent, large = false }) {
  const initials = `${parent.firstName?.[0] ?? ''}${parent.surName?.[0] ?? ''}`.toUpperCase();
  return <div className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A2463]/10 to-cyan-100 font-bold text-[#0A2463] ${large ? 'h-16 w-16 text-lg' : 'h-11 w-11 text-sm'}`}>{initials || <Users size={18} />}</div>;
}

function StatusBadge({ status }) {
  const config = {
    ACTIVE: ['Active', 'border-emerald-100 bg-emerald-50 text-emerald-700'],
    INACTIVE: ['Inactive', 'border-slate-200 bg-slate-100 text-slate-600'],
    PENDING: ['Pending', 'border-amber-100 bg-amber-50 text-amber-700'],
  };
  const [label, className] = config[status] ?? [status, 'border-slate-200 bg-slate-50 text-slate-600'];
  const Icon = status === 'ACTIVE' ? CheckCircle2 : status === 'PENDING' ? Clock3 : UserRound;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}><Icon size={12} />{label}</span>;
}

function FilterSelect({ value, onChange, label, options, format = (option) => option }) {
  return <div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className={`${inputClass} min-w-40 appearance-none pr-9`}><option value="ALL">{label}</option>{options.filter((option) => option !== 'ALL').map((option) => <option key={option} value={option}>{format(option)}</option>)}</select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></div>;
}

function Field({ label, value, onChange, type = 'text', required = false, placeholder }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}{required && <span className="ml-1 text-rose-500">*</span>}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} className={inputClass} /></label>;
}

function SectionHeading({ title, description }) {
  return <div className="mb-3"><h3 className="text-sm font-bold text-[#071A52]">{title}</h3><p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p></div>;
}

function DetailBox({ icon: Icon, label, value, action, copied }) {
  return <div className="rounded-2xl border border-slate-200 p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p><div className="mt-1 flex items-center gap-2"><Icon size={14} className="shrink-0 text-slate-400" /><p className="min-w-0 flex-1 break-words text-sm font-semibold text-slate-700">{value}</p>{action && <button type="button" onClick={action} aria-label={`Copy ${label.toLowerCase()}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#0A2463]">{copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}</button>}</div></div>;
}

function DirectoryLoading() {
  return <div className="flex min-h-[220px] items-center justify-center gap-3 text-sm font-medium text-slate-500"><Loader2 size={20} className="animate-spin text-[#0A2463]" />Loading parent directory…</div>;
}

function EmptyState({ search, title, description, onAdd }) {
  return <div className="flex min-h-[250px] flex-col items-center justify-center px-5 py-10 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Users size={21} /></div><h3 className="mt-4 text-sm font-bold text-slate-700">{title || (search ? 'No matching parents' : 'No parent records found')}</h3><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{description || (search ? 'Try another name, contact detail, or filter.' : 'Add a parent or import contacts to start building the directory.')}</p>{onAdd && <button type="button" onClick={onAdd} className={`${primaryButton} mt-4`}><Plus size={15} />Add parent</button>}</div>;
}

function ModalShell({ title, description, onClose, children, width = 'max-w-xl' }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#071A52]/60 p-4 backdrop-blur-[2px]"><div className={`my-8 w-full overflow-hidden rounded-3xl bg-white shadow-2xl ${width}`}><div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-bold text-[#071A52]">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div><button type="button" onClick={onClose} aria-label="Close dialog" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div><div className="max-h-[calc(100vh-150px)] overflow-y-auto p-5 sm:p-6">{children}</div></div></div>;
}

function formatStatus(status) {
  return status ? `${status[0]}${status.slice(1).toLowerCase()}` : 'Unknown';
}

function formatRelationship(relationship) {
  return ({ FATHER: 'Father', MOTHER: 'Mother', GUARDIAN: 'Guardian', OTHER: 'Other' })[relationship] ?? relationship ?? 'Guardian';
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadFile(contents, fileName, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const thClass = 'px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400';
const menuItem = 'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50';
const inputClass = 'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0A2463] focus:ring-2 focus:ring-[#0A2463]/10';
const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50';
const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#071A52]';
