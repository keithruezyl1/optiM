import { initials, roleColor } from "@/lib/roleColors";

// Generated default profile photo: the person's initials on a gradient circle
// color-coded by their role. No external images.
export function Avatar({
  name,
  role,
  size = 28,
}: {
  name: string;
  role: string;
  size?: number;
}) {
  const { from, to } = roleColor(role);
  return (
    <span
      aria-hidden
      title={role}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-1 ring-white/30"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        boxShadow: "0 1px 2px rgba(11,31,58,.18)",
      }}
    >
      {initials(name)}
    </span>
  );
}
