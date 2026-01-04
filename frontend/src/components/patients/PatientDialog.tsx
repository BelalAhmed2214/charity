import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "@/api/patients";
import { type Patient } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiErrorAlert } from "@/components/ApiErrorAlert";
import { normalizeApiError } from "@/utils/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const patientSchema = z.object({
	name: z.string().min(1, "Name is required"),
	ssn: z
		.string()
		.min(14, "SSN must be at least 14 characters")
		.max(14, "SSN must be 14 characters"),
	phone: z.string().optional(),
	age: z.coerce.number().min(0).optional(),
	martial_status: z
		.enum(["single", "married", "divorced", "widowed"])
		.optional(),
	status: z.enum(["pending", "complete"]),
	children: z.coerce.number().min(0).optional(),
	governorate: z.string().optional(),
	address: z.string().optional(),
	diagnosis: z.string().optional(),
	solution: z.string().optional(),
	cost: z.coerce.number().min(0, "Cost must be zero or positive").optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	patient?: Patient | null;
}

export function PatientDialog({
	open,
	onOpenChange,
	patient,
}: PatientDialogProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const isEditing = !!patient;

	const form = useForm<PatientFormValues>({
		resolver: zodResolver(patientSchema) as Resolver<PatientFormValues>,
		defaultValues: {
			name: "",
			ssn: "",
			phone: "",
			age: 0,
			martial_status: "single",
			status: "pending",
			children: 0,
			governorate: "",
			address: "",
			diagnosis: "",
			solution: "",
			cost: undefined,
		},
	});

	// Cost history removed; consolidated into patient.cost_total

	useEffect(() => {
		if (patient) {
			form.reset({
				name: patient.name,
				ssn: patient.ssn,
				phone: patient.phone || "",
				age: patient.age || undefined,
				martial_status: patient.martial_status || undefined,
				status: patient.status || "pending",
				children: patient.children ?? 0,
				governorate: patient.governorate || "",
				address: patient.address || "",
				diagnosis: patient.diagnosis || "",
				solution: patient.solution || "",
				cost: patient.cost ?? undefined,
			});
		} else {
			form.reset({
				name: "",
				ssn: "",
				phone: "",
				status: "pending",
				children: 0,
				cost: undefined,
			});
		}
	}, [patient, form, open]);

	const mutation = useMutation({
		mutationFn: (data: PatientFormValues) => {
			if (isEditing && patient) {
				return patientsApi.update(patient.id, data);
			}
			return patientsApi.create(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["patients"] });
			onOpenChange(false);
			form.reset();
		},
	});

	const onSubmit = (data: PatientFormValues) => {
		mutation.mutate(data);
	};

	// Cost mutation removed

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing
							? t("patients.dialog.editTitle")
							: t("patients.dialog.addTitle")}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? t("patients.dialog.editDescription")
							: t("patients.dialog.addDescription")}
					</DialogDescription>
				</DialogHeader>

				{patient && (
					<div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
						<div className="font-medium text-foreground">
							{t("patients.table.createdBy")}
						</div>
						<div className="flex flex-col">
							<span>{patient.user?.name ?? t("common.unknown")}</span>
							<span className="text-xs">
								{patient.user?.email ?? patient.user?.phone ?? t("common.na")}
							</span>
							<span className="text-xs">
								{patient.created_at
									? new Date(patient.created_at).toLocaleString()
									: "—"}
							</span>
						</div>
					</div>
				)}

				{mutation.error && (
					<ApiErrorAlert error={normalizeApiError(mutation.error)} />
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("patients.dialog.form.fullName")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t(
													"patients.dialog.form.placeholders.fullName"
												)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="ssn"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("patients.dialog.form.ssn")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t("patients.dialog.form.placeholders.ssn")}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("patients.dialog.form.phone")}</FormLabel>
										<FormControl>
											<Input
												placeholder={t(
													"patients.dialog.form.placeholders.phone"
												)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="age"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("patients.dialog.form.age")}</FormLabel>
										<FormControl>
											<Input type="number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="martial_status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("patients.dialog.form.maritalStatus")}
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue
														placeholder={t("patients.dialog.form.selectStatus")}
													/>
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="single">
													{t("patients.dialog.form.marital.single")}
												</SelectItem>
												<SelectItem value="married">
													{t("patients.dialog.form.marital.married")}
												</SelectItem>
												<SelectItem value="divorced">
													{t("patients.dialog.form.marital.divorced")}
												</SelectItem>
												<SelectItem value="widowed">
													{t("patients.dialog.form.marital.widowed")}
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="children"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("patients.dialog.form.children")}</FormLabel>
										<FormControl>
											<Input type="number" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="cost"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("patients.dialog.form.cost")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												min="0"
												{...field}
												value={field.value ?? ""}
												onChange={(e) => {
													const val = e.target.value;
													field.onChange(val === "" ? undefined : Number(val));
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="governorate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("patients.dialog.form.governorate")}
										</FormLabel>
										<FormControl>
											<Input
												placeholder={t(
													"patients.dialog.form.placeholders.governorate"
												)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("patients.dialog.form.status")}</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue
														placeholder={t("patients.dialog.form.selectStatus")}
													/>
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="pending">
													{t("patients.pending")}
												</SelectItem>
												<SelectItem value="complete">
													{t("patients.complete")}
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("patients.dialog.form.address")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t(
												"patients.dialog.form.placeholders.address"
											)}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="diagnosis"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("patients.dialog.form.diagnosis")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t(
												"patients.dialog.form.placeholders.diagnosis"
											)}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="solution"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("patients.dialog.form.solution")}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t(
												"patients.dialog.form.placeholders.solution"
											)}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}>
								{t("patients.dialog.form.cancel")}
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending && (
									<span className="mr-2 h-4 w-4 animate-spin">⏳</span>
								)}
								{isEditing
									? t("patients.dialog.form.update")
									: t("patients.dialog.form.create")}
							</Button>
						</DialogFooter>
					</form>
				</Form>

				{patient && (
					<div className="mt-6 space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>{t("patients.dialog.costTracking")}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Cost tracking form removed */}

								<div className="text-sm text-muted-foreground">
									{t("patients.dialog.currentTotal")}{" "}
									<span className="font-medium">
										{new Intl.NumberFormat(
											i18n.language === "ar" ? "ar-EG" : "en-EG",
											{
												style: "currency",
												currency: "EGP",
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											}
										).format(patient.cost ?? 0)}
									</span>
								</div>

								{/* Cost history removed */}
							</CardContent>
						</Card>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
