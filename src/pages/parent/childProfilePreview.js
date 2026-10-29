// Placeholder details for child fields the school does not expose yet.
// Replace with the child profile endpoint when it ships; the page consumes this shape.

function hashString(value) {
  return String(value || "")
    .split("")
    .reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) % 9973, 7);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getChildProfilePreview(child) {
  const seed = hashString(child?.id || "child");
  const first = slugify(child?.firstName) || "student";
  const last = slugify(child?.surName) || "profile";
  const birthYear = 2010 + (seed % 6);
  const birthMonth = String(1 + (seed % 9)).padStart(2, "0");
  const birthDay = String(1 + (seed % 27)).padStart(2, "0");

  return {
    email: `${first}.${last}@student.example`,
    phoneNumber: `+234 80${seed % 10} 000 0000`,
    address: "12 School Road, Dutse",
    gender: "Not specified",
    dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
  };
}

export async function saveChildProfilePreview({ studentId, ...changes }) {
  await delay(500);

  return { success: true, studentId, changes };
}
