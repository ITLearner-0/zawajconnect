import { ContentFlag } from '@/types/profile';

interface FlaggedContent {
  flags: {
    flag_type: ContentFlag['flag_type'];
    severity: ContentFlag['severity'];
  }[];
  isFiltered: boolean;
  filteredContent: string;
}

/**
 * Filters message content for inappropriate terms
 */
export const filterMessageContent = (content: string): FlaggedContent => {
  // Inappropriate terms to filter
  const inappropriateTerms = [
    { term: 'dating', flag: 'religious_violation' as const, severity: 'high' as const },
    { term: 'girlfriend', flag: 'religious_violation' as const, severity: 'high' as const },
    { term: 'boyfriend', flag: 'religious_violation' as const, severity: 'high' as const },
    { term: 'alcohol', flag: 'inappropriate' as const, severity: 'medium' as const },
    { term: 'drinking', flag: 'inappropriate' as const, severity: 'medium' as const },
    { term: 'meet alone', flag: 'suspicious' as const, severity: 'medium' as const },
    { term: 'private meeting', flag: 'suspicious' as const, severity: 'medium' as const },
    { term: 'flirting', flag: 'inappropriate' as const, severity: 'medium' as const },
    { term: 'sexy', flag: 'inappropriate' as const, severity: 'high' as const },
    { term: 'phone number', flag: 'suspicious' as const, severity: 'low' as const },
    { term: 'address', flag: 'suspicious' as const, severity: 'low' as const },
  ];

  let filteredContent = content;
  const flags: { flag_type: ContentFlag['flag_type']; severity: ContentFlag['severity'] }[] = [];
  let isFiltered = false;

  // Check for inappropriate terms
  inappropriateTerms.forEach((item) => {
    const regex = new RegExp(item.term, 'gi');
    if (regex.test(content)) {
      filteredContent = filteredContent.replace(regex, '***');
      isFiltered = true;

      // Add flag if not already added for this type
      if (!flags.some((f) => f.flag_type === item.flag)) {
        flags.push({
          flag_type: item.flag,
          severity: item.severity,
        });
      }
    }
  });

  return {
    flags,
    isFiltered,
    filteredContent,
  };
};
