import Image from "next/image";

type Props = {
  src: string | null;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
};

/**
 * Imagen optimizada con next/image (AVIF/WebP, srcset responsivo y
 * dimensiones reservadas con `fill` + aspect-ratio del contenedor → CLS 0).
 */
export function ProductImage({ src, alt, sizes, preload = false, className = "" }: Props) {
  return (
    <div className={`relative aspect-[3/2] overflow-hidden bg-zinc-100 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          className="object-cover"
        />
      ) : (
        <div className="grid h-full place-items-center text-sm text-zinc-400">Sin imagen</div>
      )}
    </div>
  );
}
