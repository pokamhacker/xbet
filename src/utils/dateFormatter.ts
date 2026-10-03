/**
 * Utilitaire de formatage et de normalisation des dates de paris
 * Format strict : JJ.MM.AAAA (HH:mm) ou JJ.MM.AA (HH:mm)
 * Exemple : "02.10.2026 (04:13)"
 */

export const formatBetDate = (dateInput?: string | Date | number | null): string => {
  if (!dateInput) return '';

  const currentYear = new Date().getFullYear();

  // Si c'est déjà une chaîne
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();

    // Cas 1 : Format court sans année ex: "02.10 (04:13)" ou "2.10 (4:13)"
    if (/^(\d{1,2}\.\d{1,2})\s*\((.*)\)$/.test(trimmed)) {
      return trimmed.replace(
        /^(\d{1,2}\.\d{1,2})\s*\((.*)\)$/,
        (_match, datePart, timePart) => {
          const [d, m] = datePart.split('.');
          const day = d.padStart(2, '0');
          const month = m.padStart(2, '0');
          return `${day}.${month}.${currentYear} (${timePart})`;
        }
      );
    }

    // Cas 2 : Format déjà complet ex: "02.10.2026 (04:13)" ou "02.10.26 (04:13)"
    if (/^\d{1,2}\.\d{1,2}\.\d{2,4}\s*\(.*\)$/.test(trimmed)) {
      return trimmed;
    }

    // Cas 3 : Format date seule sans heure ex: "02.10"
    if (/^(\d{1,2}\.\d{1,2})$/.test(trimmed)) {
      const [d, m] = trimmed.split('.');
      return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${currentYear}`;
    }
  }

  // Conversion en Date JS
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    // Si la conversion échoue, tentative avec regex générique
    return String(dateInput).replace(
      /^(\d{1,2}\.\d{1,2})\s*\((.*)\)$/,
      `$1.${currentYear} ($2)`
    );
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} (${hours}:${minutes})`;
};

export default formatBetDate;
