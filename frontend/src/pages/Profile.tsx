import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Profile() {
	const { user, logout, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !user) {
			navigate("/login");
		}
	}, [user, isLoading, navigate]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg text-gray-600">Loading...</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	const handleLogout = async () => {
		await logout();
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						Profile
					</CardTitle>
					<CardDescription className="text-center">
						Your account information
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">Name</label>
						<div className="p-2 bg-gray-50 rounded border">{user.name}</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">Phone</label>
						<div className="p-2 bg-gray-50 rounded border">{user.phone}</div>
					</div>
					{user.email && (
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">Email</label>
							<div className="p-2 bg-gray-50 rounded border">{user.email}</div>
						</div>
					)}
					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-700">
							Member Since
						</label>
						<div className="p-2 bg-gray-50 rounded border">
							{new Date(user.created_at).toLocaleDateString()}
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex gap-2">
					<Button
						variant="outline"
						className="flex-1"
						onClick={() => navigate("/dashboard")}>
						Back to Dashboard
					</Button>
					<Button
						variant="destructive"
						className="flex-1"
						onClick={handleLogout}>
						Logout
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
