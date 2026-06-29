import type { ClassRow } from "@/components/RoutineList";

export const offlineClasses: ClassRow[] = [
  { id: "offline-sun-1", day: "Sunday", subject: "Web Design", teacher: "CST Department", room: "CST Lab", start_time: "13:15:00", end_time: "14:00:00" },
  { id: "offline-sun-2", day: "Sunday", subject: "Operating System", teacher: "CST Department", room: "Room 302", start_time: "14:00:00", end_time: "14:45:00" },
  { id: "offline-sun-3", day: "Sunday", subject: "Database Management", teacher: "CST Department", room: "CST Lab", start_time: "14:45:00", end_time: "15:30:00" },
  { id: "offline-mon-1", day: "Monday", subject: "Software Engineering", teacher: "CST Department", room: "Room 302", start_time: "13:15:00", end_time: "14:00:00" },
  { id: "offline-mon-2", day: "Monday", subject: "Web Design", teacher: "CST Department", room: "CST Lab", start_time: "14:00:00", end_time: "14:45:00" },
  { id: "offline-mon-3", day: "Monday", subject: "Data Communication", teacher: "CST Department", room: "Room 302", start_time: "14:45:00", end_time: "15:30:00" },
  { id: "offline-tue-1", day: "Tuesday", subject: "Operating System", teacher: "CST Department", room: "CST Lab", start_time: "13:15:00", end_time: "14:00:00" },
  { id: "offline-tue-2", day: "Tuesday", subject: "Database Management", teacher: "CST Department", room: "Room 302", start_time: "14:00:00", end_time: "14:45:00" },
  { id: "offline-tue-3", day: "Tuesday", subject: "Computer Architecture", teacher: "CST Department", room: "Room 302", start_time: "14:45:00", end_time: "15:30:00" },
  { id: "offline-wed-1", day: "Wednesday", subject: "Web Design", teacher: "CST Department", room: "CST Lab", start_time: "13:15:00", end_time: "14:00:00" },
  { id: "offline-wed-2", day: "Wednesday", subject: "Software Engineering", teacher: "CST Department", room: "Room 302", start_time: "14:00:00", end_time: "14:45:00" },
  { id: "offline-wed-3", day: "Wednesday", subject: "Data Communication", teacher: "CST Department", room: "CST Lab", start_time: "14:45:00", end_time: "15:30:00" },
  { id: "offline-thu-1", day: "Thursday", subject: "Database Management", teacher: "CST Department", room: "Room 302", start_time: "13:15:00", end_time: "14:00:00" },
  { id: "offline-thu-2", day: "Thursday", subject: "Operating System", teacher: "CST Department", room: "CST Lab", start_time: "14:00:00", end_time: "14:45:00" },
  { id: "offline-thu-3", day: "Thursday", subject: "Web Design", teacher: "CST Department", room: "CST Lab", start_time: "14:45:00", end_time: "15:30:00" },
];

export function getOfflineClassesForDay(day: string): ClassRow[] {
  return offlineClasses.filter((item) => item.day === day);
}