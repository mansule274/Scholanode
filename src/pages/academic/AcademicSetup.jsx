import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Building2, CalendarDays, Check, Circle, Loader2, Plus, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createAcademicClass, createAcademicSession, createAcademicSubject, getAcademicProgress } from './academicApi';

const steps = [
  { key: 'sessions', number: '01', title: 'Sessions & terms', description: 'Set the academic calendar', icon: CalendarDays },
  { key: 'classes', number: '02', title: 'Classes & arms', description: 'Build your class structure', icon: Users },
  { key: 'subjects', number: '03', title: 'Subjects', description: 'Add what you teach', icon: BookOpen },
];

const emptyTerms = () => [
  { termName: 'FIRST_TERM', startDate: '', endDate: '' },
  { termName: 'SECOND_TERM', startDate: '', endDate: '' },
  { termName: 'THIRD_TERM', startDate: '', endDate: '' },
];

const initialProgress = { percentage: 0, sessions: [], classes: [], subjects: [], steps: { sessions: false, classes: false, subjects: false } };

export default function AcademicSetup() {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(initialProgress);
  const [activeStep, setActiveStep] = useState('sessions');
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sessionForm, setSessionForm] = useState({ sessionName: '', startDate: '', endDate: '', terms: emptyTerms() });
  const [classForm, setClassForm] = useState({ classLevel: '', arms: [''] });
  const [subjectName, setSubjectName] = useState('');

  const loadProgress = async () => {
    console.log('AcademicSetup: loadProgress started');
    setLoading(true);
    setError('');
    try {
      const response = await getAcademicProgress();
      console.log('Academic progress response:', response);
      const nextProgress = normalizeProgress(response);
      console.log('Academic progress normalized:', nextProgress);
      setProgressData(nextProgress);
      setActiveStep(getNextStep(nextProgress.steps));
      return nextProgress;
    } catch (requestError) {
      console.error('Academic progress request failed:', requestError?.response?.data || requestError);
      setError(requestError?.response?.data?.message || 'Unable to load academic setup progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const progressRequest = window.setTimeout(() => {
      console.log('AcademicSetup: starting scheduled progress load');
      loadProgress();
    }, 0);

    return () => window.clearTimeout(progressRequest);
  }, []);

  const sessions = progressData.sessions;
  const classes = progressData.classes;
  const subjects = progressData.subjects;
  const completed = progressData.steps;
  const setupComplete = completed.sessions && completed.classes && completed.subjects;
  const canOpen = (key) => key === 'sessions' || (key === 'classes' && completed.sessions) || (key === 'subjects' && completed.classes);

  const openModal = (type) => {
    setError('');
    if (type === 'session') setSessionForm({ sessionName: '', startDate: '', endDate: '', terms: emptyTerms() });
    if (type === 'class') setClassForm({ classLevel: '', arms: [''] });
    if (type === 'subject') setSubjectName('');
    setModal(type);
  };

  const handleCreateSession = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await createAcademicSession(
        { sessionName: sessionForm.sessionName, startDate: sessionForm.startDate, endDate: sessionForm.endDate },
        sessionForm.terms,
      );
      console.log('Academic session creation response:', response);
      setModal(null);
      const nextProgress = await loadProgress();
      setActiveStep(getNextStep(nextProgress.steps));
    } catch (requestError) {
      console.error('Academic session creation failed:', requestError?.response?.data || requestError);
      setError(requestError?.response?.data?.message || 'Unable to create the academic session.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateClass = async (event) => {
    event.preventDefault();
    const arms = classForm.arms.map((arm) => arm.trim()).filter(Boolean);
    if (!arms.length) {
      setError('Add at least one class arm.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const responses = [];
      for (const arm of arms) {
        const response = await createAcademicClass(classForm.classLevel.trim(), arm);
        console.log('Class creation response:', response);
        responses.push(response);
      }
      setModal(null);
      const nextProgress = await loadProgress();
      setActiveStep(getNextStep(nextProgress.steps));
    } catch (requestError) {
      console.error('Class creation failed:', requestError?.response?.data || requestError);
      setError(requestError?.response?.data?.message || 'Unable to create the class.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubject = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await createAcademicSubject(subjectName.trim());
      console.log('Subject creation response:', response);
      setModal(null);
      await loadProgress();
    } catch (requestError) {
      console.error('Subject creation failed:', requestError?.response?.data || requestError);
      setError(requestError?.response?.data?.message || 'Unable to create the subject.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  if (setupComplete) {
    return <CompleteState onNavigate={(path) => navigate(path, { replace: true })} />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#071A52]"><ArrowLeft size={17} /> Back to dashboard</Link>
        <section className="relative mt-5 overflow-hidden rounded-3xl bg-linear-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] text-white shadow-2xl shadow-[#071A52]/15">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-40 border-cyan-300/10" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="relative grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[1fr_260px] lg:items-center lg:px-12">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur"><Building2 size={17} /> School Registration</div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Academic configuration</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">Build the academic heart of your school.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">Set up your calendar, classes and subjects in a few focused steps so every part of ScholaNode starts with the right structure.</p>
            </div>
            <ProgressSummary percentage={progressData.percentage} completed={completed} />
          </div>
        </section>
        {error && <ErrorMessage message={error} onRetry={loadProgress} />}

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <nav className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-3 flex items-center gap-3 border-b border-slate-100 px-3 pb-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><Sparkles size={17} /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Your journey</p><p className="mt-0.5 text-sm font-bold text-[#071A52]">Three simple stages</p></div></div><div className="space-y-2">{steps.map(({ key, number, title, description, icon: Icon }) => <button key={key} type="button" disabled={!canOpen(key)} onClick={() => setActiveStep(key)} className={`group flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition ${activeStep === key ? 'bg-[#071A52] text-white shadow-lg shadow-[#071A52]/15' : canOpen(key) ? 'text-slate-700 hover:bg-slate-50' : 'cursor-not-allowed text-slate-300'}`}><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeStep === key ? 'bg-white/10 text-cyan-300' : completed[key] ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{completed[key] ? <Check size={18} /> : canOpen(key) ? <Icon size={18} /> : <Circle size={17} />}</span><span className="min-w-0"><span className={`block text-[10px] font-bold uppercase tracking-widest ${activeStep === key ? 'text-cyan-200' : 'text-slate-400'}`}>{number}</span><span className="mt-0.5 block text-sm font-bold">{title}</span><span className={`mt-0.5 block text-xs ${activeStep === key ? 'text-blue-100' : 'text-slate-400'}`}>{description}</span></span></button>)}</div><div className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-cyan-600" />Completed stages stay locked so your setup remains consistent.</div></nav>

          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Step {steps.findIndex((step) => step.key === activeStep) + 1} of 3</p><h2 className="mt-1 text-xl font-extrabold text-[#071A52] sm:text-2xl">{steps.find((step) => step.key === activeStep)?.title}</h2></div>{completed[activeStep] && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><Check size={14} /> Complete</span>}</div></div><div className="p-6 sm:p-8">{activeStep === 'sessions' && <SessionPanel sessions={sessions} completed={completed.sessions} onCreate={() => openModal('session')} onNext={() => setActiveStep('classes')} />}{activeStep === 'classes' && <ClassPanel classes={classes} completed={completed.classes} onCreate={() => openModal('class')} onNext={() => setActiveStep('subjects')} />}{activeStep === 'subjects' && <SubjectPanel subjects={subjects} completed={completed.subjects} onCreate={() => openModal('subject')} />}</div></section>
        </div>
      </div>

      {modal === 'session' && <Modal title="Create academic session" error={error} onClose={() => { setError(''); setModal(null); }}><form onSubmit={handleCreateSession} className="space-y-5"><TextInput label="Session name" value={sessionForm.sessionName} onChange={(value) => setSessionForm((current) => ({ ...current, sessionName: value }))} placeholder="e.g. 2026/2027" required /><div className="grid gap-4 sm:grid-cols-2"><TextInput label="Session start" type="date" value={sessionForm.startDate} onChange={(value) => setSessionForm((current) => ({ ...current, startDate: value }))} required /><TextInput label="Session end" type="date" value={sessionForm.endDate} onChange={(value) => setSessionForm((current) => ({ ...current, endDate: value }))} required /></div><div><h3 className="font-bold text-[#071A52]">Terms</h3><p className="mt-1 text-sm text-slate-500">Set dates for each term in this session.</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{sessionForm.terms.map((term, index) => <div key={term.termName} className="rounded-2xl bg-slate-50 p-3"><p className="mb-3 text-sm font-bold text-[#071A52]">{formatTerm(term.termName)}</p><TextInput label="Start" type="date" value={term.startDate} onChange={(value) => updateTerm(setSessionForm, index, 'startDate', value)} required /><div className="mt-3"><TextInput label="End" type="date" value={term.endDate} onChange={(value) => updateTerm(setSessionForm, index, 'endDate', value)} required /></div></div>)}</div></div><ModalActions onCancel={() => { setError(''); setModal(null); }} label="Create session" saving={saving} /></form></Modal>}
      {modal === 'class' && <Modal title="Create class" error={error} onClose={() => { setError(''); setModal(null); }}><form onSubmit={handleCreateClass} className="space-y-5"><TextInput label="Class level" value={classForm.classLevel} onChange={(value) => setClassForm((current) => ({ ...current, classLevel: value }))} placeholder="e.g. Primary 1" required /><div><div className="mb-3 flex items-center justify-between"><label className="text-sm font-bold text-slate-700">Arms</label><button type="button" onClick={() => setClassForm((current) => ({ ...current, arms: [...current.arms, ''] }))} className="text-sm font-bold text-cyan-700">+ Add arm</button></div><div className="space-y-3">{classForm.arms.map((arm, index) => <div key={index} className="flex gap-2"><input value={arm} onChange={(event) => setClassForm((current) => ({ ...current, arms: current.arms.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} placeholder={`Arm ${index + 1}`} required className={inputClass} />{classForm.arms.length > 1 && <button type="button" onClick={() => setClassForm((current) => ({ ...current, arms: current.arms.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-xl border border-slate-200 px-3 text-slate-400 hover:text-red-500"><X size={17} /></button>}</div>)}</div></div><ModalActions onCancel={() => { setError(''); setModal(null); }} label="Create class" saving={saving} /></form></Modal>}
      {modal === 'subject' && <Modal title="Add subject" error={error} onClose={() => { setError(''); setModal(null); }}><form onSubmit={handleCreateSubject} className="space-y-5"><TextInput label="Subject name" value={subjectName} onChange={setSubjectName} placeholder="e.g. Mathematics" required /><ModalActions onCancel={() => { setError(''); setModal(null); }} label="Add subject" saving={saving} /></form></Modal>}
    </main>
  );
}

function normalizeProgress(response) {
  console.log('Academic progress normalization started with:', response);
  const payload = response?.data?.data ?? response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  const backendSteps = data.steps || {};
  console.log("backendSteps:", backendSteps);
  const sessions = data.sessions || data.session ? (Array.isArray(data.sessions) ? data.sessions : data.session ? [data.session] : []) : [];
  const classes = Array.isArray(data.classes) ? data.classes : data.class ? [data.class] : [];
  const subjects = Array.isArray(data.subjects) ? data.subjects : data.subject ? [data.subject] : [];
  const percentage = Number(data.progress ?? data.percentage ?? data.completionPercentage ?? 0);
  const steps = {
    sessions: backendSteps.sessionsAndTerms === true,
    classes: backendSteps.classesAndArms === true,
    subjects: backendSteps.subjects === true,
  };
  return { percentage: Math.min(100, Math.max(0, percentage)), sessions, classes, subjects, steps };
}

function getNextStep(completed) {
  if (!completed.sessions) return 'sessions';
  if (!completed.classes) return 'classes';
  return 'subjects';
}

function LoadingState() { return <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50"><div className="flex items-center gap-3 text-sm font-semibold text-slate-500"><Loader2 className="animate-spin text-cyan-600" size={22} /> Loading academic setup...</div></main>; }
function CompleteState({ onNavigate }) { const destinations = [{ title: 'Sessions & terms', description: 'Review your academic calendar.', path: '/sessions-terms', icon: CalendarDays }, { title: 'Classes & arms', description: 'Manage levels and form masters.', path: '/classes', icon: Users }, { title: 'Subjects', description: 'Manage your school curriculum.', path: '/subjects', icon: BookOpen }]; return <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-10"><section className="w-full max-w-3xl rounded-4xl border border-emerald-100 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Check size={30} /></div><div className="mx-auto mt-6 max-w-xl text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">School configuration complete</p><h1 className="mt-2 text-3xl font-extrabold text-[#071A52]">Your academic workspace is ready.</h1><p className="mt-3 leading-7 text-slate-500">Choose an area to review or manage. Setup is complete, so this page will not be added to your browser history again.</p></div><div className="mt-8 grid gap-3 md:grid-cols-3">{destinations.map(({ title, description, path, icon: Icon }) => <button key={path} type="button" onClick={() => onNavigate(path)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#071A52] group-hover:bg-[#071A52] group-hover:text-white"><Icon size={20} /></span><span className="mt-4 block font-extrabold text-[#071A52]">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-700">Open <ArrowRight size={14} /></span></button>)}</div><button type="button" onClick={() => onNavigate('/admin')} className="mx-auto mt-7 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#071A52]">Return to dashboard <ArrowRight size={16} /></button></section></main>; }
function ProgressSummary({ percentage, completed }) { return <div className="w-full rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur sm:w-64"><div className="flex items-center justify-between text-sm font-bold"><span className="text-blue-100">Setup progress</span><span className="text-cyan-200">{percentage}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-cyan-300 transition-all duration-500" style={{ width: `${percentage}%` }} /></div><div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-100"><Check size={14} className="text-cyan-300" /> {Object.values(completed).filter(Boolean).length} of 3 stages complete</div></div>; }
function ErrorMessage({ message, onRetry }) { return <div role="alert" className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"><span>{message}</span><button type="button" onClick={onRetry} className="font-bold underline">Try again</button></div>; }
function SessionPanel({ sessions, completed, onCreate, onNext }) { if (!completed) return <EmptyPanel icon={CalendarDays} eyebrow="Start here" title="Create your academic session" description="Define your school year and the dates for each term. This unlocks the rest of your academic structure." action="Create session" onAction={onCreate} />; const session = sessions[0]; return <CompletedPanel title={session?.sessionName || session?.name || 'Academic session created'} subtitle={session ? `${session.startDate || ''} - ${session.endDate || ''}` : 'This stage is already complete.'} icon={CalendarDays} action="Continue to classes" onAction={onNext}><CreatedNotice text="Session and terms already created. You cannot create them again." />{session?.terms?.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-3">{session.terms.map((term) => <div key={term.id || term.termName} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="font-bold text-[#071A52]">{formatTerm(term.termName || term.name || '')}</p><p className="mt-2 text-xs text-slate-500">{term.startDate || ''} - {term.endDate || ''}</p></div>)}</div>}</CompletedPanel>; }
function ClassPanel({ classes, completed, onCreate, onNext }) { if (!completed) return <EmptyPanel icon={Users} eyebrow="Step two" title="Create your classes and arms" description="Define the levels and arms students will belong to, such as Primary 1A or SS 2 Science." action="Create class" onAction={onCreate} />; return <CompletedPanel title={classes.length ? `${classes.length} class${classes.length === 1 ? '' : 'es'} configured` : 'Classes and arms created'} subtitle="Your class structure is ready." icon={Users} action="Continue to subjects" onAction={onNext}><CreatedNotice text="Classes and arms already created. You cannot create them again." />{classes.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{classes.map((item) => <div key={item.id || `${item.classLevel}-${item.arm}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="font-bold text-[#071A52]">{item.classLevel}</p><p className="mt-1 text-xs text-slate-500">{item.arm}</p></div>)}</div>}</CompletedPanel>; }
function SubjectPanel({ subjects, completed, onCreate }) { if (!completed) return <EmptyPanel icon={BookOpen} eyebrow="Step three" title="Add your school subjects" description="Add the subjects your school teaches." action="Add subject" onAction={onCreate} />; return <CompletedPanel title={subjects.length ? `${subjects.length} subject${subjects.length === 1 ? '' : 's'} added` : 'Subjects created'} subtitle="Your subject list is ready." icon={BookOpen} action="" onAction={() => {}}><CreatedNotice text="Subjects already created. You cannot create them again." />{subjects.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{subjects.map((item) => <div key={item.id || item.subjectName} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="font-bold text-[#071A52]">{item.subjectName}</p></div>)}</div>}</CompletedPanel>; }
function CreatedNotice({ text }) { return <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><Check size={17} /> {text}</div>; }
function EmptyPanel({ icon: Icon, eyebrow, title, description, action, onAction }) { return <div className="flex min-h-90 flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-[#071A52]"><Icon size={30} /></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">{eyebrow}</p><h3 className="mt-2 max-w-lg text-2xl font-extrabold text-[#071A52]">{title}</h3><p className="mt-3 max-w-xl leading-7 text-slate-500">{description}</p><button type="button" onClick={onAction} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 font-bold text-white transition hover:bg-[#0A2463]"><Plus size={18} /> {action}</button></div>; }
function CompletedPanel({ title, subtitle, icon: Icon, action, onAction, children }) { return <div><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Icon size={22} /></div><div><h3 className="text-xl font-extrabold text-[#071A52]">{title}</h3><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div></div>{action && <button type="button" onClick={onAction} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#071A52] transition hover:border-cyan-300 hover:text-cyan-700">{action} <ArrowRight size={16} /></button>}</div><div className="mt-8">{children}</div></div>; }
function Modal({ title, error, onClose, children }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A52]/40 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-7 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-extrabold text-[#071A52]">{title}</h2><p className="mt-1 text-sm text-slate-500">Keep the details clear and easy to update.</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={19} /></button></div>{error && <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}{children}</div></div>; }
function ModalActions({ onCancel, label, saving }) { return <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} disabled={saving} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 size={16} className="animate-spin" />}{saving ? 'Saving...' : label}</button></div>; }
function TextInput({ label, value, onChange, type = 'text', placeholder, required = false }) { return <div><label className="mb-2 block text-sm font-bold text-slate-700">{label}</label><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className={inputClass} /></div>; }
function updateTerm(setter, index, field, value) { setter((current) => ({ ...current, terms: current.terms.map((term, termIndex) => termIndex === index ? { ...term, [field]: value } : term) })); }
function formatTerm(term) { return term.replace('_TERM', '').replace('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) + ' Term'; }
const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10';
