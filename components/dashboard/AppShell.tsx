import { getOwner } from "@/lib/owner";
import { Sidebar, type SidebarSection } from "./Sidebar";

/**
 * Black frame with the fixed sidebar on the left and the teal panel on the right.
 * The panel frame stays put; only its content scrolls.
 */
export async function AppShell({
  active,
  activeSiteId,
  next,
  children,
}: {
  active: SidebarSection;
  activeSiteId?: string;
  next: string;
  children: React.ReactNode;
}) {
  const { sites, email } = await getOwner(next);

  return (
    <div className="dark-shell flex h-dvh gap-2 overflow-hidden bg-black p-2 text-white sm:gap-3 sm:p-3">
      <Sidebar sites={sites} email={email} active={active} activeSiteId={activeSiteId} />
      <main className="dash-panel relative min-w-0 flex-1 overflow-hidden rounded-[22px] ring-1 ring-white/[0.06]">
        <div className="dash-scroll h-full overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-6">{children}</div>
      </main>
    </div>
  );
}
