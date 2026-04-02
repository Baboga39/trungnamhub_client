import PendingApprovalsTable from "@/components/tables/penddingApprovalsTable";
import { AdminLayout } from "../components/layouts/admin-layout";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";

export default function PendingApprovalsPage() {
  return (
    <AdminLayout>
      <div className="space-y-5 animate-fadeIn">
        <PendingApprovalsTable />
      </div>
      <ScrollToTopButton />
    </AdminLayout>
  );
}