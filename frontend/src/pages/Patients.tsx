import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "../api/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Plus,
	Search,
	Loader2,
	RefreshCw,
	Eye,
	Edit,
	Trash2,
	CheckCircle,
	ChevronUp,
	ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ApiErrorAlert } from "@/components/ApiErrorAlert";
import type { ApiError, Patient } from "@/types/api";
import { PatientDialog } from "@/components/patients/PatientDialog";
import { useTranslation } from "react-i18next";

export default function Patients() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [status, setStatus] = useState<string>("all");
	const [sortBy, setSortBy] = useState<string>("created_at");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

	const deleteMutation = useMutation({
		mutationFn: (id: number) => patientsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["patients"] });
			setDeleteConfirmOpen(false);
			setPatientToDelete(null);
		},
	});

	const completeMutation = useMutation({
		mutationFn: (patient: Patient) => {
			const { user_id, user, created_at, updated_at, ...updateData } = patient;
			return patientsApi.update(patient.id, { ...updateData, status: "complete" });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["patients"] });
		},
	});

	const handleDeleteClick = (patient: Patient) => {
		setPatientToDelete(patient);
		setDeleteConfirmOpen(true);
	};

	const confirmDelete = () => {
		if (patientToDelete) {
			deleteMutation.mutate(patientToDelete.id);
		}
	};

	const handleComplete = (patient: Patient) => {
		completeMutation.mutate(patient);
	};

	const handleSort = (column: string) => {
		if (sortBy === column) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortOrder("desc");
		}
		setPage(1);
	};

	useEffect(() => {
		const handle = setTimeout(() => {
			setDebouncedSearch(searchTerm.trim());
			setPage(1);
		}, 300);
		return () => clearTimeout(handle);
	}, [searchTerm]);

	useEffect(() => {
		setPage(1);
	}, [status]);

	const { data, isLoading, isFetching, error, refetch } = useQuery({
		queryKey: ["patients", page, debouncedSearch, status, sortBy, sortOrder],
		queryFn: () =>
			patientsApi.getAll({
				page,
				search: debouncedSearch || undefined,
				status: status === "all" ? undefined : status,
				sort_by: sortBy,
				sort_order: sortOrder,
			}),
		placeholderData: (previousData) => previousData,
		staleTime: 5_000,
	});

	const patients = data?.patients;

	// Guard against out-of-range page numbers when filters change
	useEffect(() => {
		if (patients?.last_page && page > patients.last_page) {
			setPage(patients.last_page || 1);
		}
	}, [patients?.last_page, page]);

	const handleAdd = () => {
		setSelectedPatient(null);
		setDialogOpen(true);
	};

	const handleEdit = (patient: Patient) => {
		setSelectedPatient(patient);
		setDialogOpen(true);
	};

	const resultSummary = useMemo(() => {
		if (!patients) return null;
		return t("patients.pagination.summary", {
			total: patients.total,
			count: patients.data.length,
			page: patients.current_page,
		});
	}, [patients, t]);

	const SortIcon = ({ column }: { column: string }) => {
		if (sortBy !== column) return null;
		return sortOrder === "asc" ? (
			<ChevronUp className="ml-1 h-4 w-4" />
		) : (
			<ChevronDown className="ml-1 h-4 w-4" />
		);
	};

	return (
		<div className="space-y-4 p-4">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{t("patients.title")}</h1>
					<p className="text-muted-foreground">
						{t("patients.description")}
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => refetch()}>
						<RefreshCw className="mr-2 h-4 w-4" /> {t("patients.refresh")}
					</Button>
					<Button onClick={handleAdd}>
						<Plus className="mr-2 h-4 w-4" /> {t("patients.addPatient")}
					</Button>
				</div>
			</div>

			{error && <ApiErrorAlert error={error as unknown as ApiError} />}

			<div className="flex items-center gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={t("patients.searchPlaceholder")}
						className="pl-8"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<Select value={status} onValueChange={setStatus}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder={t("patients.filterStatus")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("patients.allStatuses")}</SelectItem>
						<SelectItem value="pending">{t("patients.pending")}</SelectItem>
						<SelectItem value="complete">{t("patients.complete")}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="rounded-md border relative">
				{isFetching && (
					<div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center rounded-md z-10">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				)}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead
								className="cursor-pointer hover:text-foreground"
								onClick={() => handleSort("name")}>
								<div className="flex items-center">
									{t("patients.table.name")}
									<SortIcon column="name" />
								</div>
							</TableHead>
							<TableHead
								className="cursor-pointer hover:text-foreground"
								onClick={() => handleSort("ssn")}>
								<div className="flex items-center">
									{t("patients.table.ssn")}
									<SortIcon column="ssn" />
								</div>
							</TableHead>
							<TableHead
								className="cursor-pointer hover:text-foreground"
								onClick={() => handleSort("phone")}>
								<div className="flex items-center">
									{t("patients.table.phone")}
									<SortIcon column="phone" />
								</div>
							</TableHead>
							<TableHead>{t("patients.table.createdBy")}</TableHead>
							<TableHead
								className="cursor-pointer hover:text-foreground"
								onClick={() => handleSort("created_at")}>
								<div className="flex items-center">
									{t("patients.table.createdAt")}
									<SortIcon column="created_at" />
								</div>
							</TableHead>
							<TableHead
								className="cursor-pointer hover:text-foreground"
								onClick={() => handleSort("status")}>
								<div className="flex items-center">
									{t("patients.table.status")}
									<SortIcon column="status" />
								</div>
							</TableHead>
							<TableHead>{t("patients.table.actions")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center">
									<Loader2 className="h-6 w-6 animate-spin mx-auto" />
								</TableCell>
							</TableRow>
						) : patients?.data?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center">
									{t("patients.table.empty")}
								</TableCell>
							</TableRow>
						) : (
							patients?.data?.map((patient: Patient) => (
								<TableRow
									key={patient.id}
									className="cursor-pointer hover:bg-muted/50"
									onClick={() => navigate(`/patients/${patient.id}`)}>
									<TableCell className="font-medium">{patient.name}</TableCell>
									<TableCell>{patient.ssn}</TableCell>
									<TableCell>{patient.phone}</TableCell>
									<TableCell>
										<div className="flex flex-col">
											<span className="font-medium">
												{patient.user?.name || "Unknown"}
											</span>
											<span className="text-xs text-muted-foreground">
												{patient.user?.email || patient.user?.phone || "N/A"}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<span className="text-sm text-muted-foreground">
											{patient.created_at
												? new Date(patient.created_at).toLocaleString()
												: "—"}
										</span>
									</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
												patient.status === "complete"
													? "bg-green-100 text-green-800"
													: "bg-yellow-100 text-yellow-800"
											}`}>
											{t(`patients.${patient.status}`)}
										</span>
									</TableCell>
									<TableCell>

										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												title={t("patients.actions.view")}
												onClick={(e) => {
													e.stopPropagation();
													navigate(`/patients/${patient.id}`);
												}}>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												title={t("patients.actions.edit")}
												onClick={(e) => {
													e.stopPropagation();
													handleEdit(patient);
												}}>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												title={t("patients.actions.delete")}
												className="text-destructive hover:text-destructive"
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteClick(patient);
												}}>
												<Trash2 className="h-4 w-4" />
											</Button>
											{patient.status !== "complete" && (
												<Button
													variant="ghost"
													size="icon"
													title={t("patients.actions.markComplete")}
													className="text-green-600 hover:text-green-700"
													onClick={(e) => {
														e.stopPropagation();
														handleComplete(patient);
													}}>
													<CheckCircle className="h-4 w-4" />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{patients && (
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 py-4">
					{resultSummary && (
						<div className="text-sm text-muted-foreground">{resultSummary}</div>
					)}
					<div className="flex items-center justify-end space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}>
							{t("patients.pagination.previous")}
						</Button>
						<div className="text-sm text-muted-foreground">
							{t("patients.pagination.info", {
								current: patients.current_page,
								total: patients.last_page,
							})}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setPage((p) => Math.min(patients.last_page, p + 1))
							}
							disabled={page === patients.last_page}>
							{t("patients.pagination.next")}
						</Button>
					</div>
				</div>
			)}

			<PatientDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				patient={selectedPatient}
			/>

			<Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("patients.actions.confirmDeleteTitle")}</DialogTitle>
						<DialogDescription>
							{t("patients.actions.confirmDeleteDesc")}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							
							onClick={() => setDeleteConfirmOpen(false)}>
							{t("patients.actions.cancel")}
						</Button>
						<Button
							variant="destructive"
							className="text-white"
							onClick={confirmDelete}
							disabled={deleteMutation.isPending}>
							{deleteMutation.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							{t("patients.actions.confirmDelete")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
