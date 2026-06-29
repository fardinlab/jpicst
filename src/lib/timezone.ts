// Bangladesh timezone helpers (Asia/Dhaka, UTC+6)
export const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] as const;
export type Day = typeof DAYS[number];

export function getBdParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]));
  return {
    weekday: parts.weekday as Day,
    dateStr: `${parts.weekday}, ${parts.month} ${parts.day}, ${parts.year}`,
    timeStr: `${parts.hour}:${parts.minute}:${parts.second}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    seconds: Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second),
  };
}

export function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function formatTime12(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')} ${period}`;
}

export function formatCountdown(totalSec: number) {
  if (totalSec <= 0) return '00:00:00';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map(n => n.toString().padStart(2, '0')).join(':');
}
