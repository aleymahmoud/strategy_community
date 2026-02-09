// Membership colors used across the app
export const membershipColors: Record<string, { bg: string; text: string }> = {
  PREMIUM: { bg: "bg-amber-100", text: "text-amber-700" },
  CORE_MEMBER: { bg: "bg-blue-100", text: "text-blue-700" },
  FREQUENT_GUEST: { bg: "bg-green-100", text: "text-green-700" },
  GUEST: { bg: "bg-gray-100", text: "text-gray-700" },
  POTENTIAL_GUEST: { bg: "bg-purple-100", text: "text-purple-700" },
  GRAY: { bg: "bg-slate-100", text: "text-slate-600" },
};

export function formatMembership(value: string | null): string {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// Attendee status colors
export const statusColors: Record<string, string> = {
  INVITED: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-blue-100 text-blue-700",
  DECLINED: "bg-red-100 text-red-600",
  TENTATIVE: "bg-orange-100 text-orange-700",
  ATTENDED: "bg-green-100 text-green-700",
  ABSENT: "bg-yellow-100 text-yellow-700",
};

// --- Scoring System ---

const levelScores: Record<string, number> = {
  BELOW: 1,
  EQUAL: 2,
  ABOVE: 3,
};

const experienceScores: Record<string, number> = {
  JUNIOR: 1,
  MED_LEVEL: 2,
  SENIOR: 3,
  EXPERT: 4,
};

export function calculateMemberScore(member: {
  level?: string | null;
  communication?: number | null;
  experience?: string | null;
}): number | null {
  const levelVal = member.level ? levelScores[member.level] : null;
  const commVal = member.communication;
  const expVal = member.experience ? experienceScores[member.experience] : null;

  if (levelVal == null || commVal == null || expVal == null) return null;

  return levelVal + commVal + expVal;
}

export function classifyTableScore(avgScore: number): {
  label: string;
  emoji: string;
  color: string;
} {
  if (avgScore >= 8)
    return { label: "Strong", emoji: "\uD83D\uDFE2", color: "text-green-600" };
  if (avgScore >= 5.5)
    return { label: "Balanced", emoji: "\uD83D\uDFE1", color: "text-amber-600" };
  return { label: "Needs Support", emoji: "\uD83D\uDD34", color: "text-red-600" };
}

export function checkTableImbalance(scores: number[]): boolean {
  if (scores.length < 2) return false;
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  return max - min > 5;
}

export const membershipOrder = [
  "PREMIUM",
  "CORE_MEMBER",
  "FREQUENT_GUEST",
  "GUEST",
  "POTENTIAL_GUEST",
  "GRAY",
];
