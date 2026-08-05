// components/columns/memberColumns.tsx
import { User, Calendar, MapPin, Church, Users, Home, Phone } from "lucide-react";
import { Badge } from "../ui/badge";
import type { Column } from "../common/data-table";

// Member interface (có thể import từ types riêng nếu bạn muốn)
export interface Member {
  id: number;
  name: string;
  birthDate: string | null;
  gender: string;
  parish: string | null;
  church: string;
  fatherName: string | null;
  motherName: string | null;
  address: string | null;
  contact: string | null;
  active: boolean;
  promotionDate?: string | null;
  startDate: string | null;
  branch?: string | null;
  parents?: string;
}

export const mapMembersWithParents = (members: Member[]): Member[] =>
  members.map((m) => ({
    ...m,
    parents: `${m.fatherName || ""} ${m.motherName || ""}`.trim(),
  }));

// Format ngày sinh
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(date.getTime())) {
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
      }
    }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return "N/A";
  } catch {
    return "N/A";
  }
};

// Format số điện thoại
const formatContact = (contact: string | null) => {
  if (!contact)
    return <span className="text-slate-400 text-sm italic">Chưa có</span>;

  const contacts = contact
    .split(/[-,]/)
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-1">
      {contacts.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Phone className="h-3 w-3 text-slate-400" />
          <span className="text-sm text-slate-700">{c}</span>
        </div>
      ))}
    </div>
  );
};

// 👉 Đây chính là columns bạn export ra
export const memberColumns: Column<Member>[] = [
  {
    key: "name",
    label: "Họ và tên",
    width: 200,
    searchable: true,
    render: (member) => (
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm ${
            member.gender === "Nam"
              ? "bg-gradient-to-br from-blue-500 to-blue-600"
              : "bg-gradient-to-br from-pink-500 to-pink-600"
          }`}
        >
          <User className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{member.name}</span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            {member.gender === "Nam"
              ? "👨 Nam"
              : member.gender === "Nữ"
              ? "👩 Nữ"
              : "N/A"}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: "birthDate",
    label: "Ngày sinh",
    width: 130,
    render: (member) => (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
          <Calendar className="h-4 w-4 text-white" />
        </div>
        <span className="text-slate-700 font-medium text-sm">
          {formatDate(member.birthDate)}
        </span>
      </div>
    ),
  },
  {
    key: "parish",
    label: "Xã Đạo",
    width: 140,
    render: (member) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-slate-400" />
        <span className="text-slate-700">
          {member.parish || <span className="text-slate-400 italic">N/A</span>}
        </span>
      </div>
    ),
  },
  {
    key: "church",
    label: "Thánh Thất",
    width: 140,
    render: (member) => (
      <div className="flex items-center gap-2">
        <Church className="h-4 w-4 text-slate-400" />
        <span className="text-slate-700">{member.church}</span>
      </div>
    ),
  },
  {
    key: "branch",
    label: "Ngành",
    width: 130,
    searchable: true,
    render: (member) => (
      <div className="flex items-center gap-2">
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
          {member.branch || <span className="text-slate-400 italic">Chưa xếp</span>}
        </Badge>
      </div>
    ),
  },
  {
    key: "startDate",
    label: "Ngày bắt đầu",
    width: 140,
    render: (member) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span className="text-slate-700">
          {formatDate(member.startDate)}
        </span>
      </div>
    ),
  },
{
  key: "parents",
  label: "Phụ huynh",
  width: 200,
  searchable: true, // dựa vào member.parents
  render: (member) => (
    <div className="flex flex-col gap-1">
      {member.fatherName && (
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 text-blue-500" />
          <span className="text-sm text-slate-700">
            <span className="font-medium">Cha:</span> {member.fatherName}
          </span>
        </div>
      )}
      {member.motherName && (
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 text-pink-500" />
          <span className="text-sm text-slate-700">
            <span className="font-medium">Mẹ:</span> {member.motherName}
          </span>
        </div>
      )}
      {!member.fatherName && !member.motherName && (
        <span className="text-slate-400 text-sm italic">N/A</span>
      )}
    </div>
  ),
}
,
  {
    key: "address",
    label: "Địa chỉ",
    width: 220,
    searchable: true,

    render: (member) => (
      <div className="flex items-start gap-2">
        <Home className="h-4 w-4 text-slate-400 mt-0.5" />
        <span className="text-slate-700 text-sm leading-relaxed">
          {member.address || (
            <span className="text-slate-400 italic">N/A</span>
          )}
        </span>
      </div>
    ),
  },
  {
    key: "contact",
    label: "Liên hệ",
    width: 180,
    render: (member) => formatContact(member.contact),
  },
{
  key: "status",
  label: "Trạng thái",
  width: 150,
  render: (member) => {
 switch (member.status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Hoạt động
          </Badge>
        );

      case "PROMOTED":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            Lên ngành
          </Badge>
        );

      case "INACTIVE":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            Nghỉ
          </Badge>
        );
        

      default:
        return (
          <Badge variant="secondary">
            Không xác định
          </Badge>
        );
    }
  },
}
];
