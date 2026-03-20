export const getActivityFilterOptions = (activities: any[]) => {
  return [
    {
      key: "quarter",
      label: "Quý",
      options: [
        { value: "1", label: "Quý 1" },
        { value: "2", label: "Quý 2" },
        { value: "3", label: "Quý 3" },
        { value: "4", label: "Quý 4" },
      ],
    },
    {
      key: "year",
      label: "Năm",
      options: Array.from(
        new Set(activities?.map((a) => a.year))
      ).map((y) => ({
        value: y?.toString(),
        label: y?.toString(),
      })),
    },
  ];
};