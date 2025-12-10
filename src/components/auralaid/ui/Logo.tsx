import { Stethoscope } from 'lucide-react';

interface LogoProps {
  size?: number;
}

const Logo = ({ size = 24 }: LogoProps) => {
  return (
    <div className="rounded-lg bg-primary p-1.5 text-white">
      <Stethoscope size={size} />
    </div>
  );
};

export default Logo;