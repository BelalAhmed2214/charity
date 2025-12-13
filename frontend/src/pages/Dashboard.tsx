import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate("/login");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Active Patients</h2>
          <p className="text-3xl font-bold text-green-600">567</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2">Pending Requests</h2>
          <p className="text-3xl font-bold text-orange-600">89</p>
        </div>
      </div>
    </div>
  );
}
