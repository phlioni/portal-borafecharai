
import { Spinner } from "./ui/spinner";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({ message = "Carregando...", size = "md" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Spinner className={`${sizeClasses[size]} text-blue-600`} />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
};
