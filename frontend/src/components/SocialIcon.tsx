import { socialIconSvg } from '../utils/socials';

interface SocialIconProps {
  platform: string;
  size?: number;
}

export default function SocialIcon({ platform, size = 16 }: SocialIconProps) {
  return (
    <span
      className="social-icon"
      aria-hidden="true"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: socialIconSvg(platform) }}
    />
  );
}
