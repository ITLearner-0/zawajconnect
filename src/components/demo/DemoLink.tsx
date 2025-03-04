
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Video } from "lucide-react";

interface DemoLinkProps {
  className?: string;
}

const DemoLink = ({ className }: DemoLinkProps) => {
  return (
    <div className={`${className} flex justify-center`}>
      <Button asChild variant="outline" size="lg" className="gap-2">
        <Link to="/demo">
          <MessageSquare className="h-4 w-4" />
          <Video className="h-4 w-4" />
          <span>Try Messaging & Video Demo</span>
        </Link>
      </Button>
    </div>
  );
};

export default DemoLink;
