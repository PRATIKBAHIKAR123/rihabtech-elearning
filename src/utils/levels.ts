export interface Level {
  value: string;
  label: string;
}

export const LEVELS: Level[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
  { value: "all", label: "All Levels" }
];

// Helper function to get level label from value
export const getLevelLabel = (value?: string | null): string => {
  if (!value) return "";
  const level = LEVELS.find(lvl => lvl.value === value);
  return level ? level.label : value;
};

