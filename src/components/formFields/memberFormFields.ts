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
    name: "startYear",
    label: "Năm bắt đầu",
    type: "number",
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
    name: "contact",
    label: "Số điện thoại",
    type: "textarea",
    gridColumn: "span 2",
  },
  {
    name: "active",
    label: "Trạng thái hoạt động",
    type: "switch",
    defaultValue: true,
    gridColumn: "span 2",
    disabled: true,
  },
];