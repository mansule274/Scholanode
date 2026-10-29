import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createAcademicClass } from './academicSetupApi';
import { assignClassFormMaster, getClasses } from './classesApi';
import { getStaff } from '../people/staffApi';
import { armTemplates } from './classTemplates';

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState([]);
  const [menu, setMenu] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [classLevel, setClassLevel] = useState('');
  const [selectedArm, setSelectedArm] = useState('');
  const [customArm, setCustomArm] = useState('');
  const [useCustomArm, setUseCustomArm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [assignmentClass, setAssignmentClass] = useState(null);
  const [assignmentStaff, setAssignmentStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [selectedFormMasterId, setSelectedFormMasterId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadClasses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getClasses();
      setClasses(extractClasses(response));
      return true;
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load the school classes.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getClasses()
      .then((response) => {
        if (active) setClasses(extractClasses(response));
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || 'Unable to load the school classes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const levels = useMemo(() => {
    const uniqueLevels = new Map();
    classes.forEach((item) => {
      const level = item.classLevel?.trim();
      if (level && !uniqueLevels.has(normalizeName(level))) uniqueLevels.set(normalizeName(level), level);
    });
    return [...uniqueLevels.values()];
  }, [classes]);
  const grouped = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return Object.entries(
      classes.reduce((groups, item) => {
        (groups[item.classLevel] ||= []).push(item);
        return groups;
      }, {}),
    )
      .map(([level, items]) => [
        level,
        items.filter((item) =>
          `${item.classLevel} ${item.arm || 'ungrouped'} ${item.formMaster || ''}`
            .toLocaleLowerCase()
            .includes(query),
        ),
      ])
      .filter(([, items]) => items.length);
  }, [classes, search]);

  const assignedCount = classes.filter((item) => item.formMaster).length;
  const withoutMasterCount = classes.length - assignedCount;

  const openAddModal = () => {
    setClassLevel(levels[0] || '');
    setSelectedArm('');
    setCustomArm('');
    setUseCustomArm(false);
    setError('');
    setSuccessMessage('');
    setShowAddModal(true);
  };

  const submitClass = async (event) => {
    event.preventDefault();
    const arm = useCustomArm ? customArm.trim() : selectedArm || null;
    const normalizedLevel = normalizeName(classLevel);
    const normalizedArm = arm === null ? null : normalizeName(arm);
    if (!classLevel.trim()) {
      setError('Select a class level.');
      return;
    }
    if (useCustomArm && !arm) {
      setError('Enter a name for the custom arm or choose no arm.');
      return;
    }
    const duplicate = classes.some(
      (item) =>
        normalizeName(item.classLevel) === normalizedLevel &&
        (item.arm ? normalizedArm !== null && normalizeName(item.arm) === normalizedArm : normalizedArm === null),
    );
    if (duplicate) {
      setError(arm ? 'This class level and arm already exist.' : 'An ungrouped class already exists for this level.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createAcademicClass({ classLevel: classLevel.trim(), arm });
      setShowAddModal(false);
      if (await loadClasses()) {
        setSuccessMessage('Class added successfully.');
      } else {
        setError('Class was created, but the class directory could not be refreshed. Reload the page to see the latest data.');
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to add the class. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openAssignment = async (item) => {
    setAssignmentClass(item);
    setStaffError('');
    setAssignmentStaff([]);
    setSelectedFormMasterId('');
    setStaffLoading(true);
    try {
      const response = await getStaff();
      const availableStaff = extractStaff(response);
      setAssignmentStaff(availableStaff);
      setSelectedFormMasterId(
        availableStaff.some((member) => member.id === item.formMasterId)
          ? item.formMasterId
          : '',
      );
    } catch (requestError) {
      setStaffError(requestError?.response?.data?.message || 'Unable to load school staff for form-master assignment.');
    } finally {
      setStaffLoading(false);
    }
  };

  const submitFormMaster = async (event) => {
    event.preventDefault();
    if (!assignmentClass?.id) {
      setStaffError('This class record is missing its class ID, so a form master cannot be assigned.');
      return;
    }
    if (!selectedFormMasterId) {
      setStaffError('Select a staff member to assign as form master.');
      return;
    }

    setAssigning(true);
    setStaffError('');
    setError('');
    try {
      await assignClassFormMaster(assignmentClass.id, selectedFormMasterId);
      setAssignmentClass(null);
      if (await loadClasses()) {
        setSuccessMessage('Form master assigned successfully.');
      } else {
        setError('Form master was assigned, but the class directory could not be refreshed. Reload the page to see the latest data.');
      }
    } catch (requestError) {
      setStaffError(requestError?.response?.data?.message || 'Unable to assign this form master. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const suggestions = armSuggestionsFor(classLevel);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/academic-setup" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#071A52]">
          <ArrowLeft size={17} /> Back to academic setup
        </Link>
        <section className="relative mt-5 overflow-hidden rounded-3xl bg-linear-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-2xl sm:p-9">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-36 border-cyan-300/10" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
                <GraduationCap size={17} /> Academic management
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">School structure</p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Classes & arms</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-blue-100">Organize your class levels, arms and form masters in one clear workspace.</p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              disabled={!levels.length || loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-[#071A52] hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} /> Add class
            </button>
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Summary label="Total classes" value={classes.length} icon={GraduationCap} />
          <Summary label="Class levels" value={levels.length} icon={Users} />
          <Summary label="Form masters assigned" value={assignedCount} icon={UserRound} highlight={assignedCount > 0} />
          <Summary label="Without form master" value={withoutMasterCount} icon={AlertCircle} />
        </div>

        {successMessage && <p role="status" className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{successMessage}</p>}
        {error && !showAddModal && <div role="alert" className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>{error}</span><button type="button" onClick={loadClasses} className="shrink-0 font-bold underline">Retry</button></div>}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Class directory</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">Your class levels</h2>
          </div>
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search class, arm or form master" className={`${inputClass} pl-10`} />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-500">
            <Loader2 size={20} className="animate-spin text-cyan-600" /> Loading school classes…
          </div>
        ) : (
          <section className="mt-5 space-y-4">
            {grouped.map(([level, items]) => {
              const isExpanded = expanded.includes(level);
              return (
                <article key={level} className="overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <button type="button" onClick={() => setExpanded((current) => current.includes(level) ? current.filter((item) => item !== level) : [...current, level])} className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-slate-50 sm:p-6">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#071A52]"><GraduationCap size={23} /></span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-extrabold text-[#071A52]">{level}</h3>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{items.length} {items.length === 1 ? 'class' : 'classes'}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{items.filter((item) => item.formMaster).length} form masters assigned</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="grid gap-4 border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6 lg:grid-cols-2">
                      {items.map((item) => (
                        <ClassCard key={item.id ?? `${item.classLevel}|${item.arm || ''}`} item={item} menu={menu === (item.id ?? `${item.classLevel}|${item.arm || ''}`)} onMenu={() => { const key = item.id ?? `${item.classLevel}|${item.arm || ''}`; setMenu((current) => current === key ? null : key); }} onAssign={() => openAssignment(item)} />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {!loading && grouped.length === 0 && <EmptyState search={search} onCreate={openAddModal} hasConfiguredLevels={levels.length > 0} />}
      </div>

      {showAddModal && (
        <AddClassModal
          levels={levels}
          classLevel={classLevel}
          setClassLevel={setClassLevel}
          selectedArm={selectedArm}
          setSelectedArm={(arm) => { setSelectedArm(arm); setUseCustomArm(false); }}
          customArm={customArm}
          setCustomArm={setCustomArm}
          useCustomArm={useCustomArm}
          setUseCustomArm={setUseCustomArm}
          suggestions={suggestions}
          error={error}
          saving={saving}
          onClose={() => { if (!saving) { setShowAddModal(false); setError(''); } }}
          onSubmit={submitClass}
        />
      )}
      {assignmentClass && (
        <FormMasterModal
          classItem={assignmentClass}
          staff={assignmentStaff}
          loading={staffLoading}
          error={staffError}
          selectedId={selectedFormMasterId}
          onSelect={setSelectedFormMasterId}
          saving={assigning}
          onClose={() => { if (!assigning) setAssignmentClass(null); }}
          onSubmit={submitFormMaster}
        />
      )}
    </main>
  );
}

function ClassCard({ item, menu, onMenu, onAssign }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071A52] text-sm font-extrabold text-white">{item.arm ? item.arm.slice(0, 3) : <GraduationCap size={18} />}</span>
          <div>
            <h4 className="text-lg font-extrabold text-[#071A52]">{item.classLevel}{item.arm && <> <span className="text-slate-400">·</span> {item.arm}</>}</h4>
            <p className="mt-1 text-sm font-medium text-slate-500">{item.arm ? 'Class arm' : 'Ungrouped class'}</p>
          </div>
        </div>
        <div className="relative">
          <button type="button" onClick={onMenu} aria-label={`Class actions for ${item.classLevel}`} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-[#071A52]"><MoreVertical size={18} /></button>
          {menu && <div className="absolute right-0 top-10 z-20 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <button type="button" disabled title="The current academic API does not provide class editing." className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-400"><Pencil size={16} /> Edit (not available)</button>
            <button type="button" disabled title="The current academic API does not provide class archiving." className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-400"><Archive size={16} /> Archive (not available)</button>
          </div>}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Form master</p>
          {item.formMaster
            ? <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-700"><UserRound size={15} className="text-emerald-600" /> {item.formMaster}</p>
            : <p className="mt-1 text-sm font-semibold text-amber-700">Not assigned</p>}
        </div>
        <button type="button" onClick={onAssign} disabled={!item.id} title={!item.id ? 'This class record is missing its ID.' : undefined} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#071A52] transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:text-slate-400">
          {item.formMaster ? 'Change' : 'Assign'}
        </button>
      </div>
    </div>
  );
}

function FormMasterModal({ classItem, staff, loading, error, selectedId, onSelect, saving, onClose, onSubmit }) {
  const availableStaff = staff.filter((member) => member.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A52]/40 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Class management</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">{classItem.formMaster ? 'Change form master' : 'Assign form master'}</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a staff member for {classItem.classLevel}{classItem.arm ? ` · ${classItem.arm}` : ''}.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close form master assignment" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"><X size={19} /></button>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6">
          <label htmlFor="form-master" className="mb-2 block text-sm font-bold text-slate-700">School staff</label>
          <select id="form-master" value={selectedId} onChange={(event) => onSelect(event.target.value)} className={inputClass} required disabled={loading || availableStaff.length === 0}>
            <option value="">Select a staff member</option>
            {availableStaff.map((member) => <option key={member.id} value={member.id}>{member.name}{member.role ? ` · ${member.role}` : ''}</option>)}
          </select>
          <p className="mt-2 text-xs text-slate-500">{loading ? 'Loading active staff…' : availableStaff.length ? 'Only active staff accounts with the Staff role are available for assignment.' : 'No active staff accounts with the Staff role are available to assign.'}</p>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving || loading || !selectedId || availableStaff.length === 0} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {saving || loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {loading ? 'Loading staff…' : saving ? 'Saving assignment…' : classItem.formMaster ? 'Update form master' : 'Assign form master'}
          </button>
        </div>
      </form>
    </div>
  );
}

function AddClassModal({
  levels,
  classLevel,
  setClassLevel,
  selectedArm,
  setSelectedArm,
  customArm,
  setCustomArm,
  useCustomArm,
  setUseCustomArm,
  suggestions,
  error,
  saving,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A52]/40 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Class management</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">Add class</h2>
            <p className="mt-1 text-sm text-slate-500">Add an arm or an ungrouped class to a configured level.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close add class form" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"><X size={19} /></button>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="class-level" className="mb-2 block text-sm font-bold text-slate-700">Configured class level</label>
            <select id="class-level" value={classLevel} onChange={(event) => { setClassLevel(event.target.value); setSelectedArm(''); }} required className={inputClass}>
              {levels.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Arm</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((arm) => (
                <button key={arm} type="button" onClick={() => { setSelectedArm(selectedArm === arm ? '' : arm); setUseCustomArm(false); }} className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${selectedArm === arm && !useCustomArm ? 'border-cyan-400 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200'}`}>{arm}</button>
              ))}
              <button type="button" onClick={() => { setUseCustomArm(true); setSelectedArm(''); }} className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${useCustomArm ? 'border-cyan-400 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200'}`}>Custom</button>
              <button type="button" onClick={() => { setUseCustomArm(false); setSelectedArm(''); }} className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${!useCustomArm && !selectedArm ? 'border-cyan-400 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200'}`}>No arm</button>
            </div>
            {useCustomArm && <input value={customArm} onChange={(event) => setCustomArm(event.target.value)} placeholder="Enter a custom arm name" className={`${inputClass} mt-3`} autoFocus />}
            <p className="mt-2 text-xs leading-5 text-slate-500">Suggestions are optional. Choose Custom to enter a different arm name.</p>
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
            {saving && <Loader2 size={16} className="animate-spin" />}{saving ? 'Adding class…' : 'Add class'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Summary({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className={`rounded-3xl border bg-white p-5 shadow-sm ${highlight ? 'border-emerald-200' : 'border-slate-200'}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${highlight ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-[#071A52]'}`}><Icon size={19} /></span>
        <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-xl font-extrabold text-[#071A52]">{value}</p></div>
      </div>
    </div>
  );
}

function EmptyState({ search, onCreate, hasConfiguredLevels }) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-[#071A52]"><Search size={28} /></div>
      <h2 className="mt-5 text-xl font-extrabold text-[#071A52]">{search ? 'No classes found' : 'No classes yet'}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {search ? 'Try another level, arm or form master.' : hasConfiguredLevels ? 'Add a class arm to one of your configured levels.' : 'Complete the initial class setup in Academic Setup before adding classes.'}
      </p>
      {!search && hasConfiguredLevels && <button type="button" onClick={onCreate} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 font-bold text-white"><Plus size={18} /> Add class</button>}
      {!search && !hasConfiguredLevels && <Link to="/academic-setup" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 font-bold text-white"><Plus size={18} /> Initial class setup</Link>}
    </div>
  );
}

function normalizeName(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

function extractClasses(response) {
  const payload = response?.data?.data ?? response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  const records = Array.isArray(data.classes) ? data.classes : data.class ? [data.class] : [];
  return records.map((item) => {
    const formMaster = item.formMaster;
    const formMasterName =
      typeof formMaster === 'string'
        ? formMaster
        : [
            formMaster?.firstName,
            formMaster?.surName ?? formMaster?.lastName,
          ]
            .filter(Boolean)
            .join(' ') ||
          formMaster?.fullName ||
          formMaster?.name ||
          item.formMasterName ||
          '';

    return {
      ...item,
      id: item.id ?? item._id ?? item.classId,
      classLevel: item.classLevel || item.levelName || item.name || '',
      arm: item.arm || null,
      formMasterId:
        (typeof formMaster === 'object' ? formMaster?.id ?? formMaster?._id : '') ||
        item.formMasterId ||
        '',
      formMaster: formMasterName,
    };
  }).filter((item) => item.classLevel);
}

function extractStaff(response) {
  const members = Array.isArray(response?.staff) ? response.staff : [];
  return members
    .filter((member) => member.status === 'ACTIVE' && member.role === 'STAFF')
    .map((member) => ({
      id: member.id ?? member._id ?? member.staffId ?? '',
      name: [member.firstName, member.surName ?? member.lastName]
        .filter(Boolean)
        .join(' ')
        .trim(),
      role: member.role || '',
    }))
    .filter((member) => member.id && member.name);
}

function armSuggestionsFor(level) {
  return /^ss\b/i.test(level || '') ? [...armTemplates.GENERAL, ...armTemplates.SECONDARY_STREAMS] : armTemplates.GENERAL;
}
