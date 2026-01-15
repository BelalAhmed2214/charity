import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
	children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			navigate("/login");
		}
	}, [isAuthenticated, isLoading, navigate]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg text-gray-600">Loading...</div>
			</div>
		);
	}

	return isAuthenticated ? <>{children}</> : null;
}

interface AdminRouteProps {
	children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
	const { isAuthenticated, isLoading, role } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated) {
				navigate("/login");
			} else if (role !== "admin") {
				navigate("/dashboard");
			}
		}
	}, [isAuthenticated, isLoading, role, navigate]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg text-gray-600">Loading...</div>
			</div>
		);
	}

	return isAuthenticated && role === "admin" ? <>{children}</> : null;
}

export default ProtectedRoute;
