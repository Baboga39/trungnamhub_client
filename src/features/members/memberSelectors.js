// Tổng số đoàn sinh
export const selectTotalMembers = (state) => state.members.members.length;

// Phân theo giới tính (Nam / Nữ)
export const selectTotalMembersThisYear = (state) => {
  const currentYear = new Date().getFullYear();

  return state.members.members.filter((member) => {
    if (!member.startDate) return false;

    const [day, month, year] = member.startDate.split("/");

    return Number(year) === currentYear;
  }).length;
};
// Số đoàn sinh Đang sinh hoạt
export const selectActiveMembers = (state) => {
  return state.members.members.filter((member) => member.active === true).length;
  console.log(state.members.members);
};

// Số đoàn sinh theo giáo xứ đông nhất
export const selectMaxParish = (state) => {
  const parishCount = {};


  state.members.members.forEach((member) => {
    const parish = member.parish || "Không rõ";
    parishCount[parish] = (parishCount[parish] || 0) + 1;
  });

  let maxParish = null;
  let maxCount = 0;

  Object.entries(parishCount).forEach(([parish, count]) => {
    if (count > maxCount) {
      maxParish = parish;
      maxCount = count;
    }
  });

  return { parish: maxParish, count: maxCount };
};
