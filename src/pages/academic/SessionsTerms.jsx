import { useCallback, useEffect, useState } from 'react';
import { Archive, ArrowLeft, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, CircleCheck, Clock3, Info, LoaderCircle, MoreVertical, Pencil, PlayCircle, Plus, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  activateAcademicSession,
  activateAcademicTerm,
  archiveAcademicSession,
  completeAcademicSession,
  completeAcademicTerm,
  getAcademicSessions,
  updateAcademicSession,
} from './sessionsTermsApi';
import { createAcademicSession } from './academicSetupApi';


const blankForm = () => ({ sessionName: '', startDate: '', endDate: '', terms: ['FIRST_TERM', 'SECOND_TERM', 'THIRD_TERM'].map((termName) => ({ termName, startDate: '', endDate: '' })) });

export default function SessionsTerms() {
  const [sessions, setSessions] = useState([]);
  const [expandedSession, setExpandedSession] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionKey, setActionKey] = useState('');
  const [completionConfirmation, setCompletionConfirmation] = useState(null);

  const refreshSessions = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setLoadError('');
    try {
      const loadedSessions = normalizeSessions(await getAcademicSessions());
      setSessions(loadedSessions);
      setExpandedSession(null);
      return loadedSessions;
    } catch (error) {
      setLoadError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to load academic sessions and terms.',
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => {
      refreshSessions(true).catch((error) => {
        console.error('Initial academic sessions load failed:', error);
      });
    }, 0);

    return () => window.clearTimeout(request);
  }, [refreshSessions]);

  const activeSession = sessions.find((session) => session.status === 'ACTIVE');
  const activeTerm = activeSession?.terms.find((term) => term.status === 'ACTIVE');
  const completedCount = sessions.filter((session) => session.status === 'COMPLETED').length;
  const upcomingCount = sessions.filter((session) => session.status === 'UPCOMING').length;

  const firstUpcomingSession = sessions
    .filter((session) => session.status === 'UPCOMING' && Number.isFinite(Date.parse(session.createdAt)))
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))[0];

  const performAction = async (key, action, successText) => {
    if (actionKey) return;
    setActionKey(key);
    setLoadError('');
    setSuccessMessage('');
    try {
      await action();
      setSuccessMessage(successText);
      setOpenMenu(null);
      try {
        await refreshSessions();
      } catch (refreshError) {
        console.error('Academic action succeeded, but refreshing sessions failed:', refreshError);
      }
    } catch (error) {
      setLoadError(
        error?.response?.data?.message ||
          error?.message ||
          'The requested session update failed.',
      );
    } finally {
      setActionKey('');
    }
  };

  const confirmCompletion = async () => {
    if (!completionConfirmation || actionKey) return;

    const confirmation = completionConfirmation;
    await performAction(
      confirmation.actionKey,
      confirmation.action,
      confirmation.successText,
    );
    setCompletionConfirmation(null);
  };

  const saveSession = async (form) => {
    setSaving(true);
    setSaveError('');
    setSuccessMessage('');
    let nextSuccessMessage;
    try {
      if (editingSession) {
        await updateAcademicSession(
          editingSession.id,
          {
            sessionName: form.sessionName.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
          },
          form.terms,
        );
        nextSuccessMessage = 'Academic session updated successfully.';
      } else {
        const response = await createAcademicSession(
          {
            sessionName: form.sessionName.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
          },
          form.terms,
        );
        nextSuccessMessage =
          responseMessage(response) || `${form.sessionName.trim()} was created successfully.`;
      }
    } catch (error) {
      setSaveError(
        error?.response?.data?.message ||
          error?.message ||
          `Unable to ${editingSession ? 'update' : 'create'} the academic session.`,
      );
      return;
    } finally {
      setSaving(false);
    }

    setSuccessMessage(nextSuccessMessage);
    setShowCreateModal(false);
    setEditingSession(null);
    try {
      await refreshSessions();
    } catch (refreshError) {
      console.error('Academic session saved, but refreshing sessions failed:', refreshError);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <Link to="/academic-setup" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#071A52]"><ArrowLeft size={17} /> Back to academic setup</Link>
        <header className="mt-7 border-b border-slate-200 pb-7"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">Academic management</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#071A52] sm:text-4xl">Sessions & terms</h1><p className="mt-3 max-w-2xl leading-7 text-slate-500">Keep your school calendar clear, current and easy for your team to understand.</p></div>

        <button type="button" onClick={() => { setEditingSession(null); setSaveError(''); setShowCreateModal(true); }} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#0A2463]"><Plus size={18} /> Create session
        </button>
        
        </div>{!activeSession && sessions.length > 0 && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-cyan-900"><Info size={19} className="mt-0.5 shrink-0 text-cyan-600" /><div><p className="text-sm font-bold">No active academic session</p><p className="mt-1 text-sm leading-6 text-cyan-800">Activate an upcoming session when your school is ready to begin using it.</p></div></div>}</header>

        {successMessage && <div role="status" className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} />{successMessage}</div>}
        {loadError && <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError}</div>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard icon={CalendarDays} label="Total sessions" value={sessions.length} /><SummaryCard icon={PlayCircle} label="Active session" value={activeSession?.sessionName || 'None'} highlight={Boolean(activeSession)} /><SummaryCard icon={Clock3} label="Active term" value={activeTerm ? formatTerm(activeTerm.termName) : 'None'} highlight={Boolean(activeTerm)} /><SummaryCard icon={CircleCheck} label="Completed" value={completedCount} detail={`${upcomingCount} upcoming`} /></div>

        {loading ? <div className="mt-8 flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-10 text-sm font-semibold text-slate-500"><LoaderCircle size={20} className="animate-spin text-cyan-600" />Loading sessions and terms…</div> : <section className="mt-8 space-y-5">{sessions.map((session) => <SessionCard key={session.id} session={session} activeSession={activeSession} activeTerm={activeTerm} expanded={expandedSession === session.id} canActivate={!activeSession && session.id === firstUpcomingSession?.id} actionKey={actionKey} onToggle={() => setExpandedSession((current) => current === session.id ? null : session.id)} onMakeActive={() => performAction(`session-activate-${session.id}`, () => activateAcademicSession(session.id), `${session.sessionName} is now active.`)} onComplete={() => setCompletionConfirmation({ title: 'Complete academic session?', itemName: session.sessionName, description: `This will mark the ${session.sessionName} session and its remaining terms as completed. Only continue if the school year has ended.`, actionKey: `session-complete-${session.id}`, action: () => completeAcademicSession(session.id), successText: `${session.sessionName} was completed.` })} onMakeTermActive={(sessionId, termId) => performAction(`term-activate-${termId}`, () => activateAcademicTerm(sessionId, termId), 'Academic term activated successfully.')} onCompleteTerm={(sessionId, termId, termName) => setCompletionConfirmation({ title: 'Complete academic term?', itemName: formatTerm(termName), description: `This will mark ${formatTerm(termName)} in the ${session.sessionName} session as completed. `, actionKey: `term-complete-${termId}`, action: () => completeAcademicTerm(session.id, termId), successText: `${formatTerm(termName)} was completed.` })} onEdit={() => { setSaveError(''); setEditingSession(session); setOpenMenu(null); }} onArchive={() => performAction(`session-archive-${session.id}`, () => archiveAcademicSession(session.id), `${session.sessionName} was archived.`)} openMenu={openMenu === session.id} onMenu={() => setOpenMenu((current) => current === session.id ? null : session.id)} />)}</section>}

        {!loading && sessions.length === 0 && <EmptyState onCreate={() => { setSaveError(''); setShowCreateModal(true); }} />}
      </div>

      {(showCreateModal || editingSession) && <SessionModal initialSession={editingSession} onClose={() => { if (!saving) { setShowCreateModal(false); setEditingSession(null); setSaveError(''); } }} onSave={saveSession} saving={saving} requestError={saveError} />}
      {completionConfirmation && (
        <CompletionConfirmationModal
          title={completionConfirmation.title}
          itemName={completionConfirmation.itemName}
          description={completionConfirmation.description}
          busy={actionKey === completionConfirmation.actionKey}
          onCancel={() => {
            if (!actionKey) setCompletionConfirmation(null);
          }}
          onConfirm={confirmCompletion}
        />
      )}
    </main>
  );
}

