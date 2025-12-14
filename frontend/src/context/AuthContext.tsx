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
	login: (phone: string, password: string) => Promise<void>;
	register: (
		name: string,
		phone: string,
		password: string,
		email?: string
	) => Promise<void>;
	logout: () => Promise<void>;
	refreshToken: () => Promise<void>;
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
					const userData = await authAPI.getUser();
					setUser(userData);
				} catch (error) {
					console.error("Failed to fetch user:", error);
					setToken(null);
					setUser(null);
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
			navigate("/dashboard");
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	};

	const register = async (
		name: string,
		phone: string,
		password: string,
		email?: string
	) => {
		try {
			const response = await authAPI.register({
				name,
				phone,
				email,
				password,
				password_confirmation: password,
			});
			setToken(response.token);
			setUser(response.user);
			navigate("/dashboard");
		} catch (error) {
			console.error("Registration failed:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await authAPI.logout();
			setToken(null);
			setUser(null);
			navigate("/login");
		} catch (error) {
			console.error("Logout failed:", error);
			// Still clear local state even if API call fails
			setToken(null);
			setUser(null);
			navigate("/login");
		}
	};

	const refreshToken = async () => {
		try {
			const response = await authAPI.refreshToken();
			setToken(response.token);
		} catch (error) {
			console.error("Token refresh failed:", error);
			setToken(null);
			setUser(null);
			navigate("/login");
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isLoading,
				isAuthenticated: !!token && !!user,
				login,
				register,
				logout,
				refreshToken,
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
