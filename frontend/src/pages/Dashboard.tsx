import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();

	const handleLogout = async () => {
		await logout();
	};

	return (
		<div className="p-8">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">Dashboard</h1>
					<p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
				</div>
				<div className="flex gap-3">
					<Button variant="outline" onClick={() => navigate("/patients")}>
						Patients
					</Button>
					<Button variant="outline" onClick={() => navigate("/profile")}>
						Profile
					</Button>
					<Button
						className="text-white"
						variant="destructive"
						onClick={handleLogout}>
						Logout
					</Button>
				</div>
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
