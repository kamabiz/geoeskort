type Props = {
  username?: string | null;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
};

export function CommunityAvatar({
  username,
  avatar,
  size = 'md',
  className,
  ariaLabel,
}: Props) {
  const fallback = (username?.[0] ?? '?').toUpperCase();
  const sizeClass =
    size === 'lg'
      ? 'community-avatar--lg'
      : size === 'sm'
        ? 'community-avatar--sm'
        : size === 'xs'
          ? 'community-avatar--xs'
          : '';
  const classes = ['community-avatar', sizeClass, className].filter(Boolean).join(' ');
  const label = ariaLabel ?? username ?? 'User';

  return (
    <span className={classes}>
      {avatar ? (
        <img
          src={avatar}
          alt={`${label} avatar`}
          className="community-avatar__img"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="community-avatar__fallback">{fallback}</span>
      )}
    </span>
  );
}
