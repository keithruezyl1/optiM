import { GenerateReportButton } from "./GenerateReportButton";

// Top header bar (navy-900). Wordmark left, the single gold action right.
// The gold button is the only gold object in the chrome so the eye lands on it.
export function Header() {
  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6">
        <div className="flex items-baseline gap-3">
          <span className="font-condensed text-[26px] font-semibold tracking-tight">
            <span className="font-normal text-white">Opti</span>
            <span className="text-gold">M</span>
          </span>
          <span className="hidden text-label uppercase text-steel sm:inline">
            Operations Dashboard
          </span>
        </div>
        <GenerateReportButton />
      </div>
    </header>
  );
}
