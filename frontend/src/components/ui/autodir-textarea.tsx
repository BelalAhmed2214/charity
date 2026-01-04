import * as React from "react";
import { detectDir, alignClass, type TextDir } from "@/lib/dir";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<"textarea">, "dir" | "onChange"> & {
	value?: string;
	onChange?: (value: string) => void;
	onDirChange?: (dir: TextDir) => void;
	fallbackDir?: TextDir;
	indicator?: boolean;
};

export const AutoDirTextarea = React.forwardRef<HTMLTextAreaElement, Props>(
	(
		{
			value,
			onChange,
			onDirChange,
			fallbackDir = "ltr",
			className,
			indicator = true,
			...props
		},
		ref
	) => {
		const internalRef = React.useRef<HTMLTextAreaElement | null>(null);
		const mergedRef = (node: HTMLTextAreaElement | null) => {
			internalRef.current = node;
			if (typeof ref === "function") ref(node);
			else if (ref)
				(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
					node;
		};

		const [dir, setDir] = React.useState<TextDir>(fallbackDir);
		const selStart = React.useRef<number | null>(null);
		const selEnd = React.useRef<number | null>(null);

		const updateDir = (text: string) => {
			const newDir = detectDir(text, fallbackDir);
			if (newDir !== dir) {
				setDir(newDir);
				onDirChange?.(newDir);
			}
		};

		React.useEffect(() => {
			updateDir(value ?? "");
		}, [value]);

		const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
			selStart.current = e.target.selectionStart;
			selEnd.current = e.target.selectionEnd;
			const v = e.target.value;
			updateDir(v);
			onChange?.(v);
		};

		const handlePaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (
			e
		) => {
			const pasted = e.clipboardData.getData("text");
			if (pasted) updateDir(pasted);
		};

		React.useLayoutEffect(() => {
			const el = internalRef.current;
			if (!el) return;
			if (selStart.current !== null && selEnd.current !== null) {
				try {
					el.setSelectionRange(selStart.current, selEnd.current);
				} catch {}
			}
		});

		return (
			<div className="relative">
				<textarea
					ref={mergedRef}
					dir={dir}
					onChange={handleChange}
					onPaste={handlePaste}
					className={cn(
						"flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
						alignClass(dir),
						className
					)}
					style={{ unicodeBidi: "plaintext" }}
					value={value}
					{...props}
				/>
				{indicator && (
					<div className="absolute top-2 right-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
						{dir.toUpperCase()}
					</div>
				)}
			</div>
		);
	}
);
AutoDirTextarea.displayName = "AutoDirTextarea";
