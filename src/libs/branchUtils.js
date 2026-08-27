const BRANCH_MAPPING = [
  { id: "1", names: ["1", "ngành ấu", "ấu", "au", "nganh au"] },
  { id: "2", names: ["2", "ngành thiếu", "thiếu", "thieu", "nganh thieu"] },
  { id: "3", names: ["3", "ngành nghĩa", "nghĩa", "nghia", "nganh nghia"] },
  { id: "4", names: ["4", "ngành hiệp", "hiệp", "hiep", "nganh hiep"] },
  { id: "5", names: ["5", "ban trưởng", "trưởng", "huynh truong", "bht"] },
];

export function normalizeBranchId(branchVal) {
  if (branchVal === null || branchVal === undefined) return "";
  const str = String(branchVal).trim().toLowerCase();
  for (const b of BRANCH_MAPPING) {
    if (b.id === str || b.names.some((n) => n === str)) {
      return b.id;
    }
  }
  return str;
}

export function isSameBranch(b1, b2) {
  if (!b1 && !b2) return true;
  if (!b1 || !b2) return false;
  const n1 = normalizeBranchId(b1);
  const n2 = normalizeBranchId(b2);
  if (n1 && n2 && n1 === n2) return true;
  return String(b1).trim().toLowerCase() === String(b2).trim().toLowerCase();
}

export function checkIsAdmin(user) {
  if (!user || !user.role) return false;
  const roleStr = String(user.role).trim().toLowerCase();
  return roleStr.includes("admin");
}

export function checkCanEdit(user, targetBranchId, targetBranchName) {
  if (checkIsAdmin(user)) return true;
  const userBranch = user?.branch || user?.branchId || "";
  if (!userBranch) return true; // If user has no branch restriction, allow edit by default
  if (isSameBranch(userBranch, targetBranchId)) return true;
  if (targetBranchName && isSameBranch(userBranch, targetBranchName)) return true;
  return false;
}
