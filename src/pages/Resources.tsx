
import React from 'react';
import { useParams } from 'react-router-dom';
import { getResourceById } from '@/data/islamicResources';
import ResourceDetail from '@/components/resources/ResourceDetail';
import ResourceList from '@/components/resources/ResourceList';

const Resources: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  
  // If resourceId is provided, show single resource view
  if (resourceId) {
    const resource = getResourceById(resourceId);
    return <ResourceDetail resource={resource} />;
  }
  
  // Resource listing view
  return <ResourceList />;
};

export default Resources;
