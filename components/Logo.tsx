import { BRAND } from "@/lib/brand";

export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="10" fill="none" stroke={BRAND.colors.accent} strokeWidth="3.2" />
      <circle cx="23" cy="9" r="3.6" fill="currentColor" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-fg">
      <LogoMark />
      <span className="font-display text-[17px] font-semibold tracking-tight">{BRAND.name}</span>
    </span>
  );
}
