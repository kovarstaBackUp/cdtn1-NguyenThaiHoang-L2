export function maskPhone(phone: string): string {
  if (phone.length <= 6) {
    return phone;
  }

  const firstThree = phone.slice(0, 3);
  const lastThree = phone.slice(-3);
  const masked = `${firstThree}****${lastThree}`;

  return masked;
}

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^0-9]/g, '').replace(/^84/, '0');

  if (!/^0\d{9}$/.test(digits)) {
    return null;
  }

  return digits;
}
