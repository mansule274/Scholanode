import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellOff,
  BellRing,
  Camera,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import ChildPageLayout from "./ChildPageLayout";
import {
  admissionStatusStyles,
  getClassName,
  getDisplayName,
  getInitials,
  getRelationshipLabel,
  titleCase,
} from "./childDisplay";
import {
  getChildProfilePreview,
  saveChildProfilePreview,
} from "./childProfilePreview";

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function statusLabel(status) {
  const normalized = String(status || "").toUpperCase();
  const tone = admissionStatusStyles[normalized];
  return (
    tone?.label ||
    (normalized
      ? titleCase(normalized.toLowerCase().replace(/_/g, " "))
      : "Unknown")
  );
}

function ChildProfileBody({ child }) {
  const fileInputRef = useRef(null);
  const preview = getChildProfilePreview(child);

  const [profileImage, setProfileImage] = useState("");
  const [form, setForm] = useState(() => ({
    email: preview.email,
    phoneNumber: preview.phoneNumber,
    address: preview.address,
  }));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const isDirty =
    form.email !== preview.email ||
    form.phoneNumber !== preview.phoneNumber ||
    form.address !== preview.address ||
    Boolean(profileImage);

  const fields = [
    {
      key: "firstName",
      label: "First name",
      value: titleCase(child.firstName),
      editable: false,
      type: "text",
    },
    {
      key: "surName",
      label: "Surname",
      value: titleCase(child.surName),
      editable: false,
      type: "text",
    },
    {
      key: "email",
      label: "Email",
      value: form.email,
      editable: true,
      type: "email",
    },
    {
      key: "phoneNumber",
      label: "Phone number",
      value: form.phoneNumber,
      editable: true,
      type: "tel",
    },
    {
      key: "gender",
      label: "Gender",
      value: preview.gender,
      editable: false,
      type: "text",
    },
    {
      key: "dateOfBirth",
      label: "Date of birth",
      value: preview.dateOfBirth,
      editable: false,
      type: "date",
    },
    {
      key: "className",
      label: "Class",
      value: getClassName(child),
      editable: false,
      type: "text",
    },
    {
      key: "admissionNumber",
      label: "Admission number",
      value: child.admissionNumber || "",
      editable: false,
      type: "text",
      mono: true,
    },
    {
      key: "address",
      label: "Residential address",
      value: form.address,
      editable: true,
      type: "text",
      full: true,
    },
  ];

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(typeof reader.result === "string" ? reader.result : "");
      setNotice("");
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!isDirty || saving) return;

    setSaving(true);
    setNotice("");

    try {
      await saveChildProfilePreview({
        studentId: child.id,
        ...form,
        profileImageSet: Boolean(profileImage),
      });
      setNotice(
        "Preview only — these changes are not sent to the school until profile updates are enabled."
      );
    } catch {
      setNotice("We could not save these changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A52] via-[#0A2463] to-[#123A8F] p-5 text-white shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border-[30px] border-white/[0.06]" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 text-2xl font-black shadow-inner">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${getDisplayName(child)} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(child)
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white text-[#071A52] shadow-lg transition hover:scale-105"
                aria-label="Change student photo"
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
                Student profile
              </p>
              <h1 className="mt-1.5 truncate text-xl font-black sm:text-2xl">
                {getDisplayName(child)}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-blue-100">
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1">
                  {getClassName(child)}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-mono">
                  {child.admissionNumber || "—"}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1">
                  Linked as {getRelationshipLabel(child.relationship)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  {statusLabel(child.admissionStatus)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#071A52] shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </section>

      {notice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] font-semibold leading-5 text-amber-800">
          {notice}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <UserRound size={17} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#071A52]">
                Personal details
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Photo and contact details can be updated by you.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {fields.map((field) => (
              <label
                key={field.key}
                className={`block ${field.full ? "md:col-span-2" : ""}`}
              >
                <span className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-700">
                  <span>{field.label}</span>
                  {field.editable ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                      <PencilLine size={11} /> Editable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      <ShieldCheck size={11} /> School managed
                    </span>
                  )}
                </span>

                <input
                  type={field.type}
                  value={field.value || ""}
                  disabled={!field.editable}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  className={`w-full rounded-xl border px-3 py-2.5 text-xs outline-none transition ${
                    field.editable
                      ? "border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                  } ${field.mono ? "font-mono text-[11px]" : ""}`}
                />
              </label>
            ))}
          </div>

          <p className="mt-4 flex items-start gap-1.5 text-[10px] leading-4 text-slate-400">
            <ShieldCheck size={12} className="mt-0.5 shrink-0" />
            Academic and admission records are managed by the school. Some
            details shown here are placeholders until complete student records
            are available.
          </p>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-[#071A52]">
              Profile summary
            </h3>

            <div className="mt-3 space-y-2">
              <InfoChip icon={Mail} label="Email" value={form.email} />
              <InfoChip icon={Phone} label="Phone" value={form.phoneNumber} />
              <InfoChip icon={MapPin} label="Address" value={form.address} />
              <InfoChip
                icon={child.receivesNotifications ? BellRing : BellOff}
                label="School alerts"
                value={child.receivesNotifications ? "Enabled" : "Disabled"}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-[#071A52]">
              Parent access
            </h3>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              You can update the profile photo, email, phone number, and
              residential address. Name, class, admission number, and status
              stay locked to the school record.
            </p>

            <Link
              to={`/children/${child.id}/results`}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-[#123A8F] transition hover:border-blue-300 hover:bg-blue-50"
            >
              View term results
              <ArrowRight size={13} />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}

export default function ChildProfilePage() {
  return (
    <ChildPageLayout section="profile" title="Profile" hideIdentity>
      {({ child }) => <ChildProfileBody key={child.id} child={child} />}
    </ChildPageLayout>
  );
}
