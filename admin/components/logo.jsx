import Image from "next/image";

/**
 * Official Majedaar Restaurant Brand Logo Component for Admin Panel
 *
 * @param {"full" | "mark" | "wordmark"} variant - Visual variant (wordmark falls back to full logo)
 * @param {string} className - Optional Tailwind or CSS class names
 * @param {string} alt - Accessibility alt text
 * @param {boolean} priority - Next.js image priority hint
 */
export default function Logo({
  variant = "full",
  className = "",
  style = {},
  alt = "Majedaar Restaurant",
  priority = false,
  ...props
}) {
  const isMark = variant === "mark";

  const src = isMark ? "/brand/logo-mark.svg" : "/brand/logo-full.svg";
  const intrinsicWidth = isMark ? 152 : 626;
  const intrinsicHeight = isMark ? 215 : 286;

  const defaultStyle = isMark
    ? { height: "28px", width: "auto", maxHeight: "28px", maxWidth: "32px", objectFit: "contain", display: "inline-block", verticalAlign: "middle" }
    : { height: "30px", width: "auto", maxHeight: "30px", objectFit: "contain", display: "inline-block", verticalAlign: "middle" };

  return (
    <Image
      src={src}
      alt={alt}
      width={intrinsicWidth}
      height={intrinsicHeight}
      priority={priority}
      style={{ ...defaultStyle, ...style }}
      className={`select-none object-contain ${className}`}
      {...props}
    />
  );
}
