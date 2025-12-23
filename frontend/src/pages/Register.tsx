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
import { getFieldErrors } from "@/utils/errors";
import { useTranslation } from "react-i18next";



export default function Register() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { register: registerUser } = useAuth();
	const [error, setError] = useState<ApiError | null>(null);

	const registerSchema = z
		.object({
			name: z.string().min(2, t("auth.validation.nameMin")),
			phone: z.string().min(10, t("auth.validation.phoneMin")),
			email: z
				.string()
				.email(t("auth.validation.emailInvalid"))
				.optional()
				.or(z.literal("")),
			password: z.string().min(6, t("auth.validation.passwordMin")),
			passwordConfirm: z
				.string()
				.min(6, t("auth.validation.passwordMin")),
		})
		.refine((data) => data.password === data.passwordConfirm, {
			message: t("auth.validation.passwordMismatch"),
			path: ["passwordConfirm"],
		});

	type RegisterFormValues = z.infer<typeof registerSchema>;

	const {
		register,
		handleSubmit,
		setError: setFormError,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterFormValues) => {
		try {
			setError(null);
			await registerUser(
				data.name,
				data.phone,
				data.password,
				data.email || undefined
			);
		} catch (err: unknown) {
			const apiError = err as ApiError;
			setError(apiError);
			
			// Set field-level errors for validation failures
			const fieldErrors = getFieldErrors(apiError);
			Object.entries(fieldErrors).forEach(([field, message]) => {
				setFormError(field as keyof RegisterFormValues, { message });
			});
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						{t("auth.registerTitle")}
					</CardTitle>
					<CardDescription className="text-center">
						{t("auth.registerDescription")}
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="space-y-4">
						<ApiErrorAlert error={error} onDismiss={() => setError(null)} />
						<div className="space-y-2">
							<Label htmlFor="name">{t("auth.fullNameLabel")}</Label>
							<Input
								id="name"
								type="text"
								placeholder="John Doe"
								{...register("name")}
							/>
							{errors.name && (
								<p className="text-sm text-red-500">{errors.name.message}</p>
							)}
						</div>
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
							<Label htmlFor="email">{t("auth.emailLabel")}</Label>
							<Input
								id="email"
								type="email"
								placeholder="john@example.com"
								{...register("email")}
							/>
							{errors.email && (
								<p className="text-sm text-red-500">{errors.email.message}</p>
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
						<div className="space-y-2">
							<Label htmlFor="passwordConfirm">{t("auth.confirmPasswordLabel")}</Label>
							<Input
								id="passwordConfirm"
								type="password"
								{...register("passwordConfirm")}
							/>
							{errors.passwordConfirm && (
								<p className="text-sm text-red-500">
									{errors.passwordConfirm.message}
								</p>
							)}
						</div>
					</CardContent>
					<CardFooter className="flex flex-col gap-3">
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? t("auth.registering") : t("auth.registerButton")}
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={() => navigate("/login")}>
							{t("auth.alreadyHaveAccount")}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
