import React from 'react';

interface ZAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizePx = { sm: 32, md: 44, lg: 64, xl: 80 };
const fontSizes = { sm: 12, md: 15, lg: 22, xl: 28 };

export const ZAvatar: React.FC<ZAvatarProps> = ({ src, name, size = 'md' }) => {
  const px = sizePx[size];
  const initials = name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <div
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        fontSize: fontSizes[size],
        flexShrink: 0,
        background: 'var(--color-primary-muted)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-primary-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        overflow: 'hidden',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initials
      )}
    </div>
  );
};
