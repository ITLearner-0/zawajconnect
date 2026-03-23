import { IslamicPattern } from '@/components/ui/islamic-pattern';
import { QuoteIcon } from 'lucide-react';

const quotes = [
  {
    text: 'And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.',
    source: 'Quran 30:21',
  },
  {
    text: 'Marriage is half of faith.',
    source: 'Prophet Muhammad (PBUH)',
  },
  {
    text: 'When a person gets married, they have fulfilled half of their religion.',
    source: 'Hadith',
  },
  {
    text: 'The most perfect believer in faith is the one whose character is finest and who is kindest to his wife.',
    source: 'Prophet Muhammad (PBUH)',
  },
];

const NearbyQuote = () => {
  // Randomly select a quote
  const quote = quotes[Math.floor(Math.random() * quotes.length)] ?? quotes[0];

  return (
    <IslamicPattern variant="gradient" className="mt-6 p-6">
      <div className="flex items-start">
        <QuoteIcon className="text-emerald-600 h-6 w-6 mr-3 flex-shrink-0 mt-1" />
        <div>
          <p className="text-rose-700 italic mb-2">{quote?.text ?? ''}</p>
          <p className="text-emerald-600 text-sm font-medium text-right">
            — {quote?.source ?? ''}
          </p>
        </div>
      </div>
    </IslamicPattern>
  );
};

export default NearbyQuote;
