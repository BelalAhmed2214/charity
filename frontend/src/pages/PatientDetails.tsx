import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "@/api/patients";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Loader2,
	ArrowLeft,
	ArrowRight,
	CheckCircle,
	Edit,
} from "lucide-react";
import i18n from "@/i18n";
import { ApiErrorAlert } from "@/components/ApiErrorAlert";
import { normalizeApiError } from "@/utils/errors";
import { useState } from "react";
import { PatientDialog } from "@/components/patients/PatientDialog";
import { InlineEdit } from "@/components/InlineEdit";
import type { Patient } from "@/types/api";

export default function PatientDetails() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { t } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const [dialogOpen, setDialogOpen] = useState(false);

	const { data, isLoading, error } = useQuery({
		queryKey: ["patient", id],
		queryFn: () => patientsApi.get(Number(id)),
		enabled: !!id,
	});

	const completeMutation = useMutation({
		mutationFn: (patient: Patient) => {
			const { user_id, user, created_at, updated_at, ...updateData } = patient;
			return patientsApi.update(patient.id, {
				...updateData,
				status: "complete",
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["patient", id] });
		},
	});

	const updateDiagnosisMutation = useMutation({
		mutationFn: (diagnosis: string) => {
			if (!patient) throw new Error("Patient not found");
			const { user_id, user, created_at, updated_at, ...updateData } = patient;
			return patientsApi.update(patient.id, {
				...updateData,
				diagnosis,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["patient", id] });
		},
	});

	const updateSolutionMutation = useMutation({
		mutationFn: (solution: string) => {
			if (!patient) throw new Error("Patient not found");
			const { user_id, user, created_at, updated_at, ...updateData } = patient;
			return patientsApi.update(patient.id, {
				...updateData,
				solution,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["patient", id] });
		},
	});

	const handleComplete = () => {
		if (data?.patient) {
			completeMutation.mutate(data.patient);
		}
	};

	const handleDiagnosisSave = async (diagnosis: string) => {
		return new Promise<void>((resolve, reject) => {
			updateDiagnosisMutation.mutate(diagnosis, {
				onSuccess: () => resolve(),
				onError: (error) => reject(error),
			});
		});
	};

	const handleSolutionSave = async (solution: string) => {
		return new Promise<void>((resolve, reject) => {
			updateSolutionMutation.mutate(solution, {
				onSuccess: () => resolve(),
				onError: (error) => reject(error),
			});
		});
	};

	const formatNumber = (val: string | number | null | undefined) => {
		if (val === null || val === undefined) return t("common.na");
		const s = val.toString();
		if (i18n.language !== "ar") return s;
		// Convert to Eastern Arabic numerals
		return s.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 max-w-4xl mx-auto">
				<ApiErrorAlert error={normalizeApiError(error)} />
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => navigate("/patients")}>
					{isRtl ? (
						<ArrowRight className="ml-2 h-4 w-4" />
					) : (
						<ArrowLeft className="mr-2 h-4 w-4" />
					)}
					{t("patients.details.back")}
				</Button>
			</div>
		);
	}

	const patient = data?.patient;

	if (!patient) {
		return (
			<div className="p-6 max-w-4xl mx-auto text-center">
				<h2 className="text-2xl font-bold">{t("patients.details.notFound")}</h2>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => navigate("/patients")}>
					{isRtl ? (
						<ArrowRight className="ml-2 h-4 w-4" />
					) : (
						<ArrowLeft className="mr-2 h-4 w-4" />
					)}
					{t("patients.details.back")}
				</Button>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/patients")}>
						{isRtl ? (
							<ArrowRight className="h-6 w-6" />
						) : (
							<ArrowLeft className="h-6 w-6" />
						)}
					</Button>
					<h1 className="text-3xl font-bold tracking-tight">
						{t("patients.details.title")}
					</h1>
				</div>
				<div
					className={`px-3 py-1 rounded-full text-sm font-medium ${
						patient.status === "complete"
							? "bg-green-100 text-green-800"
							: "bg-yellow-100 text-yellow-800"
					}`}>
					{t(`patients.${patient.status}`)}
				</div>
			</div>

			<div className="flex justify-end gap-2">
				{patient.status !== "complete" && (
					<Button
						variant="outline"
						className="text-green-600 hover:text-green-700 hover:bg-green-50"
						onClick={handleComplete}
						disabled={completeMutation.isPending}>
						{completeMutation.isPending ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<CheckCircle className="mr-2 h-4 w-4" />
						)}
						{t("patients.actions.markComplete")}
					</Button>
				)}
				<Button onClick={() => setDialogOpen(true)}>
					<Edit className="mr-2 h-4 w-4" />
					{t("patients.actions.edit")}
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>{t("patients.details.personalInfo")}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="col-span-2">
								<div className="text-sm font-medium text-muted-foreground">
									{t("patients.table.name")}
								</div>
								<div className="text-lg font-medium">{patient.name}</div>
							</div>
							<div>
								<div className="text-sm font-medium text-muted-foreground">
									{t("patients.table.ssn")}
								</div>
								<div className="text-lg font-medium">
									{formatNumber(patient.ssn)}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-muted-foreground">
									{t("patients.table.phone")}
								</div>
								<div className="text-lg font-medium">
									{formatNumber(patient.phone)}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-muted-foreground">
									{t("patients.dialog.form.age")}
								</div>
								<div className="text-lg font-medium">
									{formatNumber(patient.age)}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-muted-foreground">
									{t("patients.dialog.form.maritalStatus")}
								</div>
								<div className="text-lg font-medium">
									{patient.martial_status
										? t(
												`patients.dialog.form.marital.${patient.martial_status}`
										  )
										: t("common.na")}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-muted-foreground">
									{t("patients.dialog.form.children")}
								</div>
								<div className="text-lg font-medium">
									{formatNumber(patient.children)}
								</div>
							</div>
							<div className="col-span-2">
								<div className="text-sm font-medium text-muted-foreground">
									{t("patients.dialog.form.address")}
								</div>
								<div className="text-lg font-medium">
									{patient.address || t("common.na")}
								</div>
							</div>
							<div className="col-span-2">
								<div className="text-sm font-medium text-muted-foreground">
									{t("patients.dialog.form.governorate")}
								</div>
								<div className="text-lg font-medium">
									{patient.governorate || t("common.na")}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>{t("patients.details.medicalInfo")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<InlineEdit
								value={patient.diagnosis}
								onSave={handleDiagnosisSave}
								label={t("patients.dialog.form.diagnosis")}
								placeholder={t("patients.dialog.form.diagnosis")}
								isLoading={updateDiagnosisMutation.isPending}
								rows={4}
							/>
							<div className="border-t pt-4">
								<InlineEdit
									value={patient.solution}
									onSave={handleSolutionSave}
									label={t("patients.dialog.form.solution")}
									placeholder={t("patients.dialog.form.solution")}
									isLoading={updateSolutionMutation.isPending}
									rows={4}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>{t("patients.details.statusCost")}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<div className="text-sm font-medium text-muted-foreground">
									{t("patients.dialog.form.cost")}
								</div>
								<div className="text-2xl font-bold">
									{new Intl.NumberFormat(
										i18n.language === "ar" ? "ar-EG" : "en-EG",
										{
											style: "currency",
											currency: "EGP",
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										}
									).format(patient.cost ?? 0)}
								</div>
							</div>
							<div className="pt-4 border-t">
								<div className="text-sm font-medium text-muted-foreground">
									{t("patients.table.createdBy")}
								</div>
								<div>{patient.user?.name || t("common.unknown")}</div>
								<div className="text-xs text-muted-foreground">
									{patient.created_at
										? new Date(patient.created_at).toLocaleString()
										: t("common.na")}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<PatientDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				patient={patient}
			/>
		</div>
	);
}
