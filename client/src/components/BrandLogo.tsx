import { cn } from "@/lib/utils";

type BrandLogoProps = React.ImgHTMLAttributes<HTMLImageElement>;

export function BrandLogo({ className, ...props }: BrandLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Tap-E"
      className={cn("h-10 w-auto", className)}
      {...props}
    />
  );
}

