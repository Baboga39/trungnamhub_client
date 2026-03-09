import { AdminLayout } from "../components/layouts/admin-layout"
import  StudentsTable  from "../components/tables/students-table"
import { MemberStatCards } from "@/features/members/MemberStatCards"
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton"
import { ReportCard } from "@/components/reports/report-card"
import ActivitiesTable from "@/components/tables/activitiesTable"

export default function ActivityPage() {
  return (
    <AdminLayout>
      <div className="space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between">
        
        </div>

        <ActivitiesTable/>
      </div>
      <ScrollToTopButton/>
    </AdminLayout>
  )
}

