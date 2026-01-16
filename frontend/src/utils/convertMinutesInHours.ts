export function convertMinutesInHours(minutes: number): string {
  if (minutes < 0) return "00:00";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `00:${remainingMinutes}`;

  if (remainingMinutes === 0) return `0${hours}:00`;

  return `0${hours}:${remainingMinutes}`;
}
