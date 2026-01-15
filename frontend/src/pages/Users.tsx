import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import usersAPI, { type User, type CreateUserRequest } from "@/api/users";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function Users() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [showDialog, setShowDialog] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [formData, setFormData] = useState<CreateUserRequest>({
		name: "",
		phone: "",
		email: "",
		password: "",
		role: "user", // Backend expects lowercase
	});

	// Fetch users
	const { data, isLoading, error } = useQuery({
		queryKey: ["users", 1],
		queryFn: () => usersAPI.getAll(1),
		staleTime: 30000,
	});

	// Create user mutation
	const createMutation = useMutation({
		mutationFn: (userData: CreateUserRequest) => usersAPI.create(userData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setShowDialog(false);
			setFormData({
				name: "",
				phone: "",
				email: "",
				password: "",
				role: "user",
			});
		},
	});

	// Update user mutation
	const updateMutation = useMutation({
		mutationFn: (userData: User) =>
			usersAPI.update(userData.id, {
				name: userData.name,
				email: userData.email,
				role: userData.role,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setEditingUser(null);
			setShowDialog(false);
		},
	});

	// Delete user mutation
	const deleteMutation = useMutation({
		mutationFn: (id: number) => usersAPI.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});

	// Check if user is admin
	if (user?.role !== "admin") {
		return (
			<div className="p-8 text-center">
				<p className="text-red-600">
					{t("common.accessDenied")}
				</p>
			</div>
		);
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (editingUser) {
			// Convert role back to uppercase for User type, the mutation will lowercase it again for API
			updateMutation.mutate({
				...editingUser,
				name: formData.name,
				phone: formData.phone,
				email: formData.email || undefined,
				role: formData.role,
			});
		} else {
			createMutation.mutate(formData);
		}
	};

	const handleEdit = (user: User) => {
		setEditingUser(user);
		setFormData({
			name: user.name,
			phone: user.phone,
			email: user.email || "",
			password: "",
			role: user.role,
		});
		setShowDialog(true);
	};

	const handleDelete = (id: number) => {
		if (confirm(t("common.confirmDelete"))) {
			deleteMutation.mutate(id);
		}
	};

	const handleAddNew = () => {
		setEditingUser(null);
		setFormData({
			name: "",
			phone: "",
			email: "",
			password: "",
			role: "user",
		});
		setShowDialog(true);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="flex justify-between items-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900">
							{t("common.users")}
						</h1>
						<button
							onClick={handleAddNew}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							<Plus size={20} />
							{t("common.addUser")}
						</button>
					</div>

					{error && (
						<div className="bg-red-50 p-4 rounded-md mb-6">
							<p className="text-red-800">
								{t("errors.default.general")}
							</p>
						</div>
					)}

					{isLoading ? (
						<div className="text-center py-12">
							<p className="text-gray-500">{t("common.loading")}</p>
						</div>
					) : (
						<div className="bg-white rounded-lg shadow overflow-hidden">
							<table className="w-full">
								<thead className="bg-gray-100 border-b">
									<tr>
										<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											{t("common.name")}
										</th>
										<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											{t("common.phone")}
										</th>
										<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											{t("common.email")}
										</th>
										<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											{t("common.role")}
										</th>
										<th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
											{t("common.actions")}
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{data?.data && data.data.length > 0 ? (
										data.data.map((u) => (
											<tr key={u.id} className="hover:bg-gray-50">
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{u.name}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
													{u.phone}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
													{u.email || t("common.na")}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm">
													<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
														{t(`common.${u.role.toLowerCase()}`)}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
													<button
														onClick={() => handleEdit(u)}
														className="text-blue-600 hover:text-blue-900"
														title={t("common.edit")}
													>
														<Edit2 size={18} />
													</button>
													<button
														onClick={() => handleDelete(u.id)}
														className="text-red-600 hover:text-red-900"
														title={t("common.delete")}
													>
														<Trash2 size={18} />
													</button>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan={5}
												className="px-6 py-4 text-center text-sm text-gray-500"
											>
												{t("common.noData")}
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					)}

					{/* Dialog/Modal */}
					{showDialog && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
							<div className="bg-white rounded-lg max-w-md w-full p-6">
								<h2 className="text-lg font-semibold mb-4">
									{editingUser
										? t("common.editUser")
										: t("common.addUser")}
								</h2>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div>
										<label className="block text-sm font-medium mb-1">
											{t("common.name")}
										</label>
										<input
											type="text"
											required
											value={formData.name}
											onChange={(e) =>
												setFormData({
													...formData,
													name: e.target.value,
												})
											}
											className="w-full px-3 py-2 border rounded-md"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											{t("common.phone")}
										</label>
										<input
											type="tel"
											required
											value={formData.phone}
											onChange={(e) =>
												setFormData({
													...formData,
													phone: e.target.value,
												})
											}
											className="w-full px-3 py-2 border rounded-md"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											{t("common.email")}
										</label>
										<input
											type="email"
											value={formData.email}
											onChange={(e) =>
												setFormData({
													...formData,
													email: e.target.value,
												})
											}
											className="w-full px-3 py-2 border rounded-md"
										/>
									</div>
									{!editingUser && (
										<div>
											<label className="block text-sm font-medium mb-1">
												{t("auth.passwordLabel")}
											</label>
											<input
												type="password"
												required={!editingUser}
												value={formData.password}
												onChange={(e) =>
													setFormData({
														...formData,
														password: e.target.value,
													})
												}
												className="w-full px-3 py-2 border rounded-md"
											/>
										</div>
									)}
									<div>
										<label className="block text-sm font-medium mb-1">
											{t("common.role")}
										</label>
										<select
											value={formData.role}
											onChange={(e) =>
												setFormData({
													...formData,
													role: e.target.value as
														| "admin"
														| "user"
														| "editor",
												})
											}
											className="w-full px-3 py-2 border rounded-md"
										>
											<option value="user">{t("common.user")}</option>
											<option value="editor">{t("common.editor")}</option>
											<option value="admin">{t("common.admin")}</option>
										</select>
									</div>
									<div className="flex gap-2 pt-4">
										<button
											type="button"
											onClick={() => setShowDialog(false)}
											className="flex-1 px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
										>
											{t("common.cancel")}
										</button>
										<button
											type="submit"
											disabled={
												createMutation.isPending ||
												updateMutation.isPending
											}
											className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
										>
											{createMutation.isPending ||
											updateMutation.isPending
												? t("common.saving")
												: t("common.save")}
										</button>
									</div>
								</form>
							</div>
						</div>
					)}
				</div>
			</div>
	);
}
