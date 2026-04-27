/**
 * ================================================================
 * MONTHLY SERVICE SCHEDULE - EASY TO UPDATE EACH MONTH
 * ================================================================
 *
 * HOW TO UPDATE:
 * 1. Change "monthEn" to the current month in English (e.g., "June 2026")
 * 2. Change "monthSr" to the current month in Serbian Cyrillic
 * 3. Update the services array with the current month's services
 *
 * For each service:
 *   - day:    the day number (e.g., "3", "10", "21")
 *   - dowEn:  day of week in English (e.g., "Saturday", "Sunday")
 *   - dowSr:  day of week in Serbian Cyrillic
 *   - time:   service time (e.g., "6:00 PM", "10:00 AM")
 *   - titleEn: service name in English
 *   - titleSr: service name in Serbian Cyrillic
 *
 * COMMON SERVICE NAMES:
 *   English                    Serbian Cyrillic
 *   Divine Liturgy             Света Литургија
 *   Great Vespers              Велико вечерње
 *   Matins                     Јутрење
 *   Vigil / All-Night Vigil    Бденије / Свеноћно бденије
 *   Akathist                   Акатист
 *   Moleben                    Молебан
 *   Memorial Service           Помен / Парастос
 *   Baptism                    Крштење
 *   Wedding                    Венчање
 *
 * ================================================================
 */

export const scheduleData = {
  gofundmeUrl: "https://www.gofundme.com/f/sa-verom-u-boga-obnova-hrama-i-ogradjivanje-crkvene-porte",
  monthEn: "May 2026",
  monthSr: "Мај 2026",
  services: [
    {
      day: "2",
      dowEn: "Saturday",
      dowSr: "Субота",
      time: "6:00 PM",
      titleEn: "Great Vespers",
      titleSr: "Велико вечерње",
    },
    {
      day: "3",
      dowEn: "Sunday",
      dowSr: "Недеља",
      time: "10:00 AM",
      titleEn: "Divine Liturgy",
      titleSr: "Света Литургија",
    },
    {
      day: "9",
      dowEn: "Saturday",
      dowSr: "Субота",
      time: "6:00 PM",
      titleEn: "Great Vespers",
      titleSr: "Велико вечерње",
    },
    {
      day: "10",
      dowEn: "Sunday",
      dowSr: "Недеља",
      time: "10:00 AM",
      titleEn: "Divine Liturgy",
      titleSr: "Света Литургија",
    },
    {
      day: "16",
      dowEn: "Saturday",
      dowSr: "Субота",
      time: "6:00 PM",
      titleEn: "Great Vespers",
      titleSr: "Велико вечерње",
    },
    {
      day: "17",
      dowEn: "Sunday",
      dowSr: "Недеља",
      time: "10:00 AM",
      titleEn: "Divine Liturgy",
      titleSr: "Света Литургија",
    },
    {
      day: "23",
      dowEn: "Saturday",
      dowSr: "Субота",
      time: "6:00 PM",
      titleEn: "Great Vespers",
      titleSr: "Велико вечерње",
    },
    {
      day: "24",
      dowEn: "Sunday",
      dowSr: "Недеља",
      time: "10:00 AM",
      titleEn: "Divine Liturgy",
      titleSr: "Света Литургија",
    },
    {
      day: "30",
      dowEn: "Saturday",
      dowSr: "Субота",
      time: "6:00 PM",
      titleEn: "Great Vespers",
      titleSr: "Велико вечерње",
    },
    {
      day: "31",
      dowEn: "Sunday",
      dowSr: "Недеља",
      time: "10:00 AM",
      titleEn: "Divine Liturgy",
      titleSr: "Света Литургија",
    },
  ],
};
