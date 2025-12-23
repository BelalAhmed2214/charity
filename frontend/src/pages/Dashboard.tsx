import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/api/stats";
import { Loader2 } from "lucide-react";
import { ApiErrorAlert } from "@/components/ApiErrorAlert";
import type { ApiError } from "@/types/api";
import type { Stats } from "@/api/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const {
		data: stats,
		isLoading,
		error,
	} = useQuery<Stats, ApiError>({
		queryKey: ["stats"],
		queryFn: () => statsApi.get(),
	});

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
			{error && (
				<div className="mb-6">
					<ApiErrorAlert error={error} />
				</div>
			)}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
					<h2 className="text-xl font-semibold mb-2">Total Patients</h2>
					<p className="text-3xl font-bold text-orange-600">
						{isLoading ? (
							<Loader2 className="h-6 w-6 animate-spin" />
						) : (
							stats?.total_patients.toLocaleString()
						)}
					</p>
				</div>

				<div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
					<h2 className="text-xl font-semibold mb-2">Pending Patients</h2>
					<p className="text-3xl font-bold text-green-600">
						{isLoading ? (
							<Loader2 className="h-6 w-6 animate-spin" />
						) : (
							stats?.pending_patients.toLocaleString()
						)}
					</p>
				</div>

				<div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
					<h2 className="text-xl font-semibold mb-2">Completed Patients</h2>
					<p className="text-3xl font-bold text-blue-600">
						{isLoading ? (
							<Loader2 className="h-6 w-6 animate-spin" />
						) : (
							stats?.completed_patients.toLocaleString()
						)}
					</p>
				</div>
			</div>

			<Card className="mt-8">
				<CardHeader>
					<CardTitle>Cost Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
						<div>
							<div className="text-sm text-muted-foreground">Total Costs</div>
							<div className="text-2xl font-bold">
								{isLoading ? (
									<Loader2 className="h-6 w-6 animate-spin" />
								) : (
									new Intl.NumberFormat("en-EG", {
										style: "currency",
										currency: "EGP",
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									}).format(stats?.total_costs ?? 0)
								)}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">
								Avg Cost / Patient
							</div>
							<div className="text-2xl font-bold">
								{isLoading ? (
									<Loader2 className="h-6 w-6 animate-spin" />
								) : (
									new Intl.NumberFormat("en-EG", {
										style: "currency",
										currency: "EGP",
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									}).format(stats?.avg_cost_per_patient ?? 0)
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
