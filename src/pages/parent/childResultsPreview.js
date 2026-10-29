// Preview responses for the child results page. Replace fetchChildResults with the
// parent results endpoint when it ships; the UI consumes the shape returned here.

export const RESULT_TERMS = [
  { sessionName: "2025/2026", termName: "FIRST_TERM" },
  { sessionName: "2025/2026", termName: "SECOND_TERM" },
];

const SUBJECTS = [
  ["English Language", 78],
  ["Mathematics", 84],
  ["Basic Science", 76],
  ["Social Studies", 81],
  ["Civic Education", 88],
  ["Computer Studies", 91],
  ["Agricultural Science", 74],
];

const GRADE_REMARKS = {
  A: "Excellent",
  B: "Very good",
  C: "Good",
  D: "Fair",
  E: "Needs improvement",
  F: "Poor",
};

function hashString(value) {
  return String(value || "")
    .split("")
    .reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) % 9973, 7);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function gradeFor(score) {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchChildResults({ studentId, termName }) {
  await delay(400);

  const term =
    RESULT_TERMS.find((item) => item.termName === termName) || RESULT_TERMS[0];
  const seed = hashString(`${studentId}:${term.termName}`);
  const termBoost = term.termName === "SECOND_TERM" ? 2 : 0;

  const subjects = SUBJECTS.map(([subjectName, base], index) => {
    const total = clamp(
      base + termBoost + ((seed >> (index % 8)) % 7) - 3,
      35,
      99
    );
    const ca1 = clamp(Math.round(total * 0.18) + ((seed + index) % 3), 0, 20);
    const ca2 = clamp(Math.round(total * 0.18), 0, 20);
    const exam = clamp(total - ca1 - ca2, 0, 60);
    const sum = ca1 + ca2 + exam;
    const grade = gradeFor(sum);

    return {
      subjectId: `preview-subject-${index + 1}`,
      subjectName,
      ca1,
      ca2,
      exam,
      total: sum,
      grade,
      remark: GRADE_REMARKS[grade],
    };
  });

  const average =
    Math.round(
      (subjects.reduce((sum, subject) => sum + subject.total, 0) /
        subjects.length) *
        10
    ) / 10;
  const grade = gradeFor(average);

  return {
    term,
    summary: {
      subjectCount: subjects.length,
      average,
      grade,
      gradeRemark: GRADE_REMARKS[grade],
      position: 1 + (seed % 5),
      classSize: 28 + (seed % 9),
    },
    subjects,
    teacherRemark:
      average >= 80
        ? "An excellent term overall. Keep up the consistency and focus."
        : average >= 70
          ? "A strong term overall. A little more attention in the weaker subjects will push the next result higher."
          : average >= 60
            ? "A fair term overall. Regular revision will help improve the weaker subjects."
            : "More support is needed this term. Please review the subjects below with your child.",
  };
}
