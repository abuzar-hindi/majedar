import Image from "next/image";

/**
 * Official Majedaar Restaurant Brand Logo Component
 *
 * @param {"full" | "mark" | "wordmark"} variant - Visual variant (wordmark falls back to full logo)
 * @param {string} className - Optional Tailwind or CSS class names
 * @param {string} alt - Accessibility alt text
 * @param {boolean} priority - Next.js image priority hint
 */
export default function Logo({
  variant = "full",
  className = "h-10 w-auto",
  alt = "Majedaar Restaurant",
  priority = false,
  ...props
}) {
  const isMark = variant === "mark";

  const src = isMark ? "/brand/logo-mark.svg" : "/brand/logo-full.svg";
  const intrinsicWidth = isMark ? 152 : 626;
  const intrinsicHeight = isMark ? 215 : 286;

  return (
    <Image
      src={src}
      alt={alt}
      width={intrinsicWidth}
      height={intrinsicHeight}
      priority={priority}
      className={`select-none object-contain ${className}`}
      {...props}
    />
  );
}
