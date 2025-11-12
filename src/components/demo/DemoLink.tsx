import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageSquare, Video, Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface DemoLinkProps {
  className?: string;
}

const DemoLink = ({ className }: DemoLinkProps) => {
  const { t } = useTranslation();

  return (
    <div className={cn('flex justify-center', className)}>
      <Button
        asChild
        size="lg"
        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-base border-0 group"
      >
        <Link to="/demo" className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-5 w-5" />
            <Video className="h-5 w-5" />
          </div>
          <span>{t('home.demoSection.testDemo')}</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </Button>
    </div>
  );
};

export default DemoLink;
