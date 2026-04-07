import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import memberApi from "@/api/memberApi";
import userApi from "@/api/userApi";
import { Loader2 } from "lucide-react";
import { CustomSelect } from "@/components/common/Customselect";
import { CustomMultiSelect } from "@/components/common/CustomMultiSelect";

interface InputField {
  key: string;
  label: string;
  type: string;
  options?: { label: string; value: string | number }[];
  defaultValue?: any;
}

interface Template {
  id: string;
  name: string;
  description: string;
  inputs: InputField[];
}

const inputClass =
  "w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 outline-none focus:border-blue-400 transition-all placeholder:text-slate-400";

export function DynamicReportForm({
  template,
  onSubmit,
  loading,
}: {
  template: Template;
  onSubmit: (data: any) => void;
  loading: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  const [members, setMembers] = useState<any[]>([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  useEffect(() => {
    const hasSelectMember = template.inputs.some((i) => i.type === "select-member");
    if (hasSelectMember) {
      setFetchingMembers(true);
      memberApi
        .getMembersActive()
        .then((res: any) => setMembers(res.data))
        .catch(console.error)
        .finally(() => setFetchingMembers(false));
    }

    const hasSelectUser = template.inputs.some((i) => i.type === "select-user");
    if (hasSelectUser) {
      setFetchingUsers(true);
      userApi
        .getAll()
        .then((res: any) => setUsers(res.data))
        .catch(console.error)
        .finally(() => setFetchingUsers(false));
    }

    template.inputs.forEach((input) => {
      if (input.defaultValue !== undefined) {
        setValue(input.key, input.defaultValue);
      }
    });
  }, [template, setValue]);

  const memberOptions = members.map((m) => ({
    label: m.name,
    sublabel: m.branch,
    value: m.id,
  }));

  const userOptions = users.map((u) => ({
    label: u.name,
    sublabel: u.email,
    value: u.email,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {template.inputs.map((input) => (
        <div key={input.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {input.label}
          </label>

          {/* Static select */}
          {input.type === "select" && (
            <Controller
              name={input.key}
              control={control}
              rules={{ required: "Vui lòng chọn" }}
              render={({ field }) => (
                <CustomSelect
                  options={input.options?.map((o) => ({ label: o.label, value: o.value })) ?? []}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="— Chọn một tùy chọn —"
                />
              )}
            />
          )}

          {/* Select member */}
          {input.type === "select-member" && (
            <Controller
              name={input.key}
              control={control}
              rules={{ required: "Vui lòng chọn đoàn sinh" }}
              render={({ field }) => (
                <CustomSelect
                  options={memberOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="— Chọn đoàn sinh —"
                  loading={fetchingMembers}
                  loadingText="Đang tải danh sách..."
                />
              )}
            />
          )}

          {/* Select user */}
          {input.type === "select-user" && (
            <Controller
              name={input.key}
              control={control}
              rules={{ required: "Vui lòng chọn ít nhất 1 người nhận", validate: val => val?.length > 0 || "Vui lòng chọn ít nhất 1 người nhận" }}
              render={({ field }) => (
                <CustomMultiSelect
                  options={userOptions}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="— Chọn người nhận —"
                  loading={fetchingUsers}
                  loadingText="Đang tải danh sách..."
                />
              )}
            />
          )}

          {/* Number */}
          {input.type === "number" && (
            <input
              type="number"
              {...register(input.key, { required: "Trường này bắt buộc", valueAsNumber: true })}
              className={inputClass}
            />
          )}

          {/* Text / Email */}
          {(input.type === "email" || input.type === "text") && (
            <input
              type={input.type}
              {...register(input.key, { required: "Trường này bắt buộc" })}
              className={inputClass}
            />
          )}

          {/* Error */}
          {errors[input.key] && (
            <p className="text-xs text-red-400 mt-0.5">
              {errors[input.key]?.message as string}
            </p>
          )}
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-colors"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Đang xử lý..." : "Chạy báo cáo"}
        </button>
      </div>
    </form>
  );
}