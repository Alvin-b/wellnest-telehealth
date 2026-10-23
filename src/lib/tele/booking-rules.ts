export function visitTimestamp(date: string, time: string) {
  return new Date(`${date}T${time}:00+03:00`).toISOString();
}

export function signupHasSession(session: unknown) {
  return session !== null && session !== undefined;
}