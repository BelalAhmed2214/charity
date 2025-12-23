import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ApiErrorAlert } from "@/components/ApiErrorAlert";
import { type ApiError } from "@/types/api";
import { useTranslation } from "react-i18next";




export default function Login() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { login } = useAuth();
	const [error, setError] = useState<ApiError | null>(null);

	const loginSchema = z.object({
		phone: z.string().min(10, t("auth.validation.phoneMin")),
		password: z.string().min(6, t("auth.validation.passwordMin")),
	});

	type LoginFormValues = z.infer<typeof loginSchema>;

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormValues) => {
		try {
			setError(null);
			await login(data.phone, data.password);
		} catch (err: unknown) {
			const apiError = err as ApiError;
			setError(apiError);
			// Don't set field-level errors for login - security best practice
			// User shouldn't know which field is wrong
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						{t("auth.loginTitle")}
					</CardTitle>
					<CardDescription className="text-center">
						{t("auth.loginDescription")}
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="space-y-4">
						<ApiErrorAlert error={error} onDismiss={() => setError(null)} />
						<div className="space-y-2">
							<Label htmlFor="phone">{t("auth.phoneLabel")}</Label>
							<Input
								id="phone"
								type="tel"
								placeholder="01xxxxxxxxx"
								{...register("phone")}
							/>
							{errors.phone && (
								<p className="text-sm text-red-500">{errors.phone.message}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">{t("auth.passwordLabel")}</Label>
							<Input id="password" type="password" {...register("password")} />
							{errors.password && (
								<p className="text-sm text-red-500">
									{errors.password.message}
								</p>
							)}
						</div>
					</CardContent>
					<CardFooter className="flex flex-col gap-3">
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? t("auth.loggingIn") : t("auth.loginButton")}
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={() => navigate("/register")}>
							{t("auth.noAccount")}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
