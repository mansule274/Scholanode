import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, CheckCircle2, Edit3, Globe, ImagePlus, Info, Loader2, Mail, Phone, Save, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import privateAxiosInstance from '../../auth/privateAxiosInstance';

const setupFields = ['supportEmail', 'supportPhone', 'logoUrl', 'welcomeMessage', 'website'];
const initialProgress = { percentage: 0, completed: false, steps: {} };

export default function SchoolProfile() {
  const [school, setSchool] = useState(null);
  const [progress, setProgress] = useState(initialProgress);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const [schoolResponse, progressResponse] = await Promise.all([
        privateAxiosInstance.get('/schools/me'),
        privateAxiosInstance.get('/schools/me/setup-progress'),
      ]);
      console.log('MY_SCHOOL_RESPONSE:', schoolResponse.data);
      console.log('SCHOOL_SETUP_PROGRESS_RESPONSE:', progressResponse.data);
      const nextSchool = schoolResponse.data?.school;
      const nextProgress = normalizeProgress(progressResponse.data);
      setSchool(nextSchool);
      setDraft(pickSetupFields(nextSchool));
      setLogoPreview(nextSchool?.logoUrl || '');
      setProgress(nextProgress);
    } catch (requestError) {
      console.error('SCHOOL_PROFILE_FETCH_ERROR:', requestError?.response?.data || requestError);
      setError(requestError?.response?.data?.message || 'Unable to load school information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const profileRequest = window.setTimeout(() => {
      loadProfile();
    }, 0);

    return () => window.clearTimeout(profileRequest);
  }, []);

  const completedCount = useMemo(() => Object.values(progress.steps || {}).filter(Boolean).length, [progress.steps]);

  const beginEditing = () => {
    setDraft(pickSetupFields(school));
    setLogoPreview(school?.logoUrl || '');
    setSaved(false);
    setError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(pickSetupFields(school));
    setLogoPreview(school?.logoUrl || '');
    setError('');
    setEditing(false);
  };

  const updateDraft = (field, value) => {
    setSaved(false);
    setError('');
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Choose a PNG, JPG or WebP image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!school?.id) {
      setError('School information could not be identified.');
      return;
    }
    if (draft.supportEmail && !/^\S+@\S+\.\S+$/.test(draft.supportEmail)) {
      setError('Enter a valid support email address.');
      return;
    }
    if (draft.website && !/^https?:\/\//i.test(draft.website)) {
      setError('Website must start with http:// or https://.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const updates = pickSetupFields(draft);
      const response = await privateAxiosInstance.patch(`/schools/${school.id}/setup`, updates);
      console.log('SCHOOL_SETUP_UPDATE_RESPONSE:', response.data);
      const updatedSchool = response.data?.data;
      if (updatedSchool) {
        setSchool((current) => ({ ...current, ...updatedSchool }));
        setDraft(pickSetupFields({ ...school, ...updatedSchool }));
      }
      await loadProfile();
      window.dispatchEvent(new Event('school-setup-updated'));
      setSaved(true);
      setEditing(false);
    } catch (requestError) {
      console.error('SCHOOL_SETUP_UPDATE_ERROR:', requestError?.response?.data || requestError);
      setError(requestError?.response?.data?.message || 'Unable to save school setup. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#071A52]"><ArrowLeft size={17} /> Back to dashboard</Link>
        <section className="relative mt-5 overflow-hidden rounded-3xl bg-linear-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-6 text-white shadow-2xl shadow-[#071A52]/15 sm:p-9"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-36 border-cyan-300/10" /><div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium"><Building2 size={17} /> School settings</div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">School profile</p><h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Make your school portal feel like home.</h1><p className="mt-3 max-w-2xl leading-7 text-blue-100">Keep your school identity and support details clear for every student, parent and staff member.</p></div><div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur sm:w-64"><div className="flex items-center justify-between text-sm font-bold"><span className="text-blue-100">Setup progress</span><span className="text-cyan-200">{progress.percentage}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress.percentage}%` }} /></div><p className="mt-3 text-xs text-blue-100">{completedCount} of 5 setup details complete</p></div></div></section>

        {error && <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><Info size={18} className="mt-0.5 shrink-0" />{error}</div>}
        {saved && <div role="status" className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} /> School setup updated successfully.</div>}

        <form onSubmit={handleSave} className="mt-7 space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between"><SectionTitle icon={Building2} title="School identity" description="These creation details are protected and cannot be edited here." /><span className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500"><ShieldCheck size={15} /> Read only</span></div><div className="mt-7 grid gap-5 sm:grid-cols-2"><ReadOnlyField label="School name" value={school?.schoolName} /><ReadOnlyField label="School code" value={school?.schoolCode} /><ReadOnlyField label="School level" value={school?.schoolLevel} /><ReadOnlyField label="Ownership type" value={school?.ownershipType} /><div className="sm:col-span-2"><ReadOnlyField label="School address" value={school?.address} /></div></div></section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between"><SectionTitle icon={Edit3} title="Portal setup" description="These are the only details completed during school setup." />{!editing && <button type="button" onClick={beginEditing} className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0A2463]"><Edit3 size={16} /> Edit setup</button>}</div><div className="mt-7 grid gap-5 sm:grid-cols-2"><EditableField label="Support email" type="email" value={draft.supportEmail} editing={editing} onChange={(value) => updateDraft('supportEmail', value)} placeholder="support@yourschool.com" icon={Mail} /><EditableField label="Support phone" value={draft.supportPhone} editing={editing} onChange={(value) => updateDraft('supportPhone', value)} placeholder="+234..." icon={Phone} /><EditableField label="Website" type="url" value={draft.website} editing={editing} onChange={(value) => updateDraft('website', value)} placeholder="https://yourschool.com" icon={Globe} /><div className="sm:col-span-2"><label className="mb-2 block text-sm font-bold text-slate-700">Welcome message</label>{editing ? <textarea rows={5} value={draft.welcomeMessage || ''} onChange={(event) => updateDraft('welcomeMessage', event.target.value)} placeholder="Welcome to our school portal..." className={inputClass} /> : <ReadOnlyText value={draft.welcomeMessage} placeholder="No welcome message added yet." />}</div></div></section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><SectionTitle icon={ImagePlus} title="School logo" description="Add a recognizable mark for your portal." /><div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center"><div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">{logoPreview ? <img src={logoPreview} alt="School logo preview" className="h-full w-full object-contain p-2" /> : <ImagePlus className="text-slate-300" size={30} />}</div><div><p className="font-bold text-[#071A52]">{logoPreview ? 'Logo selected' : 'No logo added yet'}</p><p className="mt-1 text-sm text-slate-500">PNG, JPG or WebP. Logo upload storage can be connected to your backend endpoint later.</p>{editing && <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#071A52] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0A2463]"><ImagePlus size={16} /> Choose logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogo} className="sr-only" /></label>}</div></div></section>

          {editing && <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-4"><p className="text-sm text-slate-500">Review your setup details before saving.</p><div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={cancelEditing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600"><X size={16} /> Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071A52] px-6 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? <><Loader2 size={17} className="animate-spin" /> Saving...</> : <><Save size={17} /> Save setup</>}</button></div></div>}
        </form>
      </div>
    </main>
  );
}

function normalizeProgress(response) { const payload = response?.data?.data ?? response?.data ?? {}; return { percentage: Number(payload.progress ?? 0), completed: payload.completed === true, steps: payload.steps || {} }; }
function pickSetupFields(source = {}) { return Object.fromEntries(setupFields.map((field) => [field, source[field] ?? ''])); }
function LoadingState() { return <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50"><div className="flex items-center gap-3 text-sm font-semibold text-slate-500"><Loader2 size={22} className="animate-spin text-cyan-600" /> Loading school profile...</div></main>; }
function SectionTitle({ icon: Icon, title, description }) { return <div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#071A52]"><Icon size={21} /></div><div><h2 className="text-xl font-extrabold text-[#071A52]">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div>; }
function ReadOnlyField({ label, value }) { return <div><label className="mb-2 block text-sm font-bold text-slate-700">{label}</label><div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500">{value || 'Not provided'}</div></div>; }
function EditableField({ label, value, editing, onChange, type = 'text', placeholder, icon: Icon }) { return <div><label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>{editing ? <div className="relative">{Icon && <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}<input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${inputClass} ${Icon ? 'pl-10' : ''}`} /></div> : <ReadOnlyText value={value} placeholder="Not provided" />}</div>; }
function ReadOnlyText({ value, placeholder }) { return <div className="min-h-12 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-500">{value || placeholder}</div>; }
const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10';
