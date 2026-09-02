import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  image?: string;
  /** Shown when there is no image, or when the image fails to load. */
  fallback: ReactNode;
  className?: string;
  style?: CSSProperties;
  alt?: string;
};

/**
 * Avatar that falls back to the emoji/initial when its picture cannot be
 * fetched. Without this a broken avatar URL left an empty coloured circle
 * with no hint of who the profile belongs to.
 */
export function ProfileAvatar({ image, fallback, className, style, alt = "" }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [image]);

  return (
    <span className={className} style={style}>
      {image && !failed ? <img src={image} alt={alt} onError={() => setFailed(true)} /> : fallback}
    </span>
  );
}

export default ProfileAvatar;
