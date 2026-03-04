import { AdminLayout } from "../components/layouts/admin-layout"
import  StudentsTable  from "../components/tables/students-table"
import { MemberStatCards } from "@/features/members/MemberStatCards"
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton"
import ScoresTable from "@/components/tables/scoreTable"

export default function ScoresPage() {
  return (
    <AdminLayout>
      <div className="space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between">
        
        </div>

    
        <ScoresTable />
      </div>
      <ScrollToTopButton/>
    </AdminLayout>
  )
}

