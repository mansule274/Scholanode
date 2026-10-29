import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Loader2, Pencil, Plus, X } from 'lucide-react';
import { armTemplates, classTemplates } from './classTemplates';

export default function ClassSetupWizard({ school, existingClasses = [], onClose, onConfirm }) {
  const schoolLevel = school?.schoolLevel;
  const recommendedLevels = classTemplates[schoolLevel]?.classLevels || classTemplates.COMBINED.classLevels;
  const [step, setStep] = useState(1);
  const [customMode, setCustomMode] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState(recommendedLevels);
  const [customLevels, setCustomLevels] = useState(['']);
  const [armConfigs, setArmConfigs] = useState({});
  const [customArmDrafts, setCustomArmDrafts] = useState({});
  const [openLevel, setOpenLevel] = useState('');
  const [error, setError] = useState('');
  const [furthestStep, setFurthestStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const levels = customMode
    ? customLevels.map((level) => level.trim()).filter(Boolean)
    : selectedLevels;
  const setup = levels.map((level) => {
    const config = armConfigs[level] || { suggested: [], custom: [] };
    return {
      level,
      arms: [...config.suggested, ...config.custom],
    };
  });
  const totalClasses = setup.reduce((total, item) => total + Math.max(1, item.arms.length), 0);
  const existingKeys = new Set(existingClasses.map(classCombinationKey));
  const conflicts = setup.flatMap(({ level, arms }) => {
    const combinations = arms.length ? arms : [null];
    return combinations
      .filter((arm) => existingKeys.has(classCombinationKey({ classLevel: level, arm })))
      .map((arm) => arm ? `${level} · ${arm}` : `${level} · ungrouped`);
  });

  const toggleLevel = (level) => {
    setSelectedLevels((current) =>
      current.includes(level)
        ? current.filter((selected) => selected !== level)
        : [...current, level],
    );
    setFurthestStep(1);
    setError('');
  };

  const goToArms = () => {
    if (!levels.length) {
      setError('Select at least one recommended class level or enter a custom level.');
      return;
    }
    const uniqueLevels = new Set(levels.map(normalizeName));
    if (uniqueLevels.size !== levels.length) {
      setError('Class level names must be unique, ignoring spaces and letter case.');
      return;
    }
    setArmConfigs((current) => {
      const next = { ...current };
      levels.forEach((level) => {
        if (!next[level]) next[level] = { suggested: [], custom: [] };
      });
      return next;
    });
    setOpenLevel(levels[0]);
    setError('');
    setStep(2);
    setFurthestStep((current) => Math.max(current, 2));
  };

  const toggleArm = (level, arm) => {
    const config = armConfigs[level] || { suggested: [], custom: [] };
    const selected = config.suggested.includes(arm);
    if (!selected && config.custom.some((item) => normalizeName(item) === normalizeName(arm))) {
      setError(`${arm} is already added as a custom arm for ${level}.`);
      return;
    }
    setError('');
    setFurthestStep(2);
    setArmConfigs((current) => ({
      ...current,
      [level]: {
        ...(current[level] || { suggested: [], custom: [] }),
        suggested: selected
          ? (current[level]?.suggested || []).filter((item) => item !== arm)
          : [...(current[level]?.suggested || []), arm],
      },
    }));
  };

  const addCustomArm = (level) => {
    const arm = (customArmDrafts[level] || '').trim();
    if (!arm) {
      setError(`Enter a name for the custom arm in ${level}.`);
      return;
    }
    const config = armConfigs[level] || { suggested: [], custom: [] };
    if ([...config.suggested, ...config.custom].some((item) => normalizeName(item) === normalizeName(arm))) {
      setError(`${arm} is already selected for ${level}.`);
      return;
    }
    setArmConfigs((current) => ({
      ...current,
      [level]: { ...config, custom: [...config.custom, arm] },
    }));
    setFurthestStep(2);
    setCustomArmDrafts((current) => ({ ...current, [level]: '' }));
    setError('');
  };

  const goToPreview = () => {
    const hasDuplicateArms = setup.some(({ arms }) =>
      new Set(arms.map(normalizeName)).size !== arms.length,
    );
    if (hasDuplicateArms) {
      setError('Arm names must be unique within each class level, ignoring spaces and letter case.');
      return;
    }
    setError('');
    setStep(3);
    setFurthestStep(3);
  };

  const confirm = async () => {
    if (!totalClasses || conflicts.length) return;
    const combinations = setup.flatMap(({ level, arms }) =>
      (arms.length ? arms : [null]).map((arm) => ({ classLevel: level, arm })),
    );
    setSaving(true);
    setError('');
    try {
      await onConfirm(combinations);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to create the selected classes.');
    } finally {
      setSaving(false);
    }
  };

  const steps = ['Select class levels', 'Configure arms', 'Preview & confirm'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A52]/50 p-3 backdrop-blur-sm sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-setup-title"
        className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="border-b border-slate-100 px-5 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">Class management</p>
              <h2 id="class-setup-title" className="mt-1 text-2xl font-extrabold text-[#071A52] sm:text-3xl">
                Set up your classes
              </h2>
              <p className="mt-1 text-sm text-slate-500">Choose levels, tailor their arms, then review the full setup.</p>
            </div>
            <button type="button" onClick={onClose} disabled={saving} aria-label="Close class setup" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50">
              <X size={20} />
            </button>
          </div>
          <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Class setup progress">
            {steps.map((label, index) => {
              const number = index + 1;
              const active = step === number;
              const complete = furthestStep > number;
              const visited = number <= furthestStep;
              return (
                <li key={label}>
                  <button type="button" onClick={() => { if (visited && !active) { setStep(number); setError(''); } }} disabled={!active && !visited} aria-current={active ? 'step' : undefined} className={`flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left text-xs font-bold sm:px-3 sm:text-sm ${active ? 'bg-[#071A52] text-white' : visited ? 'cursor-pointer bg-cyan-50 text-cyan-800 hover:bg-cyan-100' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${active ? 'bg-cyan-300 text-[#071A52]' : complete ? 'bg-cyan-600 text-white' : 'bg-white text-slate-500'}`}>
                      {complete ? <Check size={14} /> : number}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#071A52]">Select the class levels to set up</h3>
                    <p className="mt-1 text-sm text-slate-500">Recommendations are a starting point; select only the levels your school needs.</p>
                  </div>
                  {school?.schoolLevel && (
                    <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800">
                      {school.schoolLevel.replace('_', ' ')}{school.ownershipType ? ` · ${school.ownershipType.replace('_', ' ')}` : ''}
                    </span>
                  )}
                </div>
                {!classTemplates[schoolLevel] && (
                  <p className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    School level is not available in your profile. All configured class levels are shown as recommendations.
                  </p>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendedLevels.map((level) => {
                    const selected = selectedLevels.includes(level);
                    return (
                      <label key={level} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${selected ? 'border-cyan-400 bg-cyan-50/70 ring-2 ring-cyan-100' : 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleLevel(level)} className="h-4 w-4 rounded border-slate-300 accent-cyan-600" />
                        <span className="font-bold text-[#071A52]">{level}</span>
                        {selected && <Check size={17} className="ml-auto text-cyan-700" />}
                      </label>
                    );
                  })}
                </div>
              </div>

              <section className={`rounded-2xl border p-4 sm:p-5 ${customMode ? 'border-cyan-200 bg-cyan-50/40' : 'border-slate-200 bg-slate-50/70'}`}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={customMode} onChange={(event) => { setCustomMode(event.target.checked); setFurthestStep(1); setError(''); }} className="mt-1 h-4 w-4 rounded border-slate-300 accent-cyan-600" />
                  <span>
                    <span className="block font-extrabold text-[#071A52]">Customize class levels</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">Does your school use a different class naming system? No problem! Customize your class levels below to match your school's structure.</span>
                  </span>
                </label>
                {customMode && (
                  <div className="mt-4 space-y-3">
                    {customLevels.map((level, index) => (
                      <div key={index} className="flex gap-2">
                        <input value={level} onChange={(event) => { setCustomLevels((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item)); setFurthestStep(1); }} placeholder={`Custom level ${index + 1}`} aria-label={`Custom class level ${index + 1}`} className={inputClass} />
                        {customLevels.length > 1 && <button type="button" onClick={() => { setCustomLevels((current) => current.filter((_, itemIndex) => itemIndex !== index)); setFurthestStep(1); }} aria-label={`Remove custom level ${index + 1}`} className="rounded-xl border border-slate-200 px-3 text-slate-500 hover:bg-white"><X size={18} /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => { setCustomLevels((current) => [...current, '']); setFurthestStep(1); }} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-cyan-800 hover:bg-cyan-50">
                      <Plus size={16} /> Add another level
                    </button>
                    <p className="text-xs text-slate-500">Custom levels replace the recommended selection for this setup.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#071A52]">Configure arms for each level</h3>
                <p className="mt-1 text-sm text-slate-500">Each class level has its own arm selection. Choose suggestions or add your own.</p>
              </div>
              {levels.map((level) => {
                const config = armConfigs[level] || { suggested: [], custom: [] };
                const selectedArms = [...config.suggested, ...config.custom];
                const isOpen = openLevel === level;
                return (
                  <article key={level} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <button type="button" onClick={() => setOpenLevel(isOpen ? '' : level)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-slate-50 sm:p-5">
                      <span className="min-w-0">
                        <span className="block font-extrabold text-[#071A52]">{level}</span>
                        <span className="mt-1 block text-sm text-slate-500">{selectedArms.length ? selectedArms.join(', ') : 'No arms selected yet'}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800">
                        {isOpen ? 'Close' : 'Configure arms'}{isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                        <div className="space-y-4">
                          {armSuggestionGroups(level).map((group) => (
                            <div key={group.label}>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{group.label}</p>
                              <div className="flex flex-wrap gap-2">
                                {group.arms.map((arm) => {
                                  const checked = config.suggested.includes(arm);
                                  return (
                                    <label key={arm} className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${checked ? 'border-cyan-400 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200'}`}>
                                      <input type="checkbox" checked={checked} onChange={() => toggleArm(level, arm)} className="h-4 w-4 rounded border-slate-300 accent-cyan-600" />
                                      {arm}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          {config.custom.length > 0 && (
                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Custom arms</p>
                              <div className="flex flex-wrap gap-2">
                                {config.custom.map((arm) => (
                                  <span key={arm} className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-sm font-bold text-violet-900">
                                    {arm}
                                    <button type="button" onClick={() => { setArmConfigs((current) => ({ ...current, [level]: { ...config, custom: config.custom.filter((item) => item !== arm) } })); setFurthestStep(2); }} aria-label={`Remove ${arm} arm from ${level}`} className="text-violet-500 hover:text-violet-900"><X size={15} /></button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <label htmlFor={`custom-arm-${level}`} className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Add a custom arm</label>
                            <div className="flex gap-2">
                              <input id={`custom-arm-${level}`} value={customArmDrafts[level] || ''} onChange={(event) => setCustomArmDrafts((current) => ({ ...current, [level]: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustomArm(level); } }} placeholder="e.g. Science, Blue, 5" className={inputClass} />
                              <button type="button" onClick={() => addCustomArm(level)} className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#071A52] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463]"><Plus size={16} /><span className="hidden sm:inline">Add arm</span></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 rounded-2xl bg-[#071A52] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-semibold text-blue-100">Classes in this setup</p><p className="mt-1 text-3xl font-extrabold">{totalClasses}</p></div>
                <p className="max-w-sm text-sm leading-6 text-blue-100">Review the levels and arms below. You can go back to edit either part before confirming.</p>
              </div>
              {conflicts.length > 0 && (
                <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-bold">Some classes already exist in the directory.</p>
                  <p className="mt-1">{conflicts.join(', ')}. Go back and adjust the class combinations before confirming.</p>
                </div>
              )}
              <div className="space-y-3">
                {setup.map(({ level, arms }) => (
                  <article key={level} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="font-extrabold text-[#071A52]">{level}</h4>
                      <button type="button" onClick={() => { setStep(2); setOpenLevel(level); setError(''); }} className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-800"><Pencil size={14} /> Edit arms</button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {arms.length
                        ? arms.map((arm) => <span key={arm} className="rounded-xl bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-900">{arm}</span>)
                        : <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">No arm · one ungrouped class</span>}
                    </div>
                  </article>
                ))}
              </div>
              <button type="button" onClick={() => { setStep(1); setError(''); }} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-cyan-800 hover:bg-cyan-50"><Pencil size={15} /> Edit class levels</button>
            </div>
          )}

          {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <button type="button" onClick={step === 1 ? onClose : () => { setError(''); setStep((current) => current - 1); }} disabled={saving} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button type="button" onClick={step === 1 ? goToArms : goToPreview} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071A52] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463] disabled:opacity-50">
              {step === 1 ? 'Next: configure arms' : 'Next: preview'}<ChevronDown className="-rotate-90" size={16} />
            </button>
          ) : (
            <button type="button" onClick={confirm} disabled={saving || !totalClasses || conflicts.length > 0} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-[#071A52] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">
              {saving && <Loader2 size={17} className="animate-spin" />}
              {saving ? 'Creating classes…' : <><Check size={17} /> Confirm and create classes</>}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

function armSuggestionGroups(level) {
  const groups = [
    { label: 'Letters', arms: armTemplates.GENERAL },
    { label: 'Numbers', arms: armTemplates.NUMBERED },
  ];
  if (/^ss\b/i.test(level)) groups.push({ label: 'Study streams', arms: armTemplates.SECONDARY_STREAMS });
  return groups;
}

function normalizeName(value) {
  return value.trim().toLocaleLowerCase();
}

function classCombinationKey({ classLevel, arm }) {
  return `${normalizeName(classLevel)}|${arm ? normalizeName(arm) : ''}`;
}

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10';
