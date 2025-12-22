import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, AlertCircle } from "lucide-react";
import type { ApiError } from "@/types/api";
import { Button } from "@/components/ui/button";
import { getStatusLabel } from "@/utils/errors";

interface ApiErrorAlertProps {
  error: ApiError | null;
  onDismiss?: () => void;
  className?: string;
}

export function ApiErrorAlert({ error, onDismiss, className }: ApiErrorAlertProps) {
  if (!error) return null;

  const getStatusColor = (status: number) => {
    if (status >= 500) return "destructive";
    if (status >= 400) return "destructive";
    return "default";
  };



  return (
    <Alert variant={getStatusColor(error.status)} className={className}>
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <AlertTitle className="flex items-center gap-2">
            <span className="text-xs font-mono bg-background/50 px-2 py-0.5 rounded">
              {error.status}
            </span>
            {getStatusLabel(error.status)}
          </AlertTitle>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <AlertDescription className="mt-2">
          {error.message}
        </AlertDescription>
      </div>
    </Alert>
  );
}
