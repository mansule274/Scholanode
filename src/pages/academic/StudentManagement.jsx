import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Ban,
  Check,
  ChevronDown,
  Copy,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserRound,
  X,
  Upload,
  Link2,
  Unlink,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getClasses } from "./classesApi";
import { createStudent } from "./studentsApi";

/* ============================================================
   CONFIG
============================================================ */

const storageKey = "scholanode-students";
const parentsStorageKey = "scholanode-parents";
const parentLinksStorageKey = "scholanode-parent-links";

/* ============================================================
   STARTER STUDENTS
============================================================ */

const starterStudents = [
  {
    id: "student-1",
    userId: "user-student-1",
    schoolId: "school-1",
    firstName: "Ahmad",
    surName: "Musa",
    loginId: "ADM001",
    admissionNumber: "ADM001",
    gender: "MALE",
    dateOfBirth: "2011-04-18",
    phoneNumber: "",
    email: "",
    profileImageUrl: "",
    status: "ACTIVE",
    admissionStatus: "ACTIVE",
    currentClassId: "class-jss2",
    currentClass: "JSS 2",
    currentArmId: "arm-a",
    currentArm: "A",
    enrollmentDate: "2025-09-08",
    qrToken: "qr-student-1",
    lastLoginAt: "2026-10-05T08:30:00.000Z",
    createdAt: "2025-09-08T10:00:00.000Z",
  },
  {
    id: "student-2",
    userId: "user-student-2",
    schoolId: "school-1",
    firstName: "Maryam",
    surName: "Ibrahim",
    loginId: "ADM002",
    admissionNumber: "ADM002",
    gender: "FEMALE",
    dateOfBirth: "2012-01-12",
    phoneNumber: "",
    email: "",
    profileImageUrl: "",
    status: "ACTIVE",
    admissionStatus: "ACTIVE",
    currentClassId: "class-jss1",
    currentClass: "JSS 1",
    currentArmId: "arm-b",
    currentArm: "B",
    enrollmentDate: "2025-09-08",
    qrToken: "qr-student-2",
    lastLoginAt: "2026-10-06T07:45:00.000Z",
    createdAt: "2025-09-08T10:10:00.000Z",
  },
  {
    id: "student-3",
    userId: "user-student-3",
    schoolId: "school-1",
    firstName: "Abdullahi",
    surName: "Yusuf",
    loginId: "ADM003",
    admissionNumber: "ADM003",
    gender: "MALE",
    dateOfBirth: "2010-11-03",
    phoneNumber: "",
    email: "",
    profileImageUrl: "",
    status: "ACTIVE",
    admissionStatus: "ACTIVE",
    currentClassId: "class-ss1",
    currentClass: "SS 1",
    currentArmId: "arm-a",
    currentArm: "A",
    enrollmentDate: "2024-09-09",
    qrToken: "qr-student-3",
    lastLoginAt: "2026-10-04T09:15:00.000Z",
    createdAt: "2024-09-09T09:00:00.000Z",
  },
  {
    id: "student-4",
    userId: "user-student-4",
    schoolId: "school-1",
    firstName: "Fatima",
    surName: "Sani",
    loginId: "ADM004",
    admissionNumber: "ADM004",
    gender: "FEMALE",
    dateOfBirth: "2013-06-22",
    phoneNumber: "",
    email: "",
    profileImageUrl: "",
    status: "ACTIVE",
    admissionStatus: "ACTIVE",
    currentClassId: "class-primary5",
    currentClass: "Primary 5",
    currentArmId: "arm-a",
    currentArm: "A",
    enrollmentDate: "2025-09-08",
    qrToken: "qr-student-4",
    lastLoginAt: null,
    createdAt: "2025-09-08T11:00:00.000Z",
  },
  {
    id: "student-5",
    userId: "user-student-5",
    schoolId: "school-1",
    firstName: "Usman",
    surName: "Bello",
    loginId: "ADM005",
    admissionNumber: "ADM005",
    gender: "MALE",
    dateOfBirth: "2009-02-10",
    phoneNumber: "",
    email: "",
    profileImageUrl: "",
    status: "INACTIVE",
    admissionStatus: "TRANSFERRED",
    currentClassId: "class-ss2",
    currentClass: "SS 2",
    currentArmId: "arm-b",
    currentArm: "B",
    enrollmentDate: "2023-09-11",
    qrToken: "qr-student-5",
    lastLoginAt: null,
    createdAt: "2023-09-11T08:00:00.000Z",
  },
  {
    id: "student-6",
    userId: "user-student-6",
    schoolId: "school-1",
    firstName: "Aisha",
    surName: "Garba",
    loginId: "ADM006",
    admissionNumber: "ADM006",
    gender: "FEMALE",
    dateOfBirth: "2008-08-19",
    phoneNumber: "",
    email: "",
    profileImageUrl: "",
    status: "INACTIVE",
    admissionStatus: "GRADUATED",
    currentClassId: "class-ss3",
    currentClass: "SS 3",
    currentArmId: "arm-a",
    currentArm: "A",
    enrollmentDate: "2022-09-12",
    qrToken: "qr-student-6",
    lastLoginAt: null,
    createdAt: "2022-09-12T08:00:00.000Z",
  },
];

/* ============================================================
   STARTER PARENTS
   This represents the future Parent table.
============================================================ */

const starterParents = [
  {
    id: "parent-1",
    schoolId: "school-1",
    firstName: "Musa",
    surName: "Ibrahim",
    phoneNumber: "08012345678",
    email: "musa.ibrahim@example.com",
    userId: "user-parent-1",
    accountStatus: "ACTIVE",
  },
  {
    id: "parent-2",
    schoolId: "school-1",
    firstName: "Aisha",
    surName: "Musa",
    phoneNumber: "08123456789",
    email: "",
    userId: "user-parent-2",
    accountStatus: "ACTIVE",
  },
];

/* ============================================================
   STARTER PARENT-STUDENT RELATIONSHIPS
   This represents the future ParentStudent table.
============================================================ */

const starterParentLinks = [
  {
    id: "parent-link-1",
    schoolId: "school-1",
    parentId: "parent-1",
    studentId: "student-1",
    relationship: "FATHER",
  },
  {
    id: "parent-link-2",
    schoolId: "school-1",
    parentId: "parent-1",
    studentId: "student-2",
    relationship: "FATHER",
  },
  {
    id: "parent-link-3",
    schoolId: "school-1",
    parentId: "parent-2",
    studentId: "student-2",
    relationship: "MOTHER",
  },
];

