import { LucideProps } from 'lucide-react';
import { 
  Home, 
  User, 
  Search, 
  Heart, 
  MessageCircle, 
  BookOpen, 
  Users, 
  Settings, 
  Shield, 
  CheckCircle, 
  TrendingUp, 
  Eye, 
  Lock, 
  Compass, 
  Target, 
  BarChart3, 
  Crown, 
  HelpCircle, 
  Zap,
  Calendar,
  Bell,
  Clock,
  Star
} from 'lucide-react';

// Icon mapping for the application
const iconMap = {
  Home,
  User,
  Search,
  Heart,
  MessageCircle,
  BookOpen,
  Users,
  Settings,
  Shield,
  CheckCircle,
  TrendingUp,
  Eye,
  Lock,
  Compass,
  Target,
  BarChart3,
  Crown,
  HelpCircle,
  Zap,
  Calendar,
  Bell,
  Clock,
  Star
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps extends LucideProps {
  name: IconName;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return <IconComponent {...props} />;
};

export default Icon;