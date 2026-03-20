export function calculateTotalScoreDynamic(
  formData: any,
  categories: { id: number; name: string; weight: number }[],
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  const nameMap: Record<string, string> = {
    "Kiến thức": "knowledge",
    "Kỹ năng": "skill",
    "Chuyên cần": "attendance",
  };

  for (const cat of categories) {
    const key = nameMap[cat.name] ?? cat.name;

    const rawValue = formData[key];
    const value = parseFloat(String(rawValue ?? "").replace(/^0+/, "")) || 0;

    weightedSum += value * cat.weight;
    totalWeight += cat.weight;
  }

  const bonus = Number(formData.bonus) || 0;
  const penalty = Number(formData.penalty) || 0;
  const activityScore = Number(formData.activityScore) || 0;

  const avgScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  
  const finalScore = avgScore + bonus - penalty + activityScore;

  return parseFloat(finalScore.toFixed(1));
}

export function getRank(totalScore: number): string {
  if (totalScore >= 8) return "Xuất sắc";
  if (totalScore >= 6.5) return "Khá";
  if (totalScore >= 5.0) return "Trung bình";
  return "Yếu";
}

export function getRankColor(rank: string): string {
  switch (rank) {
    case "Xuất sắc":
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "Khá":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "Trung bình":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "Yếu":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
}