const classes = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

const arms = ["A", "B", "C", "D"];

const relationshipOptions = [
  ["FATHER", "Father"],
  ["MOTHER", "Mother"],
  ["GUARDIAN", "Guardian"],
  ["OTHER", "Other"],
];

const blankForm = {
  firstName: "",
  surName: "",
  admissionNumber: "",
  gender: "MALE",
  dateOfBirth: "",
  currentClassId: "",
  currentClass: "",
  currentArm: "",
  enrollmentDate: "",
  email: "",
  phoneNumber: "",
  admissionStatus: "ACTIVE",
};

/* ============================================================
   MAIN PAGE
============================================================ */

export default function StudentManagement() {
  const [students, setStudents] = useState(() => loadStudents());
  const [configuredClasses, setConfiguredClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [createStudentError, setCreateStudentError] = useState("");
  const [studentActionMessage, setStudentActionMessage] = useState("");
  const [parents, setParents] = useState(() => loadParents());
  const [parentLinks, setParentLinks] = useState(() =>
    loadParentLinks()
  );

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modal, setModal] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [menu, setMenu] = useState(null);

  const [form, setForm] = useState(blankForm);

  const [showCsvModal, setShowCsvModal] = useState(false);
  const csvInputRef = useRef(null);

  const [copied, setCopied] = useState("");

  const [parentModal, setParentModal] = useState(null);
  const [parentSearch, setParentSearch] = useState("");

  const permissions = {
    ADMIN: {
      canCreate: true,
      canEdit: true,
      canChangeStatus: true,
      canView: true,
      canManageParents: true,
    },
  };

  const currentPermissions = permissions.ADMIN;

  const loadConfiguredClasses = useCallback(async () => {
    try {
      const response = await getClasses();
      setConfiguredClasses(extractConfiguredClasses(response));
      setClassesError("");
    } catch (requestError) {
      setClassesError(
        requestError?.response?.data?.message ||
          "Unable to load configured classes.",
      );
    } finally {
      setClassesLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getClasses()
      .then((response) => {
        if (active) setConfiguredClasses(extractConfiguredClasses(response));
      })
      .catch((requestError) => {
        if (active) {
          setClassesError(
            requestError?.response?.data?.message ||
              "Unable to load configured classes.",
          );
        }
      })
      .finally(() => {
        if (active) setClassesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(
      parentsStorageKey,
      JSON.stringify(parents)
    );
  }, [parents]);

  useEffect(() => {
    localStorage.setItem(
      parentLinksStorageKey,
      JSON.stringify(parentLinks)
    );
  }, [parentLinks]);

  /* ============================================================
     FILTERING
  ============================================================ */

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const fullName =
        `${student.firstName} ${student.surName}`.toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        student.admissionNumber
          ?.toLowerCase()
          .includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.phoneNumber?.toLowerCase().includes(query);

      const matchesClass =
        classFilter === "ALL" ||
        student.currentClass === classFilter;

      const matchesGender =
        genderFilter === "ALL" ||
        student.gender === genderFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        student.admissionStatus === statusFilter;

      return (
        matchesSearch &&
        matchesClass &&
        matchesGender &&
        matchesStatus
      );
    });
  }, [
    students,
    search,
    classFilter,
    genderFilter,
    statusFilter,
  ]);

  /* ============================================================
     SUMMARY
  ============================================================ */

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) =>
      student.admissionStatus === "ACTIVE" &&
      student.status === "ACTIVE"
  ).length;

  const studentsWithParents = students.filter((student) =>
    parentLinks.some(
      (link) => link.studentId === student.id
    )
  ).length;

  const studentsWithoutParents =
    totalStudents - studentsWithParents;

  /* ============================================================
     PARENT HELPERS
  ============================================================ */

  const getStudentParents = (studentId) => {
    return parentLinks
      .filter((link) => link.studentId === studentId)
      .map((link) => {
        const parent = parents.find(
          (item) => item.id === link.parentId
        );

        if (!parent) return null;

        return {
          ...parent,
          relationship: link.relationship,
          linkId: link.id,
        };
      })
      .filter(Boolean);
  };

  const getParentStudentCount = (parentId) => {
    return parentLinks.filter(
      (link) => link.parentId === parentId
    ).length;
  };

  /* ============================================================
     ACTIONS
  ============================================================ */

  const openCreateModal = () => {
    setForm(blankForm);
    setSelectedStudent(null);
    setCreateStudentError("");
    setStudentActionMessage("");
    setModal("create");
    setMenu(null);
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setModal("view");
    setMenu(null);
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);

    setForm({
      firstName: student.firstName || "",
      surName: student.surName || "",
      admissionNumber: student.admissionNumber || "",
      gender: student.gender || "MALE",
      dateOfBirth: student.dateOfBirth || "",
      currentClass: student.currentClass || "",
      currentArm: student.currentArm || "",
      enrollmentDate: student.enrollmentDate || "",
      email: student.email || "",
      phoneNumber: student.phoneNumber || "",
      admissionStatus: student.admissionStatus || "ACTIVE",
    });

    setModal("edit");
    setMenu(null);
  };

  const handleFormChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    if (modal === "create") setCreateStudentError("");
  };

  const handleCreateStudent = async (event) => {
    event.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.surName.trim() ||
      !form.admissionNumber.trim() ||
      !form.gender ||
      !form.dateOfBirth ||
      !form.currentClassId ||
      !form.enrollmentDate
    ) {
      setCreateStudentError("Complete all required student details before creating the student.");
      return;
    }

    const admissionNumber = form.admissionNumber
      .trim()
      .toUpperCase();

    setCreatingStudent(true);
    setCreateStudentError("");
    try {
      const response = await createStudent({
        firstName: form.firstName.trim(),
        surName: form.surName.trim(),
        admissionNumber,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        currentClassId: form.currentClassId,
        enrollmentDate: form.enrollmentDate,
      });
      setStudentActionMessage(response?.message || "Student created successfully.");
      setModal(null);
      setForm(blankForm);
    } catch (requestError) {
      setCreateStudentError(
        requestError?.response?.data?.message ||
          "Unable to create the student. Please review the details and try again.",
      );
    } finally {
      setCreatingStudent(false);
    }
  };

  const handleEditStudent = (event) => {
    event.preventDefault();

    if (!selectedStudent) return;

    const admissionNumber = form.admissionNumber
      .trim()
      .toUpperCase();

    const duplicate = students.some(
      (student) =>
        student.id !== selectedStudent.id &&
        student.admissionNumber.toLowerCase() ===
          admissionNumber.toLowerCase()
    );

    if (duplicate) {
      alert(
        "Another student already uses this admission number."
      );
      return;
    }

    setStudents((previous) =>
      previous.map((student) => {
        if (student.id !== selectedStudent.id) {
          return student;
        }

        return {
          ...student,
          firstName: form.firstName.trim(),
          surName: form.surName.trim(),

          admissionNumber,
          loginId: admissionNumber,

          gender: form.gender,
          dateOfBirth: form.dateOfBirth || null,

          currentClass: form.currentClass,
          currentArm: form.currentArm,

          enrollmentDate: form.enrollmentDate || null,

          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),

          admissionStatus: form.admissionStatus,

          status:
            form.admissionStatus === "ACTIVE"
              ? "ACTIVE"
              : "INACTIVE",
        };
      })
    );

    setModal(null);
    setSelectedStudent(null);
  };

  const toggleStudentStatus = (student) => {
    const nextStatus =
      student.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setStudents((previous) =>
      previous.map((item) =>
        item.id === student.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );

    setMenu(null);
  };

  const copyAdmissionNumber = async (student) => {
    try {
      await navigator.clipboard.writeText(
        student.admissionNumber
      );

      setCopied(student.id);

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch {
      // Clipboard unavailable.
    }

    setMenu(null);
  };

  /* ============================================================
     PARENT ACTIONS
  ============================================================ */

  const openParentModal = (student) => {
    setSelectedStudent(student);
    setParentSearch("");
    setParentModal("manage");
  };

  const closeParentModal = () => {
    setParentModal(null);
    setParentSearch("");
  };

  const linkExistingParent = (parent, relationship) => {
    if (!selectedStudent) return;

    const alreadyLinked = parentLinks.some(
      (link) =>
        link.studentId === selectedStudent.id &&
        link.parentId === parent.id
    );

    if (alreadyLinked) {
      alert("This parent is already linked to this student.");
      return;
    }

    const newLink = {
      id: crypto.randomUUID(),
      schoolId: "school-1",
      parentId: parent.id,
      studentId: selectedStudent.id,
      relationship,
    };

    setParentLinks((previous) => [
      ...previous,
      newLink,
    ]);

    setParentModal(null);
    setParentSearch("");
  };

  const createAndLinkParent = ({
    firstName,
    surName,
    phoneNumber,
    email,
    relationship,
  }) => {
    if (!selectedStudent) return;

    const normalizedPhone = phoneNumber.trim();

    if (!normalizedPhone) {
      alert("Parent phone number is required.");
      return;
    }

    const existingParent = parents.find(
      (parent) =>
        parent.phoneNumber.replace(/\s/g, "") ===
        normalizedPhone.replace(/\s/g, "")
    );

    if (existingParent) {
      const alreadyLinked = parentLinks.some(
        (link) =>
          link.studentId === selectedStudent.id &&
          link.parentId === existingParent.id
      );

      if (alreadyLinked) {
        alert(
          "This parent is already linked to this student."
        );
        return;
      }

      setParentLinks((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          schoolId: "school-1",
          parentId: existingParent.id,
          studentId: selectedStudent.id,
          relationship,
        },
      ]);

      setParentModal(null);
      return;
    }

    const newParent = {
      id: crypto.randomUUID(),
      schoolId: "school-1",
      firstName: firstName.trim(),
      surName: surName.trim(),
      phoneNumber: normalizedPhone,
      email: email.trim(),
      userId: crypto.randomUUID(),
      accountStatus: "ACTIVE",
    };

    const newLink = {
      id: crypto.randomUUID(),
      schoolId: "school-1",
      parentId: newParent.id,
      studentId: selectedStudent.id,
      relationship,
    };

    setParents((previous) => [
      ...previous,
      newParent,
    ]);

    setParentLinks((previous) => [
      ...previous,
      newLink,
    ]);

    setParentModal(null);
  };

  const unlinkParent = (linkId) => {
    if (!window.confirm(
      "Unlink this parent from the student?"
    )) {
      return;
    }

    setParentLinks((previous) =>
      previous.filter((link) => link.id !== linkId)
    );
  };

  /* ============================================================
     CSV
  ============================================================ */

  const downloadCsvTemplate = () => {
    const csv =
      "firstName,surName,admissionNumber,gender,dateOfBirth,currentClass,currentArm,enrollmentDate,email,phoneNumber\n" +
      ",,,,,,,,,\n";

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "scholanode-student-template.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleCsvSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    console.log("Selected student CSV:", file);

    /*
      Backend CSV parsing/import will be connected later.

      Parent information is intentionally NOT included in the
      student CSV. Parent relationships are handled separately
      because one parent can have multiple students.
    */

    event.target.value = "";
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1600px]">
        <Link
          to="/administration"
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

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                Academic records
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Student Management
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-blue-100">
                Manage student records, admission numbers, class placement,
                parent relationships, and student account status from one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowCsvModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15"
              >
                <Upload size={18} />
                Import CSV
              </button>

              {currentPermissions.canCreate && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-[#071A52] shadow-sm transition hover:bg-cyan-300"
                >
                  <Plus size={18} />
                  Add student
                </button>
              )}
            </div>
          </div>
        </section>

        <header className="mt-8 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
              Student directory
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">
              School student records
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-500">
            Search students, review class placement, and keep parent
            relationships organised across the school.
          </p>
        </header>

        {studentActionMessage && (
          <div role="status" className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <span>{studentActionMessage}</span>
            <button
              type="button"
              onClick={() => setStudentActionMessage("")}
              aria-label="Dismiss message"
              className="rounded-lg p-1 hover:bg-emerald-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Total students"
            value={totalStudents}
          />

          <SummaryCard
            icon={UserCheck}
            label="Active students"
            value={activeStudents}
            highlight
          />

          <SummaryCard
            icon={UserRound}
            label="With parents"
            value={studentsWithParents}
          />

          <SummaryCard
            icon={UserPlus}
            label="No parent linked"
            value={studentsWithoutParents}
          />
        </div>

        <section className="mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
                Directory filters
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-[#071A52]">
                Find a student
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-72">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name or admission no."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <SelectFilter
                value={classFilter}
                onChange={setClassFilter}
                options={["ALL", ...classes]}
                allLabel="All classes"
              />

              <SelectFilter
                value={genderFilter}
                onChange={setGenderFilter}
                options={["ALL", "MALE", "FEMALE"]}
                allLabel="All genders"
                formatter={formatGender}
              />

              <SelectFilter
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  "ALL",
                  "ACTIVE",
                  "GRADUATED",
                  "TRANSFERRED",
                  "WITHDRAWN",
                ]}
                allLabel="All statuses"
                formatter={formatAdmissionStatus}
              />
            </div>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className={thClass}>Student</th>
                  <th className={thClass}>Admission No.</th>
                  <th className={thClass}>Class</th>
                  <th className={thClass}>Arm</th>
                  <th className={thClass}>Gender</th>
                  <th className={thClass}>Parents</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Account</th>
                  <th className={`${thClass} text-right`}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      parentCount={
                        getStudentParents(student.id).length
                      }
                      menu={menu}
                      setMenu={setMenu}
                      copied={copied}
                      onView={openViewModal}
                      onEdit={openEditModal}
                      onToggleStatus={toggleStudentStatus}
                      onCopy={copyAdmissionNumber}
                      onManageParents={openParentModal}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filteredStudents.length === 0 ? (
              <EmptyState />
            ) : (
              filteredStudents.map((student) => (
                <MobileStudentCard
                  key={student.id}
                  student={student}
                  parentCount={
                    getStudentParents(student.id).length
                  }
                  menu={menu}
                  setMenu={setMenu}
                  copied={copied}
                  onView={openViewModal}
                  onEdit={openEditModal}
                  onToggleStatus={toggleStudentStatus}
                  onCopy={copyAdmissionNumber}
                  onManageParents={openParentModal}
                />
              ))
            )}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:px-5">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredStudents.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {students.length}
            </span>{" "}
            students
          </div>
        </section>
      </div>

      {/* Student modal */}
      {(modal === "create" ||
        modal === "edit" ||
        modal === "view") && (
        <StudentModal
          mode={modal}
          student={selectedStudent}
          form={form}
          classes={configuredClasses}
          classesLoading={classesLoading}
          classesError={classesError}
          onRetryClasses={() => {
            setClassesLoading(true);
            void loadConfiguredClasses();
          }}
          saving={creatingStudent}
          createError={createStudentError}
          onChange={handleFormChange}
          onClose={() => {
            if (creatingStudent) return;
            setModal(null);
            setSelectedStudent(null);
          }}
          onSubmit={
            modal === "create"
              ? handleCreateStudent
              : handleEditStudent
          }
          parents={
            selectedStudent
              ? getStudentParents(selectedStudent.id)
              : []
          }
          onManageParents={() => {
            if (selectedStudent) {
              openParentModal(selectedStudent);
            }
          }}
        />
      )}

      {/* Parent modal */}
      {parentModal === "manage" && selectedStudent && (
        <ParentLinkModal
          student={selectedStudent}
          parents={parents}
          linkedParents={getStudentParents(selectedStudent.id)}
          parentSearch={parentSearch}
          setParentSearch={setParentSearch}
          onClose={closeParentModal}
          onLinkExisting={linkExistingParent}
          onCreateAndLink={createAndLinkParent}
          onUnlink={unlinkParent}
          getParentStudentCount={getParentStudentCount}
        />
      )}

      {/* CSV modal */}
      {showCsvModal && (
        <CsvImportModal
          onClose={() => setShowCsvModal(false)}
          onDownloadTemplate={downloadCsvTemplate}
          onChooseFile={() => csvInputRef.current?.click()}
        />
      )}

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleCsvSelect}
        className="hidden"
      />
    </main>
  );
}

