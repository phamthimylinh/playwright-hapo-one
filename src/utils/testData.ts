export function randomString(prefix = '', length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${s}`;
}

export function sampleUser() {
  const name = `Test ${randomString('', 4)}`;
  const email = `test+${randomString('', 6)}@example.com`;
  return { name, email };
}
