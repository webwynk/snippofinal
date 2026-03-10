const userTimezoneOffset = 330; // +5:30 in minutes for IST

function backendFormatDateForUi(dateInput) {
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

const reqDateStr = "2026-03-12";
const backendDateLabel = backendFormatDateForUi(reqDateStr);

// Mock frontend date creation in IST
// new Date(yr, mn, d) uses local timezone. We will construct a date directly.
// In India, new Date(2026, 2, 12) gives a local midnight IST.
// Let's create exactly what local browser does in IST
const localMidnightIST = new Date('2026-03-11T18:30:00Z'); // This is Midnight IST on Mar 12

const frontendDateLabel = localMidnightIST.toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});

console.log("Req string:", reqDateStr);
console.log("Backend label:", backendDateLabel);
console.log("Frontend label:", frontendDateLabel);
console.log("Match?", backendDateLabel === frontendDateLabel);
