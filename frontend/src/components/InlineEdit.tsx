import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

interface InlineEditProps {
	value: string | null | undefined;
	onSave: (value: string) => Promise<void>;
	label?: string;
	placeholder?: string;
	isLoading?: boolean;
	rows?: number;
}

export function InlineEdit({
	value,
	onSave,
	label,
	placeholder = "Enter text...",
	isLoading = false,
	rows = 3,
}: InlineEditProps) {
	const { t } = useTranslation();
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(value || "");
	const [isSaving, setIsSaving] = useState(false);
	const isRtl = i18n.dir() === "rtl";

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(editValue);
			setIsEditing(false);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setEditValue(value || "");
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<div className="space-y-2">
				{label && (
					<label className="text-sm font-medium text-muted-foreground">
						{label}
					</label>
				)}
				<Textarea
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					placeholder={placeholder}
					rows={rows}
					disabled={isSaving || isLoading}
					dir={isRtl ? "rtl" : "ltr"}
					style={{ unicodeBidi: "plaintext" }}
				/>
				<div className="flex gap-2 justify-end">
					<Button
						variant="outline"
						size="sm"
						onClick={handleCancel}
						disabled={isSaving || isLoading}>
						<X className={`h-4 w-4 ${isRtl ? "ml-1" : "mr-1"}`} />
						{t("common.cancel")}
					</Button>
					<Button
						size="sm"
						onClick={handleSave}
						disabled={isSaving || isLoading}>
						<Check className={`h-4 w-4 ${isRtl ? "ml-1" : "mr-1"}`} />
						{isSaving ? t("common.saving") : t("common.save")}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="group">
			{label && (
				<div className="text-sm font-medium text-muted-foreground">{label}</div>
			)}
			<div
				className="relative text-lg font-medium min-h-[1.75rem] p-2 rounded hover:bg-accent/50 transition-colors"
				dir={isRtl ? "rtl" : "ltr"}
				style={{ unicodeBidi: "plaintext" }}>
				{value || <span className="text-muted-foreground">{placeholder}</span>}
				<Button
					variant="ghost"
					size="icon"
					className={`absolute top-0 ${
						isRtl ? "left-0" : "right-0"
					} h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity`}
					onClick={() => setIsEditing(true)}
					disabled={isLoading}>
					<Edit2 className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
