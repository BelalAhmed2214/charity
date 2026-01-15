import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const changePasswordSchema = z
	.object({
		old_password: z
			.string()
			.min(1, { message: "Current password is required" }),
		new_password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" }),
		confirm_password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" }),
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: "Passwords do not match",
		path: ["confirm_password"],
	});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePassword() {
	const { changePassword } = useAuth();
	const { t } = useTranslation();
	const [isLoading, setIsLoading] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ChangePasswordFormData>({
		resolver: zodResolver(changePasswordSchema),
	});

	const onSubmit = async (data: ChangePasswordFormData) => {
		setIsLoading(true);
		setServerError(null);

		try {
			await changePassword(data.old_password, data.new_password);
			reset();
		} catch (error) {
			console.error("Password change error:", error);
			const message = error instanceof Error ? error.message : "Failed to change password. Please try again.";
			setServerError(message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						{t("auth.changePasswordTitle")}
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						{t("auth.changePasswordRequired")}
					</p>
				</div>

				{serverError && (
					<div className="rounded-md bg-red-50 p-4">
						<p className="text-sm font-medium text-red-800">{serverError}</p>
					</div>
				)}

				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="old_password" className="sr-only">
								{t("auth.oldPasswordLabel")}
							</label>
							<input
								id="old_password"
								type="password"
								autoComplete="current-password"
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder={t("auth.oldPasswordLabel")}
								{...register("old_password")}
							/>
							{errors.old_password && (
								<p className="mt-1 text-sm text-red-600">
									{errors.old_password.message}
								</p>
							)}
						</div>

						<div>
							<label htmlFor="new_password" className="sr-only">
								{t("auth.newPasswordLabel")}
							</label>
							<input
								id="new_password"
								type="password"
								autoComplete="new-password"
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder={t("auth.newPasswordLabel")}
								{...register("new_password")}
							/>
							{errors.new_password && (
								<p className="mt-1 text-sm text-red-600">
									{errors.new_password.message}
								</p>
							)}
						</div>

						<div>
							<label htmlFor="confirm_password" className="sr-only">
								{t("auth.confirmPasswordLabel")}
							</label>
							<input
								id="confirm_password"
								type="password"
								autoComplete="new-password"
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder={t("auth.confirmPasswordLabel")}
								{...register("confirm_password")}
							/>
							{errors.confirm_password && (
								<p className="mt-1 text-sm text-red-600">
									{errors.confirm_password.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading
								? t("common.changing_password")
								: t("auth.changePasswordButton")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
