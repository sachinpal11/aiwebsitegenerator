import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { Wordmark } from "@/components/brand/Logo";
import { Crown, Folder, FolderPlus, Inbox, Library, Logout, PlusCircle, Spark } from "./icons";

type Site = { id: string; business_name: string; status: string };
export type SidebarSection = "build" | "templates" | "site";

export function Sidebar({
  sites,
  email,
  active,
  activeSiteId,
}: {
  sites: Site[];
  email: string;
  active: SidebarSection;
  activeSiteId?: string;
}) {
  // "riya.sharma92@gmail.com" -> "riya sharma"
  const displayName = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\d+/g, "").trim();

  // Fixed-width, full-height rail: it never scrolls with the page, only its website list scrolls.
  return (
    <aside className="hidden h-full w-[248px] shrink-0 flex-col overflow-hidden px-2 py-3 lg:flex xl:w-[264px]">
      {/* Brand */}
      <div className="flex items-center px-1.5">
        <Link href="/dashboard">
          <Wordmark />
        </Link>
      </div>

      <Link
        href="/dashboard"
        className="mt-7 flex items-center gap-2.5 rounded-[10px] bg-[#2a292c] px-3 py-2.5 text-[15px] transition hover:bg-[#333236]"
      >
        <PlusCircle /> New Website
      </Link>

      {/* Middle section scrolls on its own; brand, plan card and profile stay pinned. */}
      <div className="dash-scroll -mx-1 mt-7 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1">
      <p className="px-1.5 text-[14px] text-[#8b8790]">Features</p>
      <nav className="mt-2.5 flex flex-col gap-0.5">
        <NavItem href="/dashboard" icon={<Spark />} active={active === "build"}>
          Build
        </NavItem>
        <NavItem icon={<Inbox />} badge="soon">
          Enquiries
        </NavItem>
        <NavItem href="/templates" icon={<Library />} active={active === "templates"}>
          Templates
        </NavItem>
      </nav>

      <div className="mx-1.5 my-5 h-px bg-white/[0.08]" />

      <p className="px-1.5 text-[14px] text-[#8b8790]">My Websites</p>
      <nav className="mt-2.5 flex flex-col gap-0.5">
        <NavItem href="/dashboard" icon={<FolderPlus />}>
          New Website
        </NavItem>
        {sites.map((s) => (
          <NavItem key={s.id} href={`/preview/${s.id}`} icon={<Folder />} active={s.id === activeSiteId} badge={s.status === "published" ? "live" : undefined}>
            <span className="truncate">{s.business_name}</span>
          </NavItem>
        ))}
        {sites.length === 0 && <p className="px-3 py-2 text-[13px] text-white/35">No websites yet. Your first one is free.</p>}
      </nav>
      </div>

      {/* Plan card */}
      <div className="mt-4 shrink-0 rounded-[20px] bg-[#1a191c] px-4 pt-5 pb-4 text-center ring-1 ring-white/[0.04]">
        <span className="mx-auto grid size-9 place-items-center rounded-full bg-[#2a292c] text-white/80">
          <Crown className="size-[17px]" />
        </span>
        <p className="mt-3 text-[15px] font-medium">Free plan</p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/60">
          One website, 10 AI edits and a month of hosting with lead capture, on us.
        </p>
        <button
          disabled
          title="Paid plans are coming soon"
          className="mt-4 w-full rounded-[10px] bg-[#2b2a2e] py-2 text-[13px] font-medium text-white/90 disabled:cursor-not-allowed"
        >
          Upgrade · coming soon
        </button>
      </div>

      {/* Profile */}
      <div className="mt-3 flex shrink-0 items-center gap-3 rounded-[14px] px-2 py-2 ring-1 ring-white/[0.06]">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#123f3a] text-[15px] font-medium text-[#5eead4] uppercase ring-1 ring-[#1f9e8f]/50">
          {displayName.charAt(0) || "?"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium capitalize">{displayName}</p>
          <p className="truncate text-[12px] text-white/45" title={email}>
            {email}
          </p>
        </div>
        <form action={signOut}>
          <button
            title="Log out"
            aria-label="Log out"
            className="grid size-8 place-items-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-[#f2a3a3]"
          >
            <Logout className="size-[17px]" />
          </button>
        </form>
      </div>
    </aside>
  );
}

/** A sidebar row. Without href it renders as a disabled "coming soon" item. */
function NavItem({
  href,
  icon,
  active,
  badge,
  children,
}: {
  href?: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const cls = `flex items-center gap-3 rounded-[10px] px-3 py-2 text-[15.5px] transition ${
    active ? "bg-white/[0.05] text-white" : href ? "text-white/85 hover:bg-white/[0.04] hover:text-white" : "cursor-default text-white/45"
  }`;
  const body = (
    <>
      <span className={active ? "text-[#5eead4]" : href ? "text-white/80" : "text-white/40"}>{icon}</span>
      <span className="flex min-w-0 flex-1 items-center">{children}</span>
      {badge && <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10.5px] text-white/50">{badge}</span>}
    </>
  );
  return href ? (
    <Link href={href} className={cls} aria-current={active ? "page" : undefined}>
      {body}
    </Link>
  ) : (
    <div className={cls} aria-disabled>
      {body}
    </div>
  );
}
