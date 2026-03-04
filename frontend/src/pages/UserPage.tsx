import { AdminLayout } from "../components/layouts/admin-layout"
import  StudentsTable  from "../components/tables/students-table"
import MembersTable from "../components/tables/memberTable"
import { MemberStatCards } from "@/features/members/MemberStatCards"
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton"
import UsersTable from "@/components/tables/usersTable"


export default function UserPage() {
  return (
    <AdminLayout>
      <div className="space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between">
        
        </div>

        <UsersTable />
      </div>
      <ScrollToTopButton/>
    </AdminLayout>
  )
}

