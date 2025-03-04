
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import { getFeaturedResources } from '@/data/islamicResources';
import { resourceCategories } from '@/data/islamicResources';

const FeaturedResources: React.FC = () => {
  const featuredResources = getFeaturedResources();
  
  if (featuredResources.length === 0) {
    return null;
  }
  
  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Resources</h2>
        <Button variant="outline" asChild>
          <Link to="/resources">View All</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredResources.map(resource => (
          <Card key={resource.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline">
                  {resourceCategories.find(c => c.id === resource.category)?.name || 'Uncategorized'}
                </Badge>
                <Badge variant="secondary">{resource.contentType}</Badge>
              </div>
              <CardTitle className="line-clamp-2">{resource.title}</CardTitle>
              <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {resource.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{resource.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 ml-auto">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild className="w-full">
                <Link to={`/resources/${resource.id}`}>
                  Read More
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedResources;
