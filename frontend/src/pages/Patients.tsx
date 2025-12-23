import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Plus, Search, Loader2, RefreshCw } from "lucide-react";
import { ApiErrorAlert } from "@/components/ApiErrorAlert";
import type { ApiError, Patient } from "@/types/api";
import { PatientDialog } from "@/components/patients/PatientDialog";

export default function Patients() {
	const [page, setPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [status, setStatus] = useState<string>("all");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

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
		queryKey: ["patients", page, debouncedSearch, status],
		queryFn: () =>
			patientsApi.getAll({
				page,
				search: debouncedSearch || undefined,
				status: status === "all" ? undefined : status,
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
		return `${patients.total} total • showing ${patients.data.length} on page ${patients.current_page}`;
	}, [patients]);

	return (
		<div className="space-y-4 p-4">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Patients</h1>
					<p className="text-muted-foreground">
						Manage patient records and their status.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCw className="mr-2 h-4 w-4" /> Refresh
					</Button>
					<Button onClick={handleAdd}>
						<Plus className="mr-2 h-4 w-4" /> Add Patient
					</Button>
				</div>
			</div>

			{error && <ApiErrorAlert error={error as unknown as ApiError} />}

			<div className="flex items-center gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by name, SSN, or phone..."
						className="pl-8"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<Select value={status} onValueChange={setStatus}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="complete">Complete</SelectItem>
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
							<TableHead>Name</TableHead>
							<TableHead>SSN</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Created By</TableHead>
							<TableHead>Created At</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center">
									<Loader2 className="h-6 w-6 animate-spin mx-auto" />
								</TableCell>
							</TableRow>
						) : patients?.data?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center">
									No patients found.
								</TableCell>
							</TableRow>
						) : (
							patients?.data?.map((patient: Patient) => (
								<TableRow key={patient.id}>
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
											{patient.status}
										</span>
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleEdit(patient)}>
											Edit
										</Button>
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
							Previous
						</Button>
						<div className="text-sm text-muted-foreground">
							Page {patients.current_page} of {patients.last_page}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setPage((p) => Math.min(patients.last_page, p + 1))
							}
							disabled={page === patients.last_page}>
							Next
						</Button>
					</div>
				</div>
			)}

			<PatientDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				patient={selectedPatient}
			/>
		</div>
	);
}
