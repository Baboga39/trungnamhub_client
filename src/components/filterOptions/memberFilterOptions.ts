interface Member {
  id: number;
  name: string;
  birthDate: string | null;
  gender: string;
  parish: string | null;
  church: string;
  startYear: number | null;
  fatherName: string | null;
  motherName: string | null;
  address: string | null;
  contact: string | null;
  active: boolean;
}
export const getMemberFilterOptions = (members: Member[]) => {
  return [
    {
      key: "gender",
      label: "Giới tính",
      options: [
        { value: "Nam", label: "Nam" },
        { value: "Nữ", label: "Nữ" },
      ],
    },
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { value: "ACTIVE", label: "Đang sinh hoạt" },
        { value: "PROMOTED", label: "Lên ngành" },
        { value: "INACTIVE", label: "Ngưng hoạt động" },
        
      ],
    },
    {
      key: "parish",
      label: "Xã Đạo",
      options: Array.from(
        new Set(members?.map((m) => m.parish).filter(Boolean))
      ).map((p) => ({
        value: p!,
        label: p!,
      })),
    },
    {
      key: "church",
      label: "Thánh Thất",
      options: Array.from(
        new Set(members?.map((m) => m.church).filter(Boolean))
      ).map((c) => ({
        value: c,
        label: c,
      })),
    },
  ];
};