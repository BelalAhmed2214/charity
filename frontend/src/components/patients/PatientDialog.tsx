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
	childrens: z.coerce.number().min(0).optional(),
	governorate: z.string().optional(),
	address: z.string().optional(),
	diagnosis: z.string().optional(),
	solution: z.string().optional(),
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
			childrens: 0,
			governorate: "",
			address: "",
			diagnosis: "",
			solution: "",
		},
	});

	useEffect(() => {
		if (patient) {
			form.reset({
				name: patient.name,
				ssn: patient.ssn,
				phone: patient.phone || "",
				age: patient.age || undefined,
				martial_status: patient.martial_status || undefined,
				status: patient.status || "pending",
				childrens: patient.childrens || 0,
				governorate: patient.governorate || "",
				address: patient.address || "",
				diagnosis: patient.diagnosis || "",
				solution: patient.solution || "",
			});
		} else {
			form.reset({
				name: "",
				ssn: "",
				phone: "",
				status: "pending",
				childrens: 0,
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Patient" : "Add New Patient"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Update the patient details below."
							: "Enter the details for the new patient record."}
					</DialogDescription>
				</DialogHeader>

				{mutation.error && <ApiErrorAlert error={mutation.error} />}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name *</FormLabel>
										<FormControl>
											<Input placeholder="Ahmed Hassan" {...field} />
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
										<FormLabel>SSN *</FormLabel>
										<FormControl>
											<Input placeholder="14 digit national ID" {...field} />
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
										<FormLabel>Phone Number</FormLabel>
										<FormControl>
											<Input placeholder="01xxxxxxxxx" {...field} />
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
										<FormLabel>Age</FormLabel>
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
										<FormLabel>Marital Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="single">Single</SelectItem>
												<SelectItem value="married">Married</SelectItem>
												<SelectItem value="divorced">Divorced</SelectItem>
												<SelectItem value="widowed">Widowed</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="childrens"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Children Count</FormLabel>
										<FormControl>
											<Input type="number" {...field} />
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
										<FormLabel>Governorate</FormLabel>
										<FormControl>
											<Input placeholder="Cairo" {...field} />
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
										<FormLabel>Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="pending">Pending</SelectItem>
												<SelectItem value="complete">Complete</SelectItem>
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
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Textarea placeholder="Full address..." {...field} />
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
									<FormLabel>Diagnosis / Problem</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe the condition..."
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
									<FormLabel>Proposed Solution</FormLabel>
									<FormControl>
										<Textarea placeholder="Recommended action..." {...field} />
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
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending && (
									<span className="mr-2 h-4 w-4 animate-spin">⏳</span>
								)}
								{isEditing ? "Update Patient" : "Create Patient"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
