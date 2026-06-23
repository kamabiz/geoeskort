type Props = {
  storyCount: number;
  onlineCount: number;
  memberCount: number;
  commentCount: number;
  labels: {
    stories: string;
    online: string;
    members: string;
    comments: string;
  };
};

export function HomeHeroStats({
  storyCount,
  onlineCount,
  memberCount,
  commentCount,
  labels,
}: Props) {
  return (
    <div className="hero__stats-deck hero__stats-deck--desktop" aria-label="Community stats">
      <div className="hero__stats hero__stats--desktop hero__stats--deck" role="list">
        <article className="hero__stat-card" role="listitem">
          <span className="hero__stat-card-icon" aria-hidden>📖</span>
          <span className="hero__stat-card-body">
            <strong className="hero__stat-value">{storyCount}</strong>
            <span className="hero__stat-label">{labels.stories}</span>
          </span>
        </article>
        <article className="hero__stat-card hero__stat-card--live" role="listitem">
          <span className="hero__stat-card-icon" aria-hidden>●</span>
          <span className="hero__stat-card-body">
            <strong className="hero__stat-value">{onlineCount}</strong>
            <span className="hero__stat-label">{labels.online}</span>
          </span>
        </article>
        <article className="hero__stat-card" role="listitem">
          <span className="hero__stat-card-icon" aria-hidden>👥</span>
          <span className="hero__stat-card-body">
            <strong className="hero__stat-value">{memberCount}</strong>
            <span className="hero__stat-label">{labels.members}</span>
          </span>
        </article>
        <article className="hero__stat-card" role="listitem">
          <span className="hero__stat-card-icon" aria-hidden>💬</span>
          <span className="hero__stat-card-body">
            <strong className="hero__stat-value">{commentCount}</strong>
            <span className="hero__stat-label">{labels.comments}</span>
          </span>
        </article>
      </div>
    </div>
  );
}
