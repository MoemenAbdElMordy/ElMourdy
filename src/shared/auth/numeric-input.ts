/** Accept Arabic-Indic, Eastern Arabic-Indic and ASCII digits while keeping API identifiers ASCII. */
export function normalizeNumericInput(value: string, maxLength: number): string {
  return value
    .replace(/[\u0660-\u0669\u06f0-\u06f9]/g, digit => {
      const code = digit.charCodeAt(0);
      return String(code - (code <= 0x0669 ? 0x0660 : 0x06f0));
    })
    .replace(/[^0-9]/g, "")
    .slice(0, maxLength);
}

/** Preserve names while normalizing Arabic digits in phone-number searches. */
export function normalizeSearchTerm(value: string): string {
  return value.replace(/[\u0660-\u0669\u06f0-\u06f9]/g, digit => {
    const code = digit.charCodeAt(0);
    return String(code - (code <= 0x0669 ? 0x0660 : 0x06f0));
  }).trim();
}
