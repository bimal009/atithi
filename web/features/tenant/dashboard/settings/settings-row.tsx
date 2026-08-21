export function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b py-6 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-8">
      <div className="flex flex-col gap-1 sm:pt-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:max-w-md">{children}</div>
    </div>
  );
}
