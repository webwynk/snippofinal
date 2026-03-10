export const LOGO_URL = "https://snippo.nextbusinesssolution.com/wp-content/uploads/2026/02/tmpd7p765pj-1.webp";

export default function BrandLogo({ size = 30, className = "", onClick = null }) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", lineHeight: 0, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick || undefined}
    >
      <img
        src={LOGO_URL}
        alt="Logo"
        className="brand-logo-img"
        style={{ height: size }}
      />
    </span>
  );
}