/* ============================================================
   STUDENT ROW
============================================================ */

function StudentRow({
  student,
  parentCount,
  menu,
  setMenu,
  copied,
  onView,
  onEdit,
  onToggleStatus,
  onCopy,
  onManageParents,
}) {
  const isOpen = menu === student.id;

  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar student={student} />

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-800">
              {student.firstName} {student.surName}
            </p>

            {student.email ? (
              <p className="truncate text-xs text-slate-500">
                {student.email}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Student account
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onCopy(student)}
          className="group inline-flex items-center gap-2 font-mono text-sm font-semibold text-[#0A2463]"
          title="Copy admission number"
        >
          {student.admissionNumber}

          {copied === student.id ? (
            <Check size={14} className="text-emerald-600" />
          ) : (
            <Copy
              size={13}
              className="opacity-0 transition group-hover:opacity-100"
            />
          )}
        </button>
      </td>

      <td className="px-5 py-4 text-sm text-slate-700">
        {student.currentClass || "—"}
      </td>

      <td className="px-5 py-4 text-sm text-slate-700">
        {student.currentArm || "—"}
      </td>

      <td className="px-5 py-4">
        <span className="text-sm text-slate-700">
          {formatGender(student.gender)}
        </span>
      </td>

      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onManageParents(student)}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#0A2463] transition hover:bg-[#0A2463]/5"
        >
          <Users size={15} />

          {parentCount === 0
            ? "Add parent"
            : `${parentCount} ${
                parentCount === 1 ? "parent" : "parents"
              }`}
        </button>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={student.admissionStatus} />
      </td>

      <td className="px-5 py-4">
        <AccountStatusBadge status={student.status} />
      </td>

      <td className="px-5 py-4 text-right">
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={() =>
              setMenu(isOpen ? null : student.id)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            title="Actions"
          >
            <MoreVertical size={18} />
          </button>

          {isOpen && (
            <ActionMenu
              student={student}
              onView={onView}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onCopy={onCopy}
              onManageParents={onManageParents}
            />
          )}
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   MOBILE CARD
============================================================ */

function MobileStudentCard({
  student,
  parentCount,
  menu,
  setMenu,
  copied,
  onView,
  onEdit,
  onToggleStatus,
  onCopy,
  onManageParents,
}) {
  const isOpen = menu === student.id;

  return (
    <div className="relative p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar student={student} />

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-800">
              {student.firstName} {student.surName}
            </p>

            <button
              type="button"
              onClick={() => onCopy(student)}
              className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#0A2463]"
            >
              {student.admissionNumber}

              {copied === student.id ? (
                <Check size={12} className="text-emerald-600" />
              ) : (
                <Copy size={11} />
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setMenu(isOpen ? null : student.id)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <MoreVertical size={18} />
          </button>

          {isOpen && (
            <ActionMenu
              student={student}
              onView={onView}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onCopy={onCopy}
              onManageParents={onManageParents}
            />
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3">
        <DetailItem
          label="Class"
          value={student.currentClass || "—"}
        />

        <DetailItem
          label="Arm"
          value={student.currentArm || "—"}
        />

        <DetailItem
          label="Gender"
          value={formatGender(student.gender)}
        />

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Status
          </p>

          <div className="mt-1">
            <StatusBadge status={student.admissionStatus} />
          </div>
        </div>

        <div className="col-span-2 border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={() => onManageParents(student)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A2463]"
          >
            <Users size={16} />

            {parentCount === 0
              ? "Add parent / guardian"
              : `${parentCount} ${
                  parentCount === 1
                    ? "parent / guardian"
                    : "parents / guardians"
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ACTION MENU
============================================================ */

function ActionMenu({
  student,
  onView,
  onEdit,
  onToggleStatus,
  onCopy,
  onManageParents,
}) {
  return (
    <div className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
      <button
        type="button"
        onClick={() => onView(student)}
        className={menuItem}
      >
        <Eye size={16} />
        View student
      </button>

      <button
        type="button"
        onClick={() => onEdit(student)}
        className={menuItem}
      >
        <Edit3 size={16} />
        Edit student
      </button>

      <button
        type="button"
        onClick={() => onManageParents(student)}
        className={menuItem}
      >
        <Users size={16} />
        Manage parents
      </button>

      <button
        type="button"
        onClick={() => onCopy(student)}
        className={menuItem}
      >
        <Copy size={16} />
        Copy admission no.
      </button>

      <div className="my-1 border-t border-slate-100" />

      <button
        type="button"
        onClick={() => onToggleStatus(student)}
        className={`${menuItem} ${
          student.status === "ACTIVE"
            ? "text-amber-700 hover:bg-amber-50"
            : "text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {student.status === "ACTIVE" ? (
          <>
            <Ban size={16} />
            Deactivate account
          </>
        ) : (
          <>
            <UserCheck size={16} />
            Activate account
          </>
        )}
      </button>
    </div>
  );
}

/* ============================================================
   STUDENT MODAL
============================================================ */

function StudentModal({
  mode,
  student,
  form,
  classes: configuredClasses,
  classesLoading,
  classesError,
  onRetryClasses,
  saving,
  createError,
  onChange,
  onClose,
  onSubmit,
  parents,
  onManageParents,
}) {
  const isView = mode === "view";
  const isCreate = mode === "create";

  if (isView) {
    return (
      <ModalShell
        title="Student details"
        description="View the student's school, account, and parent information."
        onClose={onClose}
        width="max-w-4xl"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center">
            <Avatar student={student} size="lg" />

            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-[#071A52]">
                {student.firstName} {student.surName}
              </h3>

              <p className="mt-1 font-mono text-sm font-semibold text-[#0A2463]">
                {student.admissionNumber}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={student.admissionStatus} />
                <AccountStatusBadge status={student.status} />
              </div>
            </div>
          </div>

          {/* Student information */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-[#071A52]">
              Student information
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailBox
                label="Full name"
                value={`${student.firstName} ${student.surName}`}
              />

              <DetailBox
                label="Admission number"
                value={student.admissionNumber}
              />

              <DetailBox
                label="Class"
                value={student.currentClass || "—"}
              />

              <DetailBox
                label="Arm"
                value={student.currentArm || "—"}
              />

              <DetailBox
                label="Gender"
                value={formatGender(student.gender)}
              />

              <DetailBox
                label="Date of birth"
                value={formatDate(student.dateOfBirth)}
              />

              <DetailBox
                label="Enrollment date"
                value={formatDate(student.enrollmentDate)}
              />

              <DetailBox
                label="Email"
                value={student.email || "Not provided"}
              />

              <DetailBox
                label="Phone number"
                value={student.phoneNumber || "Not provided"}
              />

              <DetailBox
                label="Last login"
                value={formatDateTime(student.lastLoginAt)}
              />
            </div>
          </div>

          {/* Parents */}
          <section className="border-t border-slate-200 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#071A52]">
                  Parents / Guardians
                </h4>

                <p className="mt-0.5 text-xs text-slate-500">
                  Parents are linked separately and can be shared
                  across multiple students.
                </p>
              </div>

              <button
                type="button"
                onClick={onManageParents}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#071A52]"
              >
                <Plus size={15} />
                Manage parents
              </button>
            </div>

            {parents.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <Users
                  size={20}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  No parent linked
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  You can link an existing parent or create a new
                  parent record.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {parents.map((parent) => (
                  <div
                    key={parent.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2463]/10 text-[#0A2463]">
                      <UserRound size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">
                        {parent.firstName} {parent.surName}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} />
                          {parent.phoneNumber}
                        </span>

                        {parent.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail size={12} />
                            {parent.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {formatRelationship(parent.relationship)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Login */}
          <InfoBox
            icon={<UserPlus size={17} />}
            title="Student login"
          >
            <p>
              The student's <strong>admission number</strong> is also
              used as their login ID.
            </p>

            <p className="mt-1">
              Example:{" "}
              <span className="font-mono font-semibold">
                {student.admissionNumber}
              </span>
            </p>
          </InfoBox>

          <InfoBox
            icon={<ShieldCheck size={17} />}
            title="QR identity"
          >
            <p>
              The student's QR token is generated and managed by
              ScholaNode. It does not need to be entered manually.
            </p>
          </InfoBox>

          <div className="flex justify-end border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={secondaryButton}
            >
              Close
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title={isCreate ? "Add student" : "Edit student"}
      description={
        isCreate
          ? "Create a student account and school record."
          : "Update the student's school and profile information."
      }
      onClose={onClose}
      width="max-w-3xl"
    >
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          {/* Identity */}
          <section>
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[#071A52]">
                Student information
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Basic information used to identify the student.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="First name"
                required
                value={form.firstName}
                onChange={(value) =>
                  onChange("firstName", value)
                }
                placeholder="e.g. Ahmad"
              />

              <Field
                label="Surname"
                required
                value={form.surName}
                onChange={(value) =>
                  onChange("surName", value)
                }
                placeholder="e.g. Musa"
              />

              <Field
                label="Admission number"
                required
                value={form.admissionNumber}
                onChange={(value) =>
                  onChange("admissionNumber", value)
                }
                placeholder="e.g. ADM001"
              />

              <SelectField
                label="Gender"
                required
                value={form.gender}
                onChange={(value) =>
                  onChange("gender", value)
                }
                options={[
                  ["MALE", "Male"],
                  ["FEMALE", "Female"],
                ]}
              />

              <Field
                label="Date of birth"
                type="date"
                required={isCreate}
                value={form.dateOfBirth}
                onChange={(value) =>
                  onChange("dateOfBirth", value)
                }
              />

              <Field
                label="Enrollment date"
                type="date"
                required={isCreate}
                value={form.enrollmentDate}
                onChange={(value) =>
                  onChange("enrollmentDate", value)
                }
              />
            </div>
          </section>

          {/* Academic placement */}
          <section className="border-t border-slate-200 pt-5">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[#071A52]">
                Academic placement
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {isCreate
                  ? "Choose a configured class for the student's enrollment."
                  : "Assign the student to the current class and arm."}
              </p>
            </div>

            {isCreate ? (
              <div className="space-y-3">
                {classesError && (
                  <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    <p>{classesError}</p>
                    <button type="button" onClick={onRetryClasses} disabled={classesLoading} className="mt-2 font-bold underline disabled:opacity-50">
                      {classesLoading ? "Retrying…" : "Retry loading classes"}
                    </button>
                  </div>
                )}
                <SelectField
                  label="Class"
                  required
                  value={form.currentClassId}
                  onChange={(value) => onChange("currentClassId", value)}
                  options={configuredClasses.map((item) => [
                    item.id,
                    `${item.classLevel}${item.arm ? ` · ${item.arm}` : ""}`,
                  ])}
                  placeholder={classesLoading ? "Loading classes…" : "Select class"}
                  disabled={classesLoading || configuredClasses.length === 0}
                />
                {!classesLoading && !classesError && configuredClasses.length === 0 && (
                  <p className="text-sm text-amber-700">
                    No configured classes are available. Create classes in Academic Setup before enrolling a student.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  label="Current class"
                  required
                  value={form.currentClass}
                  onChange={(value) => onChange("currentClass", value)}
                  options={classes.map((item) => [item, item])}
                  placeholder="Select class"
                />

                <SelectField
                  label="Current arm"
                  required
                  value={form.currentArm}
                  onChange={(value) => onChange("currentArm", value)}
                  options={arms.map((item) => [item, `Arm ${item}`])}
                  placeholder="Select arm"
                />
              </div>
            )}
          </section>

          {/* Contact */}
          {!isCreate && <section className="border-t border-slate-200 pt-5">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[#071A52]">
                Contact information
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Optional student contact information.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) =>
                  onChange("email", value)
                }
                placeholder="student@example.com"
              />

              <Field
                label="Phone number"
                value={form.phoneNumber}
                onChange={(value) =>
                  onChange("phoneNumber", value)
                }
                placeholder="080..."
              />
            </div>
          </section>}

          {/* Status */}
          {!isCreate && (
            <section className="border-t border-slate-200 pt-5">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-[#071A52]">
                  Admission status
                </h3>
              </div>

              <SelectField
                label="Status"
                value={form.admissionStatus}
                onChange={(value) =>
                  onChange("admissionStatus", value)
                }
                options={[
                  ["ACTIVE", "Active"],
                  ["GRADUATED", "Graduated"],
                  ["TRANSFERRED", "Transferred"],
                  ["WITHDRAWN", "Withdrawn"],
                ]}
              />
            </section>
          )}

          <InfoBox
            icon={<UserPlus size={17} />}
            title="Login ID"
          >
            <p>
              ScholaNode will use the student's admission number as
              their login ID. Students do not receive a separate
              generated staff-style login ID.
            </p>
          </InfoBox>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
            {isCreate && createError && (
              <p role="alert" className="mr-auto whitespace-pre-line self-center text-sm text-rose-700">
                {createError}
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={secondaryButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || (isCreate && (classesLoading || configuredClasses.length === 0 || Boolean(classesError)))}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#071A52] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreate ? (
                <>
                  {saving ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
                  {saving ? "Creating student…" : "Add student"}
                </>
              ) : (
                <>
                  <Check size={17} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

/* ============================================================
   PARENT LINK MODAL
============================================================ */

function ParentLinkModal({
  student,
  parents,
  linkedParents,
  parentSearch,
  setParentSearch,
  onClose,
  onLinkExisting,
  onCreateAndLink,
  onUnlink,
  getParentStudentCount,
}) {
  const [mode, setMode] = useState("existing");

  const [relationship, setRelationship] =
    useState("FATHER");

  const [newParent, setNewParent] = useState({
    firstName: "",
    surName: "",
    phoneNumber: "",
    email: "",
  });

  const linkedIds = new Set(
    linkedParents.map((parent) => parent.id)
  );

  const query = parentSearch.trim().toLowerCase();

  const availableParents = parents.filter((parent) => {
    if (linkedIds.has(parent.id)) {
      return false;
    }

    if (!query) return true;

    const name =
      `${parent.firstName} ${parent.surName}`.toLowerCase();

    return (
      name.includes(query) ||
      parent.phoneNumber
        ?.toLowerCase()
        .includes(query) ||
      parent.email?.toLowerCase().includes(query)
    );
  });

  const handleCreate = (event) => {
    event.preventDefault();

    if (
      !newParent.firstName.trim() ||
      !newParent.surName.trim() ||
      !newParent.phoneNumber.trim()
    ) {
      return;
    }

    onCreateAndLink({
      ...newParent,
      relationship,
    });
  };

  return (
    <ModalShell
      title="Parents / Guardians"
      description={`Manage parents and guardians linked to ${student.firstName} ${student.surName}.`}
      onClose={onClose}
      width="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Student */}
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <Avatar student={student} />

          <div>
            <p className="font-semibold text-slate-800">
              {student.firstName} {student.surName}
            </p>

            <p className="font-mono text-xs text-[#0A2463]">
              {student.admissionNumber}
            </p>
          </div>
        </div>

        {/* Current parents */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#071A52]">
                Linked parents / guardians
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                The same parent can be linked to multiple students.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {linkedParents.length}
            </span>
          </div>

          {linkedParents.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <Users
                size={21}
                className="mx-auto text-slate-400"
              />

              <p className="mt-2 text-sm font-semibold text-slate-700">
                No parent linked yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Search for an existing parent or create a new one
                below.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {linkedParents.map((parent) => (
                <div
                  key={parent.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2463]/10 text-[#0A2463]">
                    <UserRound size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800">
                        {parent.firstName} {parent.surName}
                      </p>

                      <span className="rounded-full bg-[#0A2463]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0A2463]">
                        {formatRelationship(
                          parent.relationship
                        )}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Phone size={12} />
                        {parent.phoneNumber}
                      </span>

                      {parent.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail size={12} />
                          {parent.email}
                        </span>
                      )}

                      <span>
                        {getParentStudentCount(parent.id)}{" "}
                        {getParentStudentCount(parent.id) === 1
                          ? "child"
                          : "children"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUnlink(parent.linkId)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <Unlink size={14} />
                    Unlink
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add/link */}
        <section className="border-t border-slate-200 pt-5">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                mode === "existing"
                  ? "bg-white text-[#0A2463] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Link existing parent
            </button>

            <button
              type="button"
              onClick={() => setMode("new")}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                mode === "new"
                  ? "bg-white text-[#0A2463] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Create new parent
            </button>
          </div>

          {mode === "existing" ? (
            <div className="mt-4 space-y-4">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={parentSearch}
                  onChange={(event) =>
                    setParentSearch(event.target.value)
                  }
                  placeholder="Search by parent name, phone, or email"
                  className={inputClass("pl-10")}
                />
              </div>

              <div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Relationship
                  </span>

                  <div className="relative">
                    <select
                      value={relationship}
                      onChange={(event) =>
                        setRelationship(event.target.value)
                      }
                      className={inputClass(
                        "appearance-none pr-10"
                      )}
                    >
                      {relationshipOptions.map(
                        ([value, label]) => (
                          <option
                            key={value}
                            value={value}
                          >
                            {label}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </label>
              </div>

              {availableParents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                  <UserRound
                    size={20}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    No matching parent found
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    You can create a new parent instead.
                  </p>

                  <button
                    type="button"
                    onClick={() => setMode("new")}
                    className="mt-3 text-xs font-semibold text-[#0A2463] hover:underline"
                  >
                    Create new parent
                  </button>
                </div>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {availableParents.map((parent) => (
                    <div
                      key={parent.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-[#0A2463]/20 hover:bg-slate-50 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A2463]/10 text-[#0A2463]">
                        <UserRound size={17} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">
                          {parent.firstName} {parent.surName}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Phone size={12} />
                            {parent.phoneNumber}
                          </span>

                          {parent.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail size={12} />
                              {parent.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onLinkExisting(
                            parent,
                            relationship
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0A2463] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#071A52]"
                      >
                        <Link2 size={14} />
                        Link
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleCreate}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  required
                  value={newParent.firstName}
                  onChange={(value) =>
                    setNewParent((previous) => ({
                      ...previous,
                      firstName: value,
                    }))
                  }
                  placeholder="e.g. Musa"
                />

                <Field
                  label="Surname"
                  required
                  value={newParent.surName}
                  onChange={(value) =>
                    setNewParent((previous) => ({
                      ...previous,
                      surName: value,
                    }))
                  }
                  placeholder="e.g. Ibrahim"
                />

                <Field
                  label="Phone number"
                  required
                  value={newParent.phoneNumber}
                  onChange={(value) =>
                    setNewParent((previous) => ({
                      ...previous,
                      phoneNumber: value,
                    }))
                  }
                  placeholder="08012345678"
                />

                <Field
                  label="Email"
                  type="email"
                  value={newParent.email}
                  onChange={(value) =>
                    setNewParent((previous) => ({
                      ...previous,
                      email: value,
                    }))
                  }
                  placeholder="Optional"
                />
              </div>

              <SelectField
                label="Relationship"
                required
                value={relationship}
                onChange={setRelationship}
                options={relationshipOptions}
              />

              <InfoBox
                icon={<ShieldCheck size={17} />}
                title="Parent account"
              >
                <p>
                  The parent's phone number will be used as their
                  login ID. Email is optional and can be used for
                  account communication when available.
                </p>
              </InfoBox>

              <div className="flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#071A52]"
                >
                  <UserPlus size={17} />
                  Create and link parent
                </button>
              </div>
            </form>
          )}
        </section>

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={secondaryButton}
          >
            Done
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   CSV MODAL
============================================================ */

function CsvImportModal({
  onClose,
  onDownloadTemplate,
  onChooseFile,
}) {
  return (
    <ModalShell
      title="Import students from CSV"
      description="Add many student records at once using a CSV file."
      onClose={onClose}
      width="max-w-2xl"
    >
      <div className="space-y-5">
        <InfoBox
          icon={<FileSpreadsheet size={18} />}
          title="How CSV import works"
        >
          <p>
            CSV import saves time when adding many students. Instead
            of completing the student form one person at a time, you
            can prepare your entire student list in Excel, Google
            Sheets, or another spreadsheet app, then save or export
            the spreadsheet as a CSV file and upload it here.
          </p>
        </InfoBox>

        <div className="grid gap-3 sm:grid-cols-3">
          <CsvStep
            number="1"
            title="Prepare"
            description="Enter your student records in a spreadsheet."
          />

          <CsvStep
            number="2"
            title="Save as CSV"
            description="Export or save the spreadsheet as a CSV file."
          />

          <CsvStep
            number="3"
            title="Upload"
            description="Upload the CSV file to ScholaNode."
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-bold text-[#071A52]">
            Student columns
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "firstName",
              "surName",
              "admissionNumber",
              "gender",
              "dateOfBirth",
              "currentClass",
              "currentArm",
              "enrollmentDate",
              "email",
              "phoneNumber",
            ].map((column) => (
              <span
                key={column}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs text-slate-700"
              >
                {column}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">
            Important
          </p>

          <p className="mt-1 leading-6">
            CSV is the upload format used by ScholaNode. Excel,
            Google Sheets, and other spreadsheet applications are
            tools you can use to prepare the data.
          </p>

          <p className="mt-2 leading-6">
            Admission numbers must be unique within the school.
            Student login IDs are created from those admission
            numbers automatically.
          </p>

          <p className="mt-2 leading-6">
            Parent information is not included in the student CSV.
            Parent relationships are managed separately because one
            parent can have multiple students.
          </p>
        </div>

        <div className="rounded-2xl border border-[#0A2463]/10 bg-[#0A2463]/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#0A2463]"
            />

            <div>
              <p className="text-sm font-semibold text-[#071A52]">
                Safe bulk import
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                ScholaNode should validate the complete CSV before
                creating student records. If the file contains
                invalid or duplicate records, the import should fail
                without creating a partial batch.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={17} />
            Download CSV template
          </button>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className={secondaryButton}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onChooseFile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2463] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#071A52]"
            >
              <Upload size={17} />
              Choose CSV file
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function SummaryCard({ icon: Icon, label, value, highlight = false }) {
  return (
    <div
      className={`rounded-3xl border bg-white p-5 shadow-sm ${
        highlight
          ? "border-emerald-200 bg-emerald-50/20"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight
              ? "bg-emerald-50 text-emerald-700"
              : "bg-[#0A2463]/10 text-[#0A2463]"
          }`}
        >
          {Icon ? <Icon size={19} /> : null}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p
            className={`mt-1 text-xl font-extrabold ${
              highlight ? "text-emerald-700" : "text-[#071A52]"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function Avatar({ student, size = "md" }) {
  const initials =
    `${student?.firstName?.[0] || ""}${student?.surName?.[0] || ""}`.toUpperCase();

  const sizes =
    size === "lg"
      ? "h-16 w-16 text-lg"
      : "h-10 w-10 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-[#0A2463]/10 font-bold text-[#0A2463] ${sizes}`}
    >
      {student?.profileImageUrl ? (
        <img
          src={student.profileImageUrl}
          alt=""
          className="h-full w-full rounded-xl object-cover"
        />
      ) : (
        initials || <Users size={17} />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    ACTIVE: {
      label: "Active",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    GRADUATED: {
      label: "Graduated",
      className:
        "bg-blue-50 text-blue-700 border-blue-100",
    },
    TRANSFERRED: {
      label: "Transferred",
      className:
        "bg-amber-50 text-amber-700 border-amber-100",
    },
    WITHDRAWN: {
      label: "Withdrawn",
      className:
        "bg-rose-50 text-rose-700 border-rose-100",
    },
  };

  const item = config[status] || {
    label: status || "Unknown",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function AccountStatusBadge({ status }) {
  const active = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        active
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function InfoBox({ icon, title, children }) {
  return (
    <div className="rounded-2xl border border-[#0A2463]/10 bg-[#0A2463]/5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-[#0A2463]">
          {icon}
        </div>

        <div className="text-xs leading-5 text-slate-600">
          <p className="font-bold text-[#071A52]">
            {title}
          </p>

          <div className="mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required = false,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass()}
      />
    </label>
  );
}

function SelectField({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          disabled={disabled}
          className={inputClass(
            `appearance-none pr-10 ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`
          )}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}

          {options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
  allLabel,
  formatter = (value) => value,
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass(
          "appearance-none pr-10"
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "ALL"
              ? allLabel
              : formatter(option)}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function CsvStep({ number, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2463] text-sm font-bold text-white">
        {number}
      </div>

      <h4 className="mt-3 text-sm font-bold text-[#071A52]">
        {title}
      </h4>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Users size={21} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700">
        No students found
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        Try changing your search or filters, or add a new student
        to the school.
      </p>
    </div>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  children,
  width = "max-w-xl",
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#071A52]/60 p-4 backdrop-blur-[2px]">
      <div
        className={`my-8 w-full overflow-hidden rounded-3xl bg-white shadow-2xl ${width}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#071A52]">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

const thClass =
  "px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400";

const menuItem =
  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50";

const secondaryButton =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

function inputClass(extra = "") {
  return `h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0A2463] focus:ring-2 focus:ring-[#0A2463]/10 ${extra}`;
}

function formatGender(value) {
  if (value === "MALE") return "Male";
  if (value === "FEMALE") return "Female";
  return value || "—";
}

function formatAdmissionStatus(value) {
  const labels = {
    ACTIVE: "Active",
    GRADUATED: "Graduated",
    TRANSFERRED: "Transferred",
    WITHDRAWN: "Withdrawn",
  };

  return labels[value] || value || "Unknown";
}

function formatRelationship(value) {
  const labels = {
    FATHER: "Father",
    MOTHER: "Mother",
    GUARDIAN: "Guardian",
    OTHER: "Other",
  };

  return labels[value] || value || "Parent";
}

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractConfiguredClasses(response) {
  const payload = response?.data?.data ?? response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  const records = Array.isArray(data.classes)
    ? data.classes
    : Array.isArray(data.data?.classes)
      ? data.data.classes
      : [];

  return records
    .map((item) => ({
      id: item.id ?? item._id ?? item.classId ?? "",
      classLevel: item.classLevel ?? item.levelName ?? item.name ?? "",
      arm: item.arm || null,
    }))
    .filter((item) => item.id && item.classLevel);
}

function loadStudents() {
  try {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Fall back to starter data.
  }

  return starterStudents;
}

function loadParents() {
  try {
    const saved = localStorage.getItem(parentsStorageKey);

    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Fall back to starter data.
  }

  return starterParents;
}

function loadParentLinks() {
  try {
    const saved = localStorage.getItem(
      parentLinksStorageKey
    );

    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Fall back to starter data.
  }

  return starterParentLinks;
}