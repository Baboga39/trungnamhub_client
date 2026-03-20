import { FormField } from "../common/common-form";

export const activityFormFields: FormField[] = [
  {
    name: "name",
    label: "Tên hoạt động",
    type: "text",
    placeholder: "Nhập tên hoạt động",
    required: true,
    gridColumn: "span 2",
  },
  {
    name: "description",
    label: "Mô tả",
    type: "textarea",
    placeholder: "Nhập mô tả hoạt động",
    gridColumn: "span 2",
  },
  {
    name: "date",
    label: "Ngày hoạt động",
    type: "date",
    required: true,
  },
  {
    name: "year",
    label: "Năm",
    type: "number",
    disabled: true,
  },
  {
    name: "quarter",
    label: "Quý",
    type: "select",
    disabled: true,
    options: [
      { value: "1", label: "Quý 1" },
      { value: "2", label: "Quý 2" },
      { value: "3", label: "Quý 3" },
      { value: "4", label: "Quý 4" },
    ],
  },
];