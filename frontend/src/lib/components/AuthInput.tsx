import { Eye, EyeOff } from "lucide-react";
import { ReactNode, useState } from "react";
import { Button } from "./Button";

type AuthInputProps = {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  icon: ReactNode;
  autoComplete?: string;
};

export function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  icon,
  autoComplete,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-(--text-clr)/80">{label}</label>

      <div
        className={`flex items-center gap-3 rounded-xl border bg-(--bg-clr)/50 px-4 ${
          error
            ? "border-red-400/60 focus-within:border-red-400"
            : "border-(--text-clr)/10 hover:border-(--text-clr)/35 focus-within:border-(--primary-clr) hover:focus-within:border-(--primary-clr)"
        }`}
      >
        <span className="shrink-0 text-(--text-clr)/40">{icon}</span>

        <input
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-12 min-w-0 flex-1 bg-transparent text-sm text-(--text-clr) outline-none placeholder:text-(--text-clr)/30"
        />

        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword((prev) => !prev)}
            className="shrink-0 rounded-full px-2 py-1.5 text-(--text-clr)! hover:text-(--primary-clr)!"
            title={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
            aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </Button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
