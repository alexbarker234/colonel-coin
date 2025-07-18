import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { FaUsers } from "react-icons/fa";

interface GuildIconProps {
  iconURL?: string | null;
  name: string;
  className?: string;
}

const GuildIcon: React.FC<GuildIconProps> = ({ iconURL, name, className }) => {
  return iconURL ? (
    <Image
      src={iconURL}
      alt={`${name} icon`}
      width={128}
      height={128}
      className={cn("w-12 h-12 rounded-lg", className)}
    />
  ) : (
    <div className={cn("w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center", className)}>
      <FaUsers className="w-6 h-6 text-white" />
    </div>
  );
};

export default GuildIcon;
