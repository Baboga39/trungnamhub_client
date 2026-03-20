export const getScoreFilterOptions = (processedScores: any[]) => {
  return [
    {
      key: "rank",
      label: "Xếp loại",
      options: Array.from(
        new Set(processedScores.map((s) => s.rank))
      ).map((r) => ({
        value: r,
        label: r,
      })),
    },
    {
      key: "term",
      label: "Kỳ đánh giá",
      options: Array.from(
        new Set(processedScores.map((s) => `${s.quarter}_${s.year}`))
      ).map((t) => {
        const [quarter, year] = t.split("_");
        return {
          value: t,
          label: `Q${quarter} - ${year}`,
        };
      }),
    },
  ];
};