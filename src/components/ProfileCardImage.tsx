import React, { useState } from 'react';

interface ProfileCardImageProps {
  imagePath?: string;
  spritePosition?: string;
  className?: string;
  altName: string;
}

export const ProfileCardImage: React.FC<ProfileCardImageProps> = ({
  imagePath,
  spritePosition,
  className = '',
  altName,
}) => {
  const [loadError, setLoadError] = useState(false);

  // If a direct imagePath is provided and hasn't failed to load
  if (imagePath && !loadError) {
    return (
      <img
        src={imagePath}
        alt={altName}
        onError={() => setLoadError(true)}
        className={`w-full h-full object-cover select-none pointer-events-none ${className}`}
        loading="lazy"
        draggable={false}
      />
    );
  }

  // Fallback to spritePosition or default tinder_bg
  return (
    <div
      role="img"
      aria-label={altName}
      className={`w-full h-full bg-no-repeat bg-cover ${className}`}
      style={{
        backgroundImage: 'url(/assets/aistudio/tinder_bg.jpg_d80d7a32.jpeg)',
        backgroundPosition: spritePosition || 'center center',
        backgroundSize: '245%',
      }}
    />
  );
};
