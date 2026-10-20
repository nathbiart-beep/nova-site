import Link from "next/link";

/** The NOVA four-point star, with its four small rays. */
export function Star({ size = 40, className, title }: { size?: number; className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M50 4C52.6 31 63 45 94 50C63 55 52.6 69 50 96C47.4 69 37 55 6 50C37 45 47.4 31 50 4ZM50 29C47.8 41 43 46.5 32 50C43 53.5 47.8 59 50 71C52.2 59 57 53.5 68 50C57 46.5 52.2 41 50 29Z"
      />
      <g stroke="currentColor" strokeWidth="4.5" strokeLinecap="round">
        <line x1="22" y1="22" x2="30" y2="31" />
        <line x1="78" y1="22" x2="70" y2="31" />
        <line x1="22" y1="78" x2="30" y2="69" />
        <line x1="78" y1="78" x2="70" y2="69" />
      </g>
    </svg>
  );
}

/** N✦VA wordmark: the O is the green star. */
export function Wordmark({ className, size = "1em" }: { className?: string; size?: string }) {
  return (
    <span className={`wordmark ${className ?? ""}`} style={{ fontSize: size }} aria-label="NOVA">
      <span aria-hidden="true">N</span>
      <Star className="wordmark-star" size={0} />
      <span aria-hidden="true">VA</span>
    </span>
  );
}

export function LogoLink() {
  return (
    <Link href="/" className="logo-link" aria-label="NOVA, accueil">
      <Wordmark />
    </Link>
  );
}
