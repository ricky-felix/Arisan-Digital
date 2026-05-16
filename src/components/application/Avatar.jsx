const PALETTE = [
  ["#10b981","#34d399"],["#a78bfa","#c4b5fd"],["#f59e0b","#fbbf24"],
  ["#3b82f6","#60a5fa"],["#ec4899","#f472b6"],["#14b8a6","#5eead4"],
  ["#8b5cf6","#a78bfa"],["#06b6d4","#67e8f9"],
];

function getColors(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initials(name) {
  return name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
}

const SIZES = { sm: "28px", md: "40px", lg: "56px", xl: "72px" };
const FONT_SIZES = { sm: "11px", md: "14px", lg: "18px", xl: "22px" };

export default function Avatar({ name, size = "md", className = "", style: extraStyle }) {
  const [c1, c2] = getColors(name || "?");
  const dim = SIZES[size] || SIZES.md;
  const fs = FONT_SIZES[size] || FONT_SIZES.md;
  return (
    <div
      className={`avatar ${size} ${className}`}
      style={{
        width: dim, height: dim,
        borderRadius: "999px",
        display: "grid", placeItems: "center",
        color: "#fff", fontWeight: 600, flexShrink: 0,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        fontSize: fs,
        ...extraStyle,
      }}
    >
      {initials(name || "?")}
    </div>
  );
}

export { initials, getColors };
