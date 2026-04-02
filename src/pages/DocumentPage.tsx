import { AdminLayout } from "../components/layouts/admin-layout";
import DocumentsTable from "@/components/tables/documentsTable";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";

export default function DocumentsPage() {
  return (
    <AdminLayout>
      <div className="space-y-5 animate-fadeIn">
        <DocumentsTable />
      </div>
      <ScrollToTopButton />
    </AdminLayout>
  );
}