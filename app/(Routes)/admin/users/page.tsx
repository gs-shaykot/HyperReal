
import { AdminUsers } from "@/app/components/admin_component/users/AdminUsers";
import { getAdminUsers } from "@/utils/AdminUtils/getAdminUsers";

const UserPage = async () => {
    const usersData = await getAdminUsers({
        page: 1,
    });

    return (
        <div className="min-h-screen bg-main p-4 light:bg-white">
            <AdminUsers
                initialUsers={usersData.users}
                initialTotal={usersData.total}
                initialTotalPages={usersData.totalPages}
            />
        </div>
    );
};

export default UserPage;
