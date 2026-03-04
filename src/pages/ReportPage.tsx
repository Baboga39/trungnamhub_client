import { AdminLayout } from "../components/layouts/admin-layout"
import  StudentsTable  from "../components/tables/students-table"
import { MemberStatCards } from "@/features/members/MemberStatCards"
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton"
import { ReportCard } from "@/components/reports/report-card"

export default function ReportPage() {
  return (
    <AdminLayout>
      <div className="space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between">
        
        </div>

        <MemberStatCards/>
        <ReportCard />
      </div>
      <ScrollToTopButton/>
    </AdminLayout>
  )
}

