import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Plus,
  Search,
  Printer,
  BookOpen,
  Users,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Settings2,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  RotateCcw,
} from "lucide-react";

const STORAGE_KEY = "scholanode:timetable:v1";

const INITIAL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const CLASSES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
];

const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Social Studies",
  "Computer Studies",
  "Civic Education",
  "Agricultural Science",
  "Physical and Health Education",
  "Creative Arts",
  "Home Economics",
  "Religious Studies",
  "Basic Technology",
  "French",
  "Business Studies",
];

const TEACHERS = [
  "Amina Yusuf",
  "Musa Ibrahim",
  "Fatima Bello",
  "Abdullahi Sani",
  "Mary James",
  "Ibrahim Adamu",
];

const makeInitialState = () => ({
  workingDays: INITIAL_DAYS,
  periods: [
    { id: "period-1", name: "Period 1", time: "" },
    { id: "period-2", name: "Period 2", time: "" },
    { id: "period-3", name: "Period 3", time: "" },
  ],
  lessons: [],
});

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed.workingDays) &&
        Array.isArray(parsed.periods) &&
        Array.isArray(parsed.lessons)
      ) {
        return {
          workingDays: parsed.workingDays,
          periods: parsed.periods,
          lessons: parsed.lessons,
        };
      }
    }
  } catch (error) {
    console.error("Unable to load timetable:", error);
  }

  return makeInitialState();
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function Modal({ title, subtitle, onClose, children, size = "max-w-lg" }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`max-h-[90vh] w-full ${size} overflow-y-auto rounded-2xl bg-white shadow-2xl`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#071A52]">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function Timetable() {
  const [data, setData] = useState(loadInitialState);
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [search, setSearch] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [notice, setNotice] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    subject: "",
    teacher: "",
  });
  const [periodForm, setPeriodForm] = useState({
    name: "",
    time: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Unable to save timetable:", error);
      setNotice({
        type: "error",
        message: "Unable to save changes in this browser.",
      });
    }
  }, [data]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const currentLessons = useMemo(
    () => data.lessons.filter((lesson) => lesson.className === selectedClass),
    [data.lessons, selectedClass]
  );

  const totalLessons = currentLessons.length;

  const assignedTeachers = new Set(
    currentLessons.map((lesson) => lesson.teacher).filter(Boolean)
  ).size;

  const filledPeriods = new Set(
    currentLessons.map((lesson) => lesson.periodId)
  ).size;

  const visiblePeriods = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data.periods;

    return data.periods.filter((period) => {
      const matchingLesson = currentLessons.some((lesson) => {
        if (lesson.periodId !== period.id) return false;

        return (
          lesson.subject.toLowerCase().includes(query) ||
          (lesson.teacher || "").toLowerCase().includes(query) ||
          lesson.day.toLowerCase().includes(query)
        );
      });

      return (
        period.name.toLowerCase().includes(query) ||
        period.time.toLowerCase().includes(query) ||
        matchingLesson
      );
    });
  }, [data.periods, currentLessons, search]);

  function updateData(updater) {
    setData((previous) =>
      typeof updater === "function" ? updater(previous) : updater
    );
  }

  function getLesson(day, periodId) {
    return currentLessons.find(
      (lesson) => lesson.day === day && lesson.periodId === periodId
    );
  }

  function openAddLesson(day, periodId) {
    const existingLesson = getLesson(day, periodId);

    if (existingLesson) {
      openEditLesson(existingLesson);
      return;
    }

    setSelectedDay(day);
    setSelectedPeriod(periodId);
    setSelectedLesson(null);
    setLessonForm({ subject: "", teacher: "" });
    setActiveModal("lesson");
  }

  function openEditLesson(lesson) {
    setSelectedLesson(lesson);
    setSelectedDay(lesson.day);
    setSelectedPeriod(lesson.periodId);
    setLessonForm({
      subject: lesson.subject,
      teacher: lesson.teacher || "",
    });
    setActiveModal("lesson");
  }

  function saveLesson(event) {
    event.preventDefault();

    if (!lessonForm.subject) {
      setNotice({ type: "error", message: "Please select a subject." });
      return;
    }

    const duplicate = data.lessons.some(
      (lesson) =>
        lesson.className === selectedClass &&
        lesson.day === selectedDay &&
        lesson.periodId === selectedPeriod &&
        lesson.id !== selectedLesson?.id
    );

    if (duplicate) {
      setNotice({
        type: "error",
        message: "A lesson already exists in this time slot.",
      });
      return;
    }

    if (selectedLesson) {
      updateData((previous) => ({
        ...previous,
        lessons: previous.lessons.map((lesson) =>
          lesson.id === selectedLesson.id
            ? {
                ...lesson,
                subject: lessonForm.subject,
                teacher: lessonForm.teacher,
              }
            : lesson
        ),
      }));

      setNotice({ type: "success", message: "Lesson updated successfully." });
    } else {
      updateData((previous) => ({
        ...previous,
        lessons: [
          ...previous.lessons,
          {
            id: createId(),
            className: selectedClass,
            day: selectedDay,
            periodId: selectedPeriod,
            subject: lessonForm.subject,
            teacher: lessonForm.teacher,
          },
        ],
      }));

      setNotice({ type: "success", message: "Lesson added successfully." });
    }

    setActiveModal(null);
  }

  function deleteLesson() {
    if (!selectedLesson) return;

    if (!window.confirm(`Remove ${selectedLesson.subject} from this slot?`)) {
      return;
    }

    updateData((previous) => ({
      ...previous,
      lessons: previous.lessons.filter(
        (lesson) => lesson.id !== selectedLesson.id
      ),
    }));

    setActiveModal(null);
    setNotice({ type: "success", message: "Lesson removed." });
  }

  function openAddPeriod() {
    setSelectedPeriod(null);
    setPeriodForm({
      name: `Period ${data.periods.length + 1}`,
      time: "",
    });
    setActiveModal("period");
  }

  function openEditPeriod(period) {
    setSelectedPeriod(period.id);
    setPeriodForm({
      name: period.name,
      time: period.time,
    });
    setActiveModal("period");
  }

  function savePeriod(event) {
    event.preventDefault();

    const name = periodForm.name.trim();

    if (!name) {
      setNotice({ type: "error", message: "Enter a period name." });
      return;
    }

    const duplicateName = data.periods.some(
      (period) =>
        period.name.trim().toLowerCase() === name.toLowerCase() &&
        period.id !== selectedPeriod
    );

    if (duplicateName) {
      setNotice({
        type: "error",
        message: "A period with this name already exists.",
      });
      return;
    }

    if (selectedPeriod) {
      updateData((previous) => ({
        ...previous,
        periods: previous.periods.map((period) =>
          period.id === selectedPeriod
            ? { ...period, name, time: periodForm.time.trim() }
            : period
        ),
      }));

      setNotice({ type: "success", message: "Period updated." });
    } else {
      updateData((previous) => ({
        ...previous,
        periods: [
          ...previous.periods,
          {
            id: createId(),
            name,
            time: periodForm.time.trim(),
          },
        ],
      }));

      setNotice({ type: "success", message: "New period added." });
    }

    setActiveModal(null);
  }

  function deletePeriod(period) {
    const lessonCount = data.lessons.filter(
      (lesson) => lesson.periodId === period.id
    ).length;

    const message = lessonCount
      ? `Remove "${period.name}" and its ${lessonCount} lesson(s) across all classes? This cannot be undone.`
      : `Remove "${period.name}"?`;

    if (!window.confirm(message)) return;

    updateData((previous) => ({
      ...previous,
      periods: previous.periods.filter((item) => item.id !== period.id),
      lessons: previous.lessons.filter(
        (lesson) => lesson.periodId !== period.id
      ),
    }));

    setNotice({
      type: "success",
      message: lessonCount
        ? "Period and its lessons removed."
        : "Period removed.",
    });
  }

  function toggleWorkingDay(day) {
    const isWorkingDay = data.workingDays.includes(day);

    if (isWorkingDay) {
      const affectedLessons = data.lessons.filter(
        (lesson) => lesson.day === day
      ).length;

      const message = affectedLessons
        ? `Remove ${day} from working days? This will also delete ${affectedLessons} lesson(s) assigned to that day across all classes.`
        : `Remove ${day} from working days?`;

      if (!window.confirm(message)) return;

      updateData((previous) => ({
        ...previous,
        workingDays: previous.workingDays.filter((item) => item !== day),
        lessons: previous.lessons.filter((lesson) => lesson.day !== day),
      }));

      setNotice({
        type: "success",
        message: `${day} removed from working days.`,
      });
    } else {
      updateData((previous) => ({
        ...previous,
        workingDays: [
          ...INITIAL_DAYS.filter(
            (item) => item === day || previous.workingDays.includes(item)
          ),
        ],
      }));

      setNotice({ type: "success", message: `${day} added to working days.` });
    }
  }

  function resetTimetable() {
    if (
      !window.confirm(
        "Reset the entire mock timetable? All periods, lessons and working-day changes will be removed."
      )
    ) {
      return;
    }

    setData(makeInitialState());
    setSelectedClass(CLASSES[0]);
    setSearch("");
    setNotice({ type: "success", message: "Timetable reset." });
  }

  function printTimetable() {
    window.print();
  }

  const workingDayCount = data.workingDays.length;

  return (
    <div className="min-h-screen bg-slate-50/80 px-3 py-5 sm:px-6 lg:px-8">
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }

          body {
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-timetable,
          .print-timetable * {
            visibility: visible !important;
          }

          .print-timetable {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-grid {
            display: grid !important;
            grid-template-columns: 105px repeat(var(--day-count), minmax(0, 1fr)) !important;
            gap: 4px !important;
          }

          .print-cell {
            min-height: 70px !important;
            break-inside: avoid !important;
          }

          .print-heading {
            color: #071A52 !important;
          }

          .print-lesson {
            background: #eff6ff !important;
            border: 1px solid #bfdbfe !important;
            color: #071A52 !important;
          }

          .print-time {
            display: block !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] px-5 py-7 text-white shadow-lg sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
                <CalendarDays size={14} />
                ACADEMIC MANAGEMENT
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Class Timetable
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Organise lessons, assign subjects and teachers, and keep every
                class on schedule from one simple workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={printTimetable}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <Printer size={17} />
                Print / Save PDF
              </button>

              <button
                type="button"
                onClick={openAddPeriod}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-[#071A52] shadow-sm transition hover:bg-cyan-300"
              >
                <Plus size={18} />
                Add Period
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-xs text-blue-100 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={15} className="text-cyan-300" />
              Simple grid-based planning
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 size={15} className="text-cyan-300" />
              Flexible period times
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarCheck size={15} className="text-cyan-300" />
              Saved in this browser
            </span>
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Lessons Scheduled",
              value: totalLessons,
              icon: BookOpen,
              color: "bg-blue-50 text-blue-700",
              detail: selectedClass,
            },
            {
              label: "Periods",
              value: data.periods.length,
              icon: Clock3,
              color: "bg-cyan-50 text-cyan-700",
              detail: "Across the school timetable",
            },
            {
              label: "Working Days",
              value: workingDayCount,
              icon: CalendarDays,
              color: "bg-indigo-50 text-indigo-700",
              detail: "Configured school days",
            },
            {
              label: "Teachers Assigned",
              value: assignedTeachers,
              icon: Users,
              color: "bg-violet-50 text-violet-700",
              detail: "In the selected class",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[#071A52] sm:text-3xl">
                      {item.value}
                    </p>
                  </div>

                  <div className={`rounded-xl p-2.5 ${item.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <p className="mt-3 truncate text-xs text-slate-500">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </section>

        {/* Class and working-day controls */}
        <section className="no-print rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center gap-2">
                <GraduationCap size={19} className="text-blue-700" />
                <h2 className="font-bold text-[#071A52]">Select a class</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {CLASSES.map((className) => (
                  <button
                    type="button"
                    key={className}
                    onClick={() => setSelectedClass(className)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      selectedClass === className
                        ? "border-[#123A8F] bg-[#123A8F] text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                    }`}
                  >
                    {className}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full xl:max-w-sm">
              <div className="mb-3 flex items-center gap-2">
                <Settings2 size={18} className="text-blue-700" />
                <h2 className="font-bold text-[#071A52]">Working days</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {INITIAL_DAYS.map((day) => {
                  const enabled = data.workingDays.includes(day);

                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleWorkingDay(day)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        enabled
                          ? "border-blue-200 bg-blue-50 text-blue-800"
                          : "border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {enabled && (
                        <CheckCircle2
                          size={12}
                          className="mr-1 inline"
                        />
                      )}
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Changes apply to every class. Removing a day with lessons
                requires confirmation.
              </p>
            </div>
          </div>
        </section>

        {/* Timetable grid */}
        <section className="print-timetable overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="no-print flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                WEEKLY SCHEDULE
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#071A52]">
                {selectedClass} Timetable
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select an empty slot to add a lesson or an existing lesson to
                edit it.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search lessons..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <button
                type="button"
                onClick={resetTimetable}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
                title="Reset all mock timetable data"
              >
                <RotateCcw size={15} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          <div className="hidden print:block print-heading px-2 py-4">
            <h1 className="text-2xl font-bold">{selectedClass} Timetable</h1>
            <p className="mt-1 text-sm">
              Weekly class schedule
            </p>
          </div>

          {data.workingDays.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CalendarDays
                size={36}
                className="mx-auto text-slate-300"
              />
              <h3 className="mt-4 font-bold text-[#071A52]">
                No working days selected
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Select at least one working day above to display the timetable
                grid.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div
                className="print-grid min-w-[850px] p-3 sm:p-5"
                style={{
                  "--day-count": data.workingDays.length,
                  display: "grid",
                  gridTemplateColumns: `116px repeat(${data.workingDays.length}, minmax(145px, 1fr))`,
                  gap: "8px",
                }}
              >
                {/* Grid header */}
                <div className="flex min-h-[72px] flex-col justify-center rounded-xl bg-slate-50 px-3 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    TIME
                  </span>
                  <span className="mt-1 text-xs font-bold text-slate-600">
                    Period
                  </span>
                </div>

                {data.workingDays.map((day) => (
                  <div
                    key={day}
                    className="flex min-h-[72px] flex-col justify-center rounded-xl bg-[#071A52] px-3 py-3 text-white"
                  >
                    <span className="text-sm font-bold">{day}</span>
                    <span className="mt-1 text-xs text-blue-200">
                      {currentLessons.filter(
                        (lesson) => lesson.day === day
                      ).length}{" "}
                      lesson(s)
                    </span>
                  </div>
                ))}

                {/* Period rows */}
                {visiblePeriods.map((period) => (
                  <div
                    key={period.id}
                    className="contents"
                  >
                    <div className="print-cell group relative flex min-h-[132px] flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                      <div>
                        <p className="break-words text-sm font-bold text-[#071A52]">
                          {period.name}
                        </p>

                        <div className="print-time mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                          <Clock3
                            size={13}
                            className="mt-0.5 shrink-0"
                          />
                          <span className="break-words">
                            {period.time || "Time not set"}
                          </span>
                        </div>
                      </div>

                      <div className="no-print mt-3 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditPeriod(period)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                          title="Edit period name or time"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deletePeriod(period)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          title="Remove period"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {data.workingDays.map((day) => {
                      const lesson = getLesson(day, period.id);

                      return (
                        <div
                          key={`${period.id}-${day}`}
                          className="print-cell min-h-[132px] min-w-0 rounded-xl"
                        >
                          {lesson ? (
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => openEditLesson(lesson)}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault();
                                  openEditLesson(lesson);
                                }
                              }}
                              className="print-lesson group relative flex h-full min-h-[132px] cursor-pointer flex-col rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50/70 p-3 text-left transition hover:border-blue-300 hover:shadow-md"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                  <BookOpen
                                    size={12}
                                    className="shrink-0"
                                  />
                                  <span className="truncate">Lesson</span>
                                </span>

                                <Pencil
                                  size={13}
                                  className="no-print shrink-0 text-blue-400 opacity-0 transition group-hover:opacity-100"
                                />
                              </div>

                              <h3 className="mt-3 break-words text-sm font-bold leading-5 text-[#071A52]">
                                {lesson.subject}
                              </h3>

                              <div className="mt-auto pt-4">
                                {lesson.teacher ? (
                                  <div className="flex items-start gap-1.5 text-xs leading-5 text-slate-600">
                                    <Users
                                      size={13}
                                      className="mt-0.5 shrink-0 text-blue-500"
                                    />
                                    <span className="break-words">
                                      {lesson.teacher}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs italic text-amber-600">
                                    Teacher not assigned
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openAddLesson(day, period.id)}
                              className="no-print group flex h-full min-h-[132px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-3 text-center transition hover:border-blue-300 hover:bg-blue-50/60"
                              title={`Add lesson: ${day}, ${period.name}`}
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-blue-100 group-hover:text-blue-700">
                                <Plus size={17} />
                              </span>
                              <span className="mt-2 text-xs font-semibold text-slate-400 transition group-hover:text-blue-700">
                                Add lesson
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid footer */}
          <div className="no-print flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <p className="text-xs leading-5 text-slate-500">
              Showing {visiblePeriods.length} of {data.periods.length} periods
              {" · "}
              {totalLessons} lesson(s) in {selectedClass}
            </p>

            <button
              type="button"
              onClick={openAddPeriod}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
            >
              <Plus size={16} />
              Add period at bottom
            </button>
          </div>
        </section>

        {/* Guidance */}
        <section className="no-print flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 sm:p-5">
          <div className="rounded-xl bg-white p-2 text-cyan-700 shadow-sm">
            <AlertTriangle size={18} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#071A52]">
              Before you begin
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
              Period names and times are flexible text. Subject is required;
              teacher assignment is optional. Period changes affect every
              class, while lessons belong to their individual classes. This
              prototype stores data in your browser only.
            </p>
          </div>
        </section>
      </div>

      {/* Lesson modal */}
      {activeModal === "lesson" && (
        <Modal
          title={selectedLesson ? "Edit Lesson" : "Add Lesson"}
          subtitle={`${selectedClass} · ${selectedDay} · ${
            data.periods.find((period) => period.id === selectedPeriod)?.name ||
            "Period"
          }`}
          onClose={() => setActiveModal(null)}
        >
          <form onSubmit={saveLesson} className="space-y-5">
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Selected time slot
              </p>
              <p className="mt-1 font-bold text-[#071A52]">
                {selectedDay}
                {" · "}
                {
                  data.periods.find(
                    (period) => period.id === selectedPeriod
                  )?.name
                }
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {data.periods.find(
                  (period) => period.id === selectedPeriod
                )?.time || "No time set"}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                The day and period are fixed for this lesson. To move a lesson,
                remove it and add it to another slot.
              </p>
            </div>

            <Field label="Subject" required>
              <select
                value={lessonForm.subject}
                onChange={(event) =>
                  setLessonForm((previous) => ({
                    ...previous,
                    subject: event.target.value,
                  }))
                }
                className={inputClass}
                required
              >
                <option value="">Select a subject</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Teacher"
              hint="Optional. You can assign a teacher later."
            >
              <select
                value={lessonForm.teacher}
                onChange={(event) =>
                  setLessonForm((previous) => ({
                    ...previous,
                    teacher: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">No teacher assigned</option>
                {TEACHERS.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </Field>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
              <div>
                {selectedLesson && (
                  <button
                    type="button"
                    onClick={deleteLesson}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
                  >
                    <Trash2 size={16} />
                    Remove lesson
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex-none"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#123A8F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463] sm:flex-none"
                >
                  {selectedLesson ? "Save Changes" : "Add Lesson"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Period modal */}
      {activeModal === "period" && (
        <Modal
          title={selectedPeriod ? "Edit Period" : "Add Period"}
          subtitle="Configure the period displayed in every class timetable."
          onClose={() => setActiveModal(null)}
        >
          <form onSubmit={savePeriod} className="space-y-5">
            <Field label="Period name" required>
              <input
                value={periodForm.name}
                onChange={(event) =>
                  setPeriodForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Period 4, Morning Assembly"
                className={inputClass}
                maxLength={60}
                required
              />
            </Field>

            <Field
              label="Time"
              hint="Enter any time label you want. Example: 8:20am–10:00am. No time calculation is performed."
            >
              <input
                value={periodForm.time}
                onChange={(event) =>
                  setPeriodForm((previous) => ({
                    ...previous,
                    time: event.target.value,
                  }))
                }
                placeholder="e.g. 8:20am–10:00am"
                className={inputClass}
                maxLength={80}
              />
            </Field>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <Clock3 size={18} className="mt-0.5 text-blue-700" />
                <p className="text-xs leading-5 text-slate-600">
                  {selectedPeriod
                    ? "Editing a period changes its label or time across all classes. Existing lessons remain in this period."
                    : "The new period will be added to the bottom of the timetable grid for all classes."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#123A8F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0A2463]"
              >
                {selectedPeriod ? "Save Changes" : "Add Period"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Notification */}
      {notice && (
        <div
          role="status"
          className={`no-print fixed bottom-5 right-4 z-[70] flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl sm:right-6 ${
            notice.type === "error"
              ? "border-red-200 bg-white text-red-700"
              : "border-emerald-200 bg-white text-emerald-800"
          }`}
        >
          {notice.type === "error" ? (
            <AlertTriangle size={19} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          )}

          <p className="flex-1 text-sm font-medium">{notice.message}</p>

          <button
            type="button"
            onClick={() => setNotice(null)}
            className="rounded p-1 opacity-60 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Timetable;