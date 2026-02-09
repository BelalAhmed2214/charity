import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
	children: ReactNode;
	allowPasswordChange?: boolean;
}

export function ProtectedRoute({
	children,
	allowPasswordChange = false,
}: ProtectedRouteProps) {
	const { isAuthenticated, isLoading, needsPasswordChange } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated) {
				navigate("/login");
			} else if (needsPasswordChange && !allowPasswordChange) {
				// Redirect to change password if user must change password and route doesn't allow it
				navigate("/change-password");
			}
		}
	}, [
		isAuthenticated,
		isLoading,
		needsPasswordChange,
		allowPasswordChange,
		navigate,
	]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-lg text-gray-600">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	// If user needs to change password and this route doesn't allow it, don't render
	if (needsPasswordChange && !allowPasswordChange) {
		return null;
	}

	return <>{children}</>;
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
