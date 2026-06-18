import Link from 'next/link';

type Props = {
  href?: string;
  className?: string;
};

export function SiteLogo({ href = '/', className = '' }: Props) {
  const label = (
    <>
      <span className="site-logo__intim">Intim</span>
      <span className="site-logo__gram">gram</span>
    </>
  );

  const classes = `site-logo${className ? ` ${className}` : ''}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {label}
      </Link>
    );
  }

  return <span className={classes}>{label}</span>;
}
