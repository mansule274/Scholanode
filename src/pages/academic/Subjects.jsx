import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, CircleSlash2, Loader2, MoreVertical, Pencil, Plus, Power, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createAcademicSubjects } from './academicSetupApi';
import { activateSubject, deactivateSubject, getSubjects, updateSubject } from './subjectsApi';

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [menu, setMenu] = useState(null);
  const [subjectNames, setSubjectNames] = useState(['']);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [subjectActionId, setSubjectActionId] = useState('');
  const [subjectToDeactivate, setSubjectToDeactivate] = useState(null);

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      setSubjects(extractSubjects(await getSubjects()));
      return true;
    } catch (requestError) {
      setPageError(requestError?.response?.data?.message || 'Unable to load school subjects.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => loadSubjects(), 0);
    return () => window.clearTimeout(request);
  }, [loadSubjects]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return subjects.filter((subject) => !query || subject.subjectName.toLocaleLowerCase().includes(query));
  }, [subjects, search]);
  const active = subjects.filter((subject) => subject.isActive).length;

  const openCreate = () => {
    setSubjectNames(['']);
    setFormError('');
    setModal({ type: 'create' });
  };

  const openEdit = (subject) => {
    setSubjectName(subject.subjectName);
    setFormError('');
    setModal({ type: 'edit', subject });
    setMenu(null);
  };

  const saveSubjects = async (event) => {
    event.preventDefault();
    const names = subjectNames.map((name) => name.trim());
    if (!names.length || names.some((name) => !name)) {
      setFormError('Enter a name for every subject or remove the empty field.');
      return;
    }

    const normalizedNames = names.map(normalizeName);
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      setFormError('Subject names must be unique, ignoring spaces and letter case.');
      return;
    }
    const existingNames = new Set(subjects.map((subject) => normalizeName(subject.subjectName)));
    if (names.some((name) => existingNames.has(normalizeName(name)))) {
      setFormError('One or more subject names already exist in the directory.');
      return;
    }

    setSaving(true);
    setFormError('');
    setNotice(null);
    try {
      await createAcademicSubjects({
        subjects: names.map((subjectName) => ({ subjectName })),
      });
      setModal(null);
      setSubjectNames(['']);
      const refreshed = await loadSubjects();
      if (refreshed) {
        setNotice({ type: 'success', message: `Successfully created ${names.length} subject${names.length === 1 ? '' : 's'}.` });
      } else {
        setNotice({ type: 'error', message: 'Subjects were created, but the list could not be refreshed. Retry loading the directory.' });
      }
    } catch (requestError) {
      setFormError(requestError?.response?.data?.message || 'Unable to create the subjects. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    const nextName = subjectName.trim();
    if (!nextName) {
      setFormError('Enter a subject name.');
      return;
    }
    const duplicate = subjects.some((subject) =>
      subject.id !== modal.subject.id && normalizeName(subject.subjectName) === normalizeName(nextName),
    );
    if (duplicate) {
      setFormError('A subject with this name already exists.');
      return;
    }
    if (!modal.subject.id) {
      setFormError('This subject is missing its ID, so it cannot be updated.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await updateSubject(modal.subject.id, nextName);
      setModal(null);
      const refreshed = await loadSubjects();
      setNotice(refreshed
        ? { type: 'success', message: 'Subject updated successfully.' }
        : { type: 'error', message: 'Subject was updated, but the directory could not be refreshed. Retry loading the directory.' });
    } catch (requestError) {
      setFormError(requestError?.response?.data?.message || 'Unable to update the subject. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (subject) => {
    setMenu(null);
    setNotice(null);
    if (!subject.id) {
      setNotice({ type: 'error', message: `This subject is missing its ID, so it cannot be ${subject.isActive ? 'deactivated' : 'activated'}.` });
      return;
    }
    if (!subject.isActive) {
      changeSubjectStatus(subject, true);
      return;
    }

    setSubjectToDeactivate(subject);
  };

  const changeSubjectStatus = async (subject, activate) => {
    setSubjectActionId(subject.id);
    setNotice(null);
    try {
      if (activate) {
        await activateSubject(subject.id);
      } else {
        await deactivateSubject(subject.id);
        setSubjectToDeactivate(null);
      }
      const refreshed = await loadSubjects();
      setNotice(refreshed
        ? { type: 'success', message: `Subject ${activate ? 'activated' : 'deactivated'} successfully.` }
        : { type: 'error', message: `Subject was ${activate ? 'activated' : 'deactivated'}, but the directory could not be refreshed. Retry loading the directory.` });
    } catch (requestError) {
      setNotice({ type: 'error', message: requestError?.response?.data?.message || `Unable to ${activate ? 'activate' : 'deactivate'} the subject. Please try again.` });
    } finally {
      setSubjectActionId('');
    }
  };

  const confirmDeactivate = () => {
    if (subjectToDeactivate) changeSubjectStatus(subjectToDeactivate, false);
  };

  const showCreateModal = modal?.type === 'create';
  const showEditModal = modal?.type === 'edit';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/academic-setup" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#071A52]"><ArrowLeft size={17} /> Back to academic setup</Link>

        <section className="relative mt-5 overflow-hidden rounded-3xl bg-linear-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-2xl sm:p-9">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-36 border-cyan-300/10" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium"><BookOpen size={17} /> Academic management</div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">School curriculum</p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Subjects</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-blue-100">Keep the subjects your school teaches organized, current and easy to scan.</p>
            </div>
            <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-[#071A52] hover:bg-cyan-300"><Plus size={18} /> Add subject</button>
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Summary label="Total subjects" value={subjects.length} icon={BookOpen} />
          <Summary label="Active subjects" value={active} icon={CheckCircle2} highlight />
          <Summary label="Inactive subjects" value={subjects.length - active} icon={CircleSlash2} />
        </div>

        {notice && (
          <div role="status" className={`mt-5 rounded-2xl border p-4 text-sm ${notice.type === 'error' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            <div className="flex items-start justify-between gap-3">
              <p>{notice.message}</p>
              <button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)} className="shrink-0 rounded-lg p-1 hover:bg-black/5"><X size={16} /></button>
            </div>
          </div>
        )}

        {pageError && (
          <div role="alert" className="mt-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{pageError}</span>
            <button type="button" onClick={loadSubjects} disabled={loading} className="shrink-0 font-bold underline disabled:opacity-50">{loading ? 'Loading…' : 'Retry'}</button>
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Subject directory</p>
              <h2 className="mt-1 text-xl font-extrabold text-[#071A52]">All subjects</h2>
              <p className="mt-1 text-sm text-slate-500">Deactivate a subject without losing its history.</p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subjects" className={`${inputClass} pl-10`} />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm font-semibold text-slate-500"><Loader2 size={20} className="animate-spin text-cyan-600" /> Loading subjects…</div>
          ) : filtered.length ? (
            <div className="divide-y divide-slate-100">
              {filtered.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${subject.isActive ? 'bg-sky-50 text-[#071A52]' : 'bg-slate-100 text-slate-400'}`}><BookOpen size={19} /></span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#071A52]">{subject.subjectName}</p>
                      <p className="mt-1 text-xs text-slate-400">School subject</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`hidden rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex ${subject.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{subject.isActive ? 'Active' : 'Inactive'}</span>
                    <div className="relative">
                      <button type="button" onClick={() => setMenu((current) => current === subject.id ? null : subject.id)} aria-label={`Actions for ${subject.subjectName}`} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-[#071A52]"><MoreVertical size={18} /></button>
                      {menu === subject.id && (
                        <div className="absolute right-0 top-10 z-20 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                          <button type="button" onClick={() => openEdit(subject)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={16} /> Edit subject</button>
                          <button type="button" onClick={() => toggle(subject)} disabled={subjectActionId === subject.id} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 ${subject.isActive ? 'text-amber-700' : 'text-emerald-700'}`}><Power size={16} /> {subjectActionId === subject.id ? 'Saving…' : subject.isActive ? 'Deactivate' : 'Reactivate'}</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <Search className="mx-auto text-slate-300" size={30} />
              <h3 className="mt-4 font-bold text-[#071A52]">{search ? 'No subjects found' : 'No subjects yet'}</h3>
              <p className="mt-1 text-sm text-slate-500">{search ? 'Try a different subject name.' : 'Add subjects to build your school curriculum list.'}</p>
            </div>
          )}

          <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
            <p className="text-xs text-slate-500">Showing <span className="font-bold text-slate-700">{filtered.length}</span> of <span className="font-bold text-slate-700">{subjects.length}</span> subjects</p>
          </div>
        </section>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-600"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-cyan-600" /><p>Subjects are kept as a central list. Deactivating one preserves historical academic records.</p></div>
      </div>

      {showCreateModal && (
        <SubjectModal
          type="create"
          names={subjectNames}
          onNamesChange={setSubjectNames}
          error={formError}
          saving={saving}
          onClose={() => { if (!saving) { setModal(null); setFormError(''); } }}
          onSave={saveSubjects}
        />
      )}
      {showEditModal && (
        <SubjectModal
          type="edit"
          value={subjectName}
          onChange={setSubjectName}
          error={formError}
          saving={saving}
          onClose={() => { if (!saving) { setModal(null); setFormError(''); } }}
          onSave={saveEdit}
        />
      )}
      {subjectToDeactivate && (
        <DeactivateSubjectModal
          subject={subjectToDeactivate}
          saving={subjectActionId === subjectToDeactivate.id}
          onCancel={() => { if (!subjectActionId) setSubjectToDeactivate(null); }}
          onConfirm={confirmDeactivate}
        />
      )}
    </main>
  );
}

function DeactivateSubjectModal({ subject, saving, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A52]/50 p-4 backdrop-blur-sm">
      <section role="alertdialog" aria-modal="true" aria-labelledby="deactivate-subject-title" aria-describedby="deactivate-subject-description" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><Power size={22} /></div>
        <h2 id="deactivate-subject-title" className="mt-5 text-2xl font-extrabold text-[#071A52]">Deactivate subject?</h2>
        <p id="deactivate-subject-description" className="mt-2 text-sm leading-6 text-slate-600">
          <span className="font-bold text-[#071A52]">{subject.subjectName}</span> will be marked inactive and unavailable for new academic use. Existing academic history will be preserved.
        </p>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-800">
          This action changes the subject&apos;s active status. Continue only if you intend to deactivate it.
        </div>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={saving} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 disabled:opacity-50">Keep subject active</button>
          <button type="button" onClick={onConfirm} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Deactivating…' : 'Deactivate subject'}
          </button>
        </div>
      </section>
    </div>
  );
}

function SubjectModal({ type, names = [], onNamesChange, value = '', onChange, error, saving = false, onClose, onSave }) {
  const updateName = (index, nextName) => {
    onNamesChange((current) => current.map((name, nameIndex) => nameIndex === index ? nextName : name));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A52]/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#071A52]"><BookOpen size={21} /></div>
            <h2 className="mt-4 text-2xl font-extrabold text-[#071A52]">{type === 'edit' ? 'Edit subject' : 'Add subjects'}</h2>
            <p className="mt-1 text-sm text-slate-500">{type === 'edit' ? 'Use the name your school community recognizes.' : 'Add one or more subjects to your school list.'}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close subject form" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"><X size={19} /></button>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800">{error}</p>}

        <form onSubmit={onSave} className="mt-7 space-y-4">
          {type === 'edit' ? (
            <div>
              <label htmlFor="subject-name" className="mb-2 block text-sm font-bold text-slate-700">Subject name</label>
              <input id="subject-name" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Enter subject name" autoFocus required className={inputClass} />
            </div>
          ) : (
            <>
              {names.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    {index === 0 && <label htmlFor="subject-name-0" className="mb-2 block text-sm font-bold text-slate-700">Subject names</label>}
                    <input id={`subject-name-${index}`} value={name} onChange={(event) => updateName(index, event.target.value)} placeholder="Enter subject name" autoFocus={index === 0} disabled={saving} className={inputClass} />
                  </div>
                  <button type="button" onClick={() => onNamesChange((current) => current.filter((_, nameIndex) => nameIndex !== index))} disabled={saving} aria-label={`Remove subject field ${index + 1}`} className="mt-1 rounded-xl p-3 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"><Trash2 size={18} /></button>
                </div>
              ))}
              <button type="button" onClick={() => onNamesChange((current) => [...current, ''])} disabled={saving} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-cyan-800 hover:bg-cyan-50 disabled:opacity-50"><Plus size={16} /> Add another subject</button>
            </>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 size={16} className="animate-spin" />}{saving ? 'Saving subjects…' : type === 'edit' ? 'Save changes' : 'Add subjects'}</button>
          </div>
        </form>
      </div>
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

function normalizeName(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

function extractSubjects(response) {
  const payload = response?.data?.data ?? response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  const records = Array.isArray(data.subjects) ? data.subjects : data.subject ? [data.subject] : [];

  return records
    .map((subject) => ({
      ...subject,
      id: subject.id ?? subject._id ?? subject.subjectId ?? '',
      subjectName: subject.subjectName ?? subject.name ?? '',
      isActive: subject.isActive ?? subject.active ?? String(subject.status || '').toLocaleLowerCase() === 'active',
    }))
    .filter((subject) => subject.subjectName);
}
