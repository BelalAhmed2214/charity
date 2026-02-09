import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import authAPI, { type UserResponse } from "@/api/auth";
import api from "@/api/axios";

interface AuthContextType {
	user: UserResponse | null;
	token: string | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	role: "admin" | "user" | "editor" | null;
	needsPasswordChange: boolean;
	login: (phone: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<UserResponse | null>(null);
	const [token, setToken] = useState<string | null>(
		localStorage.getItem("auth_token")
	);
	const [isLoading, setIsLoading] = useState(true);
	const [role, setRole] = useState<"admin" | "user" | "editor" | null>(null);
	const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
	const navigate = useNavigate();

	// Set authorization header when token changes
	useEffect(() => {
		if (token) {
			api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			localStorage.setItem("auth_token", token);
		} else {
			delete api.defaults.headers.common["Authorization"];
			localStorage.removeItem("auth_token");
		}
	}, [token]);

	// Check if user is logged in on mount
	useEffect(() => {
		const checkAuth = async () => {
			if (token) {
				try {
					const userData = await authAPI.getMe();
					setUser(userData);
					setRole(userData.role);
					setNeedsPasswordChange(userData.must_change_password || false);
				} catch (error) {
					console.error("Failed to fetch user:", error);
					setToken(null);
					setUser(null);
					setRole(null);
				}
			}
			setIsLoading(false);
		};

		checkAuth();
	}, [token]);

	const login = async (phone: string, password: string) => {
		try {
			const response = await authAPI.login({ phone, password });
			setToken(response.token);
			setUser(response.user);
			setRole(response.user.role);
			setNeedsPasswordChange(response.user.must_change_password || false);

			if (response.user.must_change_password) {
				navigate("/change-password");
			} else {
				navigate("/dashboard");
			}
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await authAPI.logout();
			setToken(null);
			setUser(null);
			setRole(null);
			setNeedsPasswordChange(false);
			navigate("/login");
		} catch (error) {
			console.error("Logout failed:", error);
			// Still clear local state even if API call fails
			setToken(null);
			setUser(null);
			setRole(null);
			setNeedsPasswordChange(false);
			navigate("/login");
		}
	};

	const changePassword = async (oldPassword: string, newPassword: string) => {
		try {
			await authAPI.changePassword({
				old_password: oldPassword,
				new_password: newPassword,
			});
			setNeedsPasswordChange(false);
			navigate("/dashboard");
		} catch (error) {
			console.error("Password change failed:", error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isLoading,
				isAuthenticated: !!token && !!user,
				role,
				needsPasswordChange,
				login,
				logout,
				changePassword,
			}}>
			{children}
		</AuthContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