function SessionCard({
  session,
  activeSession,
  activeTerm,
  expanded,
  canActivate,
  actionKey,
  onToggle,
  onMakeActive,
  onComplete,
  onMakeTermActive,
  onCompleteTerm,
  onEdit,
  onArchive,
  openMenu,
  onMenu,
}) {
  const sessionHasActiveTerm = session.terms.some((term) => term.status === 'ACTIVE');
  const isBusy = actionKey.startsWith(`session-${session.id}-`);

  return (
    <article className={`overflow-visible rounded-3xl border bg-white shadow-sm transition ${session.status === 'ACTIVE' ? 'border-emerald-200 shadow-emerald-100/50' : 'border-slate-200'}`}>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${session.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : session.status === 'COMPLETED' ? 'bg-slate-100 text-slate-500' : 'bg-sky-50 text-[#071A52]'}`}>
              {session.status === 'ACTIVE' ? <PlayCircle size={23} /> : session.status === 'COMPLETED' ? <CheckCircle2 size={23} /> : <CalendarDays size={23} />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-[#071A52]">{session.sessionName}</h2>
                <StatusBadge status={session.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">{formatDate(session.startDate)} - {formatDate(session.endDate)}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">
                {session.terms.length} terms · {session.status === 'UPCOMING' ? canActivate ? 'First created session eligible to activate' : 'Waiting for earlier session' : session.status === 'ACTIVE' && !sessionHasActiveTerm ? 'Choose an active term' : session.status === 'ACTIVE' ? 'Currently in use' : 'Historical record'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SessionAction
              session={session}
              activeSession={activeSession}
              canActivate={canActivate}
              busy={isBusy}
              onMakeActive={onMakeActive}
              onComplete={onComplete}
            />
            <button type="button" onClick={onToggle} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#071A52] transition hover:border-cyan-300 hover:text-cyan-700">
              {expanded ? 'Hide terms' : 'Show terms'}{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <div className="relative">
              <button type="button" onClick={onMenu} aria-label={`Actions for ${session.sessionName}`} className="rounded-2xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#071A52]">
                <MoreVertical size={18} />
              </button>
              {openMenu && (
                <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button type="button" onClick={onEdit} disabled={Boolean(actionKey)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    <Pencil size={16} /> Edit session
                  </button>
                  {session.status !== 'ACTIVE' && (
                    <button type="button" onClick={onArchive} disabled={Boolean(actionKey)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                      {actionKey === `session-archive-${session.id}` ? <LoaderCircle size={16} className="animate-spin" /> : <Archive size={16} />}
                      Archive session
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
          <div className="mb-5">
            <h3 className="font-extrabold text-[#071A52]">Academic terms</h3>
            <p className="mt-1 text-sm text-slate-500">Manage the terms within the {session.sessionName} session.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {session.terms.map((term) => (
              <TermCard
                key={term.id}
                term={term}
                session={session}
                activeTerm={activeTerm}
                actionKey={actionKey}
                onMakeActive={() => onMakeTermActive(session.id, term.id)}
                onComplete={() => onCompleteTerm(session.id, term.id, term.termName)}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function SessionAction({ session, activeSession, canActivate, busy, onMakeActive, onComplete }) {
  if (session.status === 'UPCOMING' && canActivate && !activeSession) {
    return (
      <button type="button" onClick={onMakeActive} disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
        {busy ? <LoaderCircle size={16} className="animate-spin" /> : <PlayCircle size={16} />}
        {busy ? 'Activating…' : 'Make active'}
      </button>
    );
  }
  if (session.status === 'UPCOMING') {
    return <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-400"><Clock3 size={16} /> Waiting</span>;
  }
  if (session.status === 'ACTIVE') {
    return (
      <button type="button" onClick={onComplete} disabled={busy} className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60">
        {busy ? <LoaderCircle size={16} className="animate-spin" /> : <CircleCheck size={16} />}
        {busy ? 'Completing…' : 'Complete'}
      </button>
    );
  }
  return null;
}

function TermCard({ term, session, activeTerm, actionKey, onMakeActive, onComplete }) {
  const canMakeActive = session.status === 'ACTIVE' && term.status === 'UPCOMING' && !activeTerm;
  const isBusy =
    actionKey.startsWith(`term-activate-${term.id}`) ||
    actionKey.startsWith(`term-complete-${term.id}`);

  return (
    <div className={`rounded-2xl border bg-white p-4 ${term.status === 'ACTIVE' ? 'border-emerald-200 shadow-sm' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-extrabold text-[#071A52]">{formatTerm(term.termName)}</p>
          <p className="mt-1 text-xs text-slate-400">Academic term</p>
        </div>
        <StatusBadge status={term.status} />
      </div>
      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between gap-3"><span className="text-slate-400">Start</span><span className="font-semibold text-slate-700">{formatDate(term.startDate)}</span></div>
        <div className="flex justify-between gap-3"><span className="text-slate-400">End</span><span className="font-semibold text-slate-700">{formatDate(term.endDate)}</span></div>
      </div>
      {canMakeActive && (
        <button type="button" onClick={onMakeActive} disabled={isBusy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
          {isBusy ? <LoaderCircle size={16} className="animate-spin" /> : <PlayCircle size={16} />}
          {isBusy ? 'Activating…' : 'Make active'}
        </button>
      )}
      {session.status === 'ACTIVE' && term.status === 'UPCOMING' && activeTerm && (
        <div className="mt-5 rounded-xl bg-slate-50 px-3 py-2.5 text-center text-xs font-semibold text-slate-400">Complete the active term first</div>
      )}
      {term.status === 'ACTIVE' && (
        <button type="button" onClick={onComplete} disabled={isBusy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60">
          {isBusy ? <LoaderCircle size={16} className="animate-spin" /> : <CircleCheck size={16} />}
          {isBusy ? 'Completing…' : 'Complete term'}
        </button>
      )}
      {term.status === 'COMPLETED' && (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-400"><CheckCircle2 size={15} /> Term completed</div>
      )}
    </div>
  );
}

function CompletionConfirmationModal({
  title,
  itemName,
  description,
  busy,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-confirmation-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <Info size={23} />
        </div>
        <h2 id="completion-confirmation-title" className="mt-5 text-xl font-extrabold text-[#071A52]">
          {title}
        </h2>
        <p className="mt-2 font-bold text-slate-700">{itemName}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-wait disabled:opacity-70"
          >
            {busy && <LoaderCircle size={16} className="animate-spin" />}
            {busy ? 'Completing…' : 'Yes, complete'}
          </button>
        </div>
      </section>
    </div>
  );
}

function SessionModal({ initialSession, onClose, onSave, saving, requestError }) {
  const [form, setForm] = useState(() =>
    initialSession
      ? {
        sessionName: initialSession.sessionName,
        startDate: dateInputValue(initialSession.startDate),
        endDate: dateInputValue(initialSession.endDate),
        terms: initialSession.terms.map(({ termName, startDate, endDate }) => ({
          termName,
          startDate: dateInputValue(startDate),
          endDate: dateInputValue(endDate),
        })),
      }
      : blankForm(),
  );
  const [validationError, setValidationError] = useState('');

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updateTerm = (index, key, value) =>
    setForm((current) => ({
      ...current,
      terms: current.terms.map((term, termIndex) =>
        termIndex === index ? { ...term, [key]: value } : term,
      ),
    }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.sessionName.trim()) {
      setValidationError('Enter a name for this academic session.');
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setValidationError('Session end date must be after the start date.');
      return;
    }
    if (
      form.terms.some(
        (term) =>
          !term.startDate ||
          !term.endDate ||
          new Date(term.startDate) >= new Date(term.endDate),
      )
    ) {
      setValidationError('Each term needs a valid start and end date.');
      return;
    }
    setValidationError('');
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A52]/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
              {initialSession ? 'Edit calendar' : 'New calendar'}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">
              {initialSession ? 'Edit academic session' : 'Create academic session'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Set a clear date range for the session and its three terms.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close session form"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {(validationError || requestError) && (
          <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {requestError || validationError}
          </p>
        )}

        <form onSubmit={submit} className="space-y-6">
          <Field
            label="Session name"
            value={form.sessionName}
            onChange={(value) => update('sessionName', value)}
            placeholder="e.g. 2027/2028"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Session start" type="date" value={form.startDate} onChange={(value) => update('startDate', value)} required />
            <Field label="Session end" type="date" value={form.endDate} onChange={(value) => update('endDate', value)} required />
          </div>
          <div>
            <h3 className="font-extrabold text-[#071A52]">Terms</h3>
            <p className="mt-1 text-sm text-slate-500">Each term starts as upcoming.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {form.terms.map((term, index) => (
                <div key={term.termName} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <p className="font-bold text-[#071A52]">{formatTerm(term.termName)}</p>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">Upcoming</span>
                  </div>
                  <Field label="Start" type="date" value={term.startDate} onChange={(value) => updateTerm(index, 'startDate', value)} required />
                  <div className="mt-3">
                    <Field label="End" type="date" value={term.endDate} onChange={(value) => updateTerm(index, 'endDate', value)} required />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70"
            >
              {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Creating session…' : initialSession ? 'Save changes' : 'Create session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, detail, highlight = false }) { return <div className={`rounded-3xl border bg-white p-5 shadow-sm ${highlight ? 'border-emerald-200' : 'border-slate-200'}`}><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${highlight ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-[#071A52]'}`}><Icon size={19} /></div><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-1 truncate font-extrabold ${highlight ? 'text-emerald-700' : 'text-[#071A52]'}`}>{value}</p>{detail && <p className="mt-0.5 text-xs text-slate-400">{detail}</p>}</div></div></div>; }
function StatusBadge({ status }) { if (status === 'ACTIVE') return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active</span>; if (status === 'COMPLETED') return <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500"><CheckCircle2 size={13} /> Completed</span>; return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"><Clock3 size={13} /> Upcoming</span>; }
function EmptyState({ onCreate }) { return <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-[#071A52]"><CalendarDays size={30} /></div><h2 className="mt-5 text-xl font-extrabold text-[#071A52]">No academic sessions yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Create your first academic session and define its three terms.</p><button type="button" onClick={onCreate} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 font-bold text-white"><Plus size={18} /> Create session</button></div>; }
function Field({ label, value, onChange, type = 'text', placeholder, required = false }) { return <div><label className="mb-2 block text-xs font-bold text-slate-600">{label}</label><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className={inputClass} /></div>; }
function formatTerm(term) { return `${term.replace('_TERM', '').replace('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())} Term`; }
function formatDate(date) { if (!date) return '-'; return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10';

function normalizeSessions(response) {
  const payload =
    response?.data?.data?.sessions ??
    response?.data?.sessions ??
    response?.data?.data ??
    response?.data ??
    response;
  const sessions = Array.isArray(payload)
    ? payload
    : payload?.sessions ?? payload?.academicSessions ?? payload?.items;

  if (!Array.isArray(sessions)) {
    throw new Error('The sessions endpoint returned an invalid response.');
  }

  return sessions.map(normalizeSession);
}

function normalizeSession(session) {
  const sessionId = session.id ?? session._id ?? session.sessionId;
  if (sessionId === undefined || sessionId === null) {
    throw new Error('A session in the response is missing its ID.');
  }

  return {
    ...session,
    id: sessionId,
    status: (session.status || (session.isCurrent ? 'ACTIVE' : 'UPCOMING')).toUpperCase(),
    terms: Array.isArray(session.terms)
      ? session.terms.map((term) => {
          const termId = term.id ?? term._id ?? term.termId;
          if (termId === undefined || termId === null) {
            throw new Error(`A term in session ${session.sessionName || sessionId} is missing its ID.`);
          }
          return {
            ...term,
            id: termId,
            status: (term.status || (term.isCurrent ? 'ACTIVE' : 'UPCOMING')).toUpperCase(),
          };
        })
      : [],
  };
}

function responseMessage(response) {
  return (
    response?.message ||
    response?.data?.message ||
    response?.data?.data?.message ||
    ''
  );
}

function dateInputValue(value) {
  return value ? String(value).slice(0, 10) : '';
}
