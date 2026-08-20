import { FormField } from "../common/common-form";

export const memberFormFields: FormField[] = [
  {
    name: "name",
    label: "Họ và tên",
    type: "text",
    placeholder: "Nhập họ và tên đầy đủ",
    required: true,
    gridColumn: "span 2",
  },
  {
    name: "birthDate",
    label: "Ngày sinh",
    type: "date",
  },
  {
    name: "gender",
    label: "Giới tính",
    type: "select",
    required: true,
    options: [
      { value: "Nam", label: "Nam" },
      { value: "Nữ", label: "Nữ" },
    ],
  },
  {
    name: "parish",
    label: "Xã Đạo",
    type: "text",
  },
  {
    name: "church",
    label: "Thánh Thất",
    type: "text",
    required: true,
  },
  {
    name: "branch",
    label: "Ngành",
    type: "select",
    options: [
      { value: "Đồng", label: "Ngành Đồng (Cấp 1)" },
      { value: "Thiếu", label: "Ngành Thiếu (Cấp 2)" },
      { value: "Thanh", label: "Ngành Thanh (Cấp 3)" },
    ],
  },
  {
    name: "startDate",
    label: "Ngày bắt đầu",
    type: "date",
  },
  {
    name: "fatherName",
    label: "Tên cha",
    type: "text",
  },
  {
    name: "motherName",
    label: "Tên mẹ",
    type: "text",
  },
  {
    name: "address",
    label: "Địa chỉ",
    type: "textarea",
    gridColumn: "span 2",
  },
  {
    name: "group",
    label: "Hàng/Đội/Toán",
    type: "text",
    placeholder: "Nhập Hàng/Đội/Toán",
    gridColumn: "span 2",
  },
  {
    name: "contact",
    label: "Số điện thoại",
    type: "textarea",
    gridColumn: "span 2",
  },
  {
    name: "status",
    label: "Trạng thái",
    type: "select",
    required: true,
    defaultValue: "ACTIVE",
    options: [
      {
        value: "ACTIVE",
        label: "Đang sinh hoạt",
      },
      {
        value: "INACTIVE",
        label: "Ngừng sinh hoạt",
      },
      {
        value: "PROMOTED",
        label: "Đã lên ngành",
      },
    ],
    gridColumn: "span 2",
  },
{
  name: "promotionDate",
  label: "Ngày lên ngành",
  type: "date",
  gridColumn: "span 2",
  dependsOn: {
    field: "status",
    value: "PROMOTED",
  },
}
];
