import { Link } from "@tanstack/react-router";

import logo from "@/assets/entrenos-logo.png";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** "full" mostra a logo completa; "mark" recorta apenas o símbolo. */
  variant?: "full" | "mark";
  asLink?: boolean;
};

export function Logo({ className, variant = "full", asLink = true }: LogoProps) {
  const image =
    variant === "full" ? (
      <img
        src={logo}
        alt="EntreNós"
        width={220}
        height={80}
        className={cn("h-11 w-auto object-contain", className)}
      />
    ) : (
      <span
        className={cn("block h-10 w-10 overflow-hidden rounded-xl", className)}
        aria-hidden="true"
      >
        <img
          src={logo}
          alt=""
          className="h-[260%] w-[260%] -translate-x-[46%] -translate-y-[19%] object-cover"
        />
      </span>
    );

  if (!asLink) return image;

  return (
    <Link to="/" aria-label="EntreNós — página inicial" className="inline-flex items-center">
      {image}
    </Link>
  );
}
