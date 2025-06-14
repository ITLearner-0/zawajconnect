
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoLinkProps {
  className?: string;
}

const DemoLink = ({ className }: DemoLinkProps) => {
  return (
    <div className={cn("flex justify-center", className)}>
      <Button 
        asChild 
        variant="outline" 
        size="lg" 
        className="gap-2 border-islamic-gold text-islamic-gold bg-transparent hover:bg-islamic-gold/10 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 dark:border-islamic-darkGold dark:text-islamic-darkGold dark:hover:bg-islamic-darkGold/10"
      >
        <Link to="/demo">
          <MessageSquare className="h-5 w-5" />
          <Video className="h-5 w-5" />
          <span>Try Messaging & Video Demo</span>
        </Link>
      </Button>
    </div>
  );
};

export default DemoLink;

