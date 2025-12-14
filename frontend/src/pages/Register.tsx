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
import axios from "axios";

const registerSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		phone: z.string().min(10, "Phone number must be at least 10 digits"),
		email: z
			.string()
			.email("Invalid email address")
			.optional()
			.or(z.literal("")),
		password: z.string().min(6, "Password must be at least 6 characters"),
		passwordConfirm: z
			.string()
			.min(6, "Password must be at least 6 characters"),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: "Passwords do not match",
		path: ["passwordConfirm"],
	});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
	const navigate = useNavigate();
	const { register: registerUser } = useAuth();
	const [error, setError] = useState<string>("");
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterFormValues) => {
		try {
			setError("");
			await registerUser(
				data.name,
				data.phone,
				data.password,
				data.email || undefined
			);
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				const errorMsg =
					err.response?.data?.message ||
					err.response?.data?.error ||
					"Registration failed. Please try again.";
				setError(errorMsg);
			}
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						Register
					</CardTitle>
					<CardDescription className="text-center">
						Create a new account to get started.
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="space-y-4">
						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
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
							<Label htmlFor="phone">Phone Number</Label>
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
							<Label htmlFor="email">Email (Optional)</Label>
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
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" {...register("password")} />
							{errors.password && (
								<p className="text-sm text-red-500">
									{errors.password.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="passwordConfirm">Confirm Password</Label>
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
							{isSubmitting ? "Registering..." : "Register"}
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={() => navigate("/login")}>
							Already have an account? Login
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
