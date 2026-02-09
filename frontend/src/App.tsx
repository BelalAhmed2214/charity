import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Login from "@/pages/Login";
import ChangePassword from "@/pages/ChangePassword";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Patients from "@/pages/Patients";
import PatientDetails from "@/pages/PatientDetails";
import Users from "@/pages/Users";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
	const { i18n } = useTranslation();

	useEffect(() => {
		document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
	}, [i18n.language]);

	return (
		<LanguageProvider>
			<QueryClientProvider client={queryClient}>
				<ErrorBoundary>
					<Router>
						<AuthProvider>
							<Routes>
								<Route path="/login" element={<Login />} />
								<Route
									path="/change-password"
									element={
										<ProtectedRoute allowPasswordChange={true}>
											<ChangePassword />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/dashboard"
									element={
										<ProtectedRoute>
											<Dashboard />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/profile"
									element={
										<ProtectedRoute>
											<Profile />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/patients"
									element={
										<ProtectedRoute>
											<Patients />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/patients/:id"
									element={
										<ProtectedRoute>
											<PatientDetails />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/users"
									element={
										<AdminRoute>
											<Users />
										</AdminRoute>
									}
								/>
								<Route path="/" element={<Navigate to="/login" replace />} />
							</Routes>
						</AuthProvider>
					</Router>
				</ErrorBoundary>
			</QueryClientProvider>
		</LanguageProvider>
	);
}

export default App;
