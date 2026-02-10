// Whitewelpe.de – Über mich
// Aufgabe: Automatische Altersberechnung
// Geburtstag: 19.07.2002

document.addEventListener("DOMContentLoaded", () => {
  const alterElement = document.getElementById("alter");
  if (!alterElement) return;

  const geburtstag = new Date(2002, 6, 19); // Monat 0–11
  const heute = new Date();

  let alter = heute.getFullYear() - geburtstag.getFullYear();

  const hatteGeburtstag =
    heute.getMonth() > geburtstag.getMonth() ||
    (heute.getMonth() === geburtstag.getMonth() &&
     heute.getDate() >= geburtstag.getDate());

  if (!hatteGeburtstag) alter--;

  alterElement.textContent = `${alter} Jahre alt`;
});