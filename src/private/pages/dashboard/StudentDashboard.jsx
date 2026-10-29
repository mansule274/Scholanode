
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Download,
  FileText,
  GraduationCap,
  Megaphone,
  QrCode,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { useUserContext } from '../../../context/UserContext';

function SummaryCard({ title, value, description, icon: Icon, to }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
    >
      <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
        <Icon size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <ArrowRight size={17} className="shrink-0 text-slate-400" />
    </Link>
  );
}

export default function StudentDashboard() {
  const { user, school, student } = useUserContext();

  const [showQr, setShowQr] = useState(false);
  const qrRef = useRef(null);

  const displayName =
    [user?.firstName, user?.surName]
      .filter(Boolean)
      .join(' ') ||
    student?.firstName ||
    'Student';

  const admissionNumber =
    student?.admissionNumber ||
    user?.admissionNumber ||
    '';

  // Avoid displaying currentClassId because it may be an internal database ID.
  const classLabel =
    student?.currentClass?.className ||
    student?.currentClass?.name ||
    [
      student?.classLevel,
      student?.arm,
    ].filter(Boolean).join(' ') ||
    student?.currentClass ||
    'Class not assigned';

  const schoolName = school?.schoolName || school?.name || 'School';

  const attendanceLabel = student?.todayAttendance || 'Not recorded';

// Mock attendance data for UI testing.
// Replace with real attendance data when the backend is ready.
const attendancePercentage = 92;

  const latestResult = student?.latestResult;

  const resultDownloadUrl =
    latestResult?.downloadUrl ||
    latestResult?.pdfUrl ||
    latestResult?.fileUrl ||
    null;

  const messageTitle = 'School announcement';

  const messageDescription =
    'Check your class updates and important notices from your school.';

  // Mock QR data for development.
  // In production, use a secure, backend-generated verification token.
  const qrValue =
    student?.qrCodeValue ||
    (admissionNumber
      ? `SCHOLANODE-STUDENT:${admissionNumber}`
      : '');

  function downloadQrCode() {
    const svg = qrRef.current?.querySelector('svg');

    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `student-qr-${admissionNumber || 'code'}.svg`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto max-w-5xl space-y-5">

        {/* Welcome */}
        <section className="rounded-2xl bg-gradient-to-r from-[#071A52] to-[#123A8F] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <GraduationCap size={26} />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold sm:text-2xl">
                Welcome back, {displayName}!
              </h1>

              <p className="mt-2 text-sm text-blue-100">
                {schoolName}
              </p>

              <p className="mt-1 text-xs text-blue-200">
                {classLabel}
                {admissionNumber
                  ? ` · Admission ${admissionNumber}`
                  : ''}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowQr(true)}
              disabled={!qrValue}
              className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Show my QR code"
            >
              <QrCode size={24} />
              My QR
            </button>
          </div>
        </section>

        {/* Attendance and subjects */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SummaryCard
            title="Today's Attendance"
            value={attendanceLabel}
            description="Check your attendance record"
            icon={CalendarCheck}
            to="/student-attendance"
          />

          <SummaryCard
            title="My Subjects"
            value={
              student?.subjects?.length
                ? student.subjects.length
                : '—'
            }
            description="View your assigned subjects"
            icon={BookOpen}
            to="/student-subjects"
          />
        </section>

        {/* Attendance progress */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">
                My Attendance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Attendance for the current academic period
              </p>
            </div>

            <span className="text-xl font-bold text-blue-800">
              {attendancePercentage !== null
                ? `${attendancePercentage}%`
                : '—'}
            </span>
          </div>

          <div
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Attendance percentage"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={attendancePercentage ?? 0}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-800 to-cyan-500 transition-all duration-500"
              style={{
                width: `${attendancePercentage ?? 0}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {attendancePercentage !== null
                ? 'Keep attending your classes regularly.'
                : 'Your attendance summary is not available yet.'}
            </p>

            <Link
              to="/student-attendance"
              className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              View details
            </Link>
          </div>
        </section>

        {/* Latest result */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                <FileText size={22} />
              </div>

              <div className="min-w-0">
                <h2 className="font-semibold text-slate-900">
                  My Latest Result
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {latestResult?.title ||
                    'No published result available yet.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {resultDownloadUrl && (
                <a
                  href={resultDownloadUrl}
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Download size={16} />
                  Download
                </a>
              )}

              <Link
                to="/student-results"
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                View results
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* QR modal */}
        {showQr && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-0 sm:p-4"
            onClick={() => setShowQr(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-qr-title"
              className="relative flex h-full w-full flex-col items-center justify-center bg-white p-6 sm:h-auto sm:max-w-sm sm:rounded-2xl sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowQr(false)}
                className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close QR code"
              >
                <X size={21} />
              </button>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-800">
                <QrCode size={27} />
              </div>

              <h2
                id="student-qr-title"
                className="mt-4 text-xl font-bold text-slate-900"
              >
                My Student QR Code
              </h2>

              <p className="mt-2 text-center text-sm text-slate-500">
                Present this code to authorized school personnel for
                student verification.
              </p>

              <div
                ref={qrRef}
                className="mt-6 rounded-2xl border border-slate-100 bg-white p-4"
              >
                {qrValue && (
                  <QRCodeSVG
                    value={qrValue}
                    size={220}
                    level="M"
                    marginSize={2}
                    title="Student verification QR code"
                  />
                )}
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-800">
                {displayName}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Admission No: {admissionNumber || 'Not available'}
              </p>

              <button
                type="button"
                onClick={downloadQrCode}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A52] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123A8F]"
              >
                <Download size={18} />
                Download QR Code
              </button>

              <p className="mt-3 text-center text-xs text-slate-400">
                Keep your verification code private.
              </p>
            </div>
          </div>
        )}

        {/* School announcements */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Megaphone size={20} className="text-amber-600" />
            <h2 className="font-semibold text-slate-900">
              School Announcement
            </h2>
          </div>

          <div className="mt-3">
            <h3 className="text-sm font-semibold text-slate-800">
              {messageTitle}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {messageDescription}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-400">
                Updated for the current session
              </p>

              <Link
                to="/student-announcements"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                View announcements
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
