'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useState } from 'react';

const categories = [
  { name: 'Fiction', desc: 'Novels and stories that are imagined rather than real' },
  { name: 'Non-Fiction', desc: 'True stories, facts, biographies, self-help, history, etc.' },
  { name: 'Adventure', desc: 'Exciting journeys, survival, exploration, danger' },
  { name: 'Arts', desc: 'Visual arts, photography, design, architecture' },
  { name: 'Children', desc: 'Picture books and stories for ages 0–12' },
  { name: 'Autobiography and Memoir', desc: 'Your personal life story or experiences' },
  { name: 'Biography', desc: 'Someone else’s life story written by you' },
  { name: 'Christmas', desc: 'Holiday-themed books (romance, children’s, cookery, etc.)' },
  { name: 'Contemporary', desc: 'Modern-day realistic fiction (often women’s fiction or literary)' },
  { name: 'Business & Management', desc: 'Entrepreneurship, leadership, finance, marketing' },
  { name: 'Crime', desc: 'Criminal investigations, police procedurals, heists' },
  { name: 'Conspiracy', desc: 'Secret plots, cover-ups, shadowy organizations' },
  { name: 'Dystopian', desc: 'Dark future societies, oppression, rebellion (e.g. Hunger Games)' },
  { name: 'Cookery', desc: 'Recipes, food writing, baking, diets' },
  { name: 'Erotica', desc: 'Explicit romantic/sexual content (18+ only)' },
  { name: 'Educational', desc: 'Textbooks, study guides, teaching resources' },
  { name: 'Fantasy', desc: 'Magic, mythical creatures, invented worlds (e.g. Lord of the Rings)' },
  { name: 'Geography and Environmental Planning', desc: 'Academic books on geography, urban studies, environment' },
  { name: 'General Fiction', desc: 'Mainstream novels that don’t fit a specific sub-genre' },
  { name: 'Health and Wellbeing', desc: 'Mental health, fitness, nutrition, mindfulness' },
  { name: 'Graphic Novel & Manga', desc: 'Comics, graphic novels, manga' },
  { name: 'History', desc: 'Historical events, eras, wars, figures' },
  { name: 'Historical Fiction', desc: 'Stories set in the past with fictional characters' },
  { name: 'Hobbies', desc: 'Crafting, gardening, collecting, DIY' },
  { name: 'Horror', desc: 'Scary, supernatural, psychological terror' },
  { name: 'Lifestyle, Sport & Leisure', desc: 'Fashion, travel lifestyle, sports memoirs' },
  { name: 'Humour', desc: 'Funny books, satire, comedy' },
  { name: 'Miscellaneous', desc: 'Doesn’t fit anywhere else (rarely used)' },
  { name: 'Mystery', desc: 'Whodunnits, puzzles, detective stories' },
  { name: 'Music and Instruments', desc: 'Music theory, biographies of musicians, instrument guides' },
  { name: 'Poetry', desc: 'Collections of poems' },
  { name: 'Philosophy', desc: 'Deep thinking, ethics, existential ideas' },
  { name: 'Romance', desc: 'Love stories with emotional payoff and HEA/HFN' },
  { name: 'Planner', desc: 'Journals, diaries, productivity planners' },
  { name: 'Sagas', desc: 'Multi-generational family dramas, often historical' },
  { name: 'Politics and Government', desc: 'Political science, policy, elections' },
  { name: 'Sci-Fi', desc: 'Science-based future worlds, space, aliens, technology' },
  { name: 'Religion', desc: 'Theology, spirituality, religious history' },
  { name: 'Short Stories', desc: 'Anthologies or collections of short fiction' },
  { name: 'Self Help and Personal Development', desc: 'How-to guides for improving life, mindset, success' },
  { name: 'Teenagers', desc: 'Ages 13–17, coming-of-age, school drama' },
  { name: 'Society & Social Sciences', desc: 'Sociology, psychology, anthropology' },
  { name: 'Thrillers', desc: 'Fast-paced suspense, psychological tension, twists' },
  { name: 'Travel and Guides', desc: 'Travel memoirs, destination guides' },
  { name: 'Travel', desc: 'Personal travel stories and adventures' },
  { name: 'True Crime', desc: 'Real-life crimes and investigations' },
  { name: 'War', desc: 'Military history or war-based fiction' },
  { name: 'Young Adult', desc: 'Ages 12–18, often with strong themes of identity and growth' },
];

type Props = {
  selected: string[];
  setSelected: (categories: string[]) => void;
};

export default function Step4BookCategory({ selected, setSelected }: Props) {
  const [showWarning, setShowWarning] = useState(false);

  const handleChange = (category: string, checked: boolean) => {
    if (checked && selected.length >= 3) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }

    setSelected(
      checked
        ? [...selected, category]
        : selected.filter(c => c !== category)
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold">Book Category (Select up to 3)</h3>
        <p className="text-muted-foreground mt-2">
          Choose the <strong>best-fitting</strong> categories. This helps with marketing and design.
        </p>
      </div>

      {showWarning && (
        <div className="p-4 text-center text-destructive bg-destructive/10 rounded-lg">
          You can only select up to 3 categories. Please deselect one.
        </div>
      )}

      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <label
              key={cat.name}
              className={`
                group flex items-center p-5 border rounded-xl cursor-pointer transition-all
                ${selected.includes(cat.name)
                  ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                  : 'border-border hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                }
              `}
            >
              <Checkbox
                checked={selected.includes(cat.name)}
                onCheckedChange={(checked) => handleChange(cat.name, checked as boolean)}
                className="mr-4 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <span className="font-medium flex-1">{cat.name}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground group-hover:text-red-600" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{cat.desc}</p>
                </TooltipContent>
              </Tooltip>
            </label>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}