/**
 * Convert a PKR amount into words for the "Inwords" box of the Sales Tax
 * Invoice print, e.g. 277132.5 ->
 * "Two Lakh Seventy Seven Thousand One Hundred Thirty Two Rupees and Fifty Paisa Only".
 * Uses Pakistani numbering (Thousand / Lakh / Crore / Arab).
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

/** Words for a number from 0 to 999 ('' for 0). */
function underThousand(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)]);
    n %= 10;
  }
  if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(' ');
}

export function amountInWordsPKR(amount: number): string {
  if (!Number.isFinite(amount)) return '';
  const negative = amount < 0;
  const abs = Math.abs(amount);
  let rupees = Math.floor(abs);
  let paisa = Math.round((abs - rupees) * 100);
  if (paisa === 100) {
    rupees += 1;
    paisa = 0;
  }

  const scales: Array<[number, string]> = [
    [1e9, 'Arab'],
    [1e7, 'Crore'],
    [1e5, 'Lakh'],
    [1e3, 'Thousand'],
  ];
  const parts: string[] = [];
  let remainder = rupees;
  for (const [value, name] of scales) {
    if (remainder >= value) {
      const count = Math.floor(remainder / value);
      parts.push(`${underThousand(count)} ${name}`);
      remainder %= value;
    }
  }
  if (remainder > 0) {
    parts.push(underThousand(remainder));
  }
  if (parts.length === 0) {
    parts.push('Zero');
  }

  let out = `${negative ? 'Minus ' : ''}${parts.join(' ')} Rupees`;
  if (paisa > 0) {
    out += ` and ${underThousand(paisa)} Paisa`;
  }
  return `${out} Only`;
}
