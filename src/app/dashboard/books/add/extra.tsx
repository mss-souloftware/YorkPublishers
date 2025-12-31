'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, ChevronRight, Upload, ChartBarStacked, NotebookTabs, FileText, User, Image, Shield, Mic, CreditCard, Info, Archive } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from "next/navigation";
import Sidebar from '@/components/Global/Sidebar';
import Header from '@/components/Global/Header';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const steps = [
  { id: 1, title: 'Personal Information', icon: User },
  { id: 2, title: 'Book Details', icon: FileText },
  { id: 3, title: 'Additional Details', icon: NotebookTabs },
  { id: 4, title: 'Book Category', icon: ChartBarStacked },
  { id: 5, title: 'Cover Design', icon: Image },
  // { id: 6, title: 'Audiobook', icon: Mic },
  // { id: 7, title: 'Copyright', icon: Info },
  // { id: 8, title: 'Manuscript', icon: Archive },
  { id: 6, title: 'Payment', icon: CreditCard },
];

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

export default function NewBookSubmission() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const progress = (currentStep / steps.length) * 100;
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked && selectedCategories.length >= 3) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }

    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className=" border-b border-border px-6 py-4">
          <h1 className="text-3xl font-bold">Submit New Book for Publishing</h1>
          <p className="text-muted-foreground">Complete all steps to send your manuscript for review</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Step {currentStep} of {steps.length}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="grid grid-cols-6 gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${currentStep >= step.id
                      ? 'border-primary bg-primary/10'
                      : 'border-muted-foreground/30'
                      }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-center">{step.title}</p>
                </div>
              ))}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>
                  {currentStep === 1 && 'Enter basic information about yourself'}
                  {currentStep === 2 && 'Upload your final manuscript file'}
                  {currentStep === 3 && 'Upload a proposed cover design'}
                  {currentStep === 4 && 'Request copyright registration assistance'}
                  {currentStep === 5 && 'Help our designers understand your vision. The more detail, the better the result!'}
                  {/* {currentStep === 6 && 'One last chance to share your vision for the cover. After this, you’re done!'} */}
                  {/* {currentStep === 7 && 'Final Audiobook Notes'} */}
                  {currentStep === 6 && 'Complete payment to submit for review'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label>Pen Name</Label>
                        <Input placeholder="Doe" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Mobile Phone</Label>
                        <Input type='text' placeholder="+1 (555) 123-4567" />
                      </div>
                      <div className="space-y-2">
                        <Label>Home Phone</Label>
                        <Input type="text" placeholder='+1 (555) 123-4567' />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Home Address</Label>
                      <Input placeholder="123 Main St, Anytown, USA" />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Email Address</Label>
                      <Input type='email' placeholder="d0i4o@example.com" />
                    </div>
                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">Profile Picture</p>
                        <p className="text-sm text-muted-foreground">PDF, JPEG, or PNG • Max 5MB</p>
                        <Button variant="outline" className="mt-4">
                          Choose File
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Please ensure this is of good resolution/quality — head-and-shoulders with a neutral background.
                      </p>
                    </div>
                  </>
                )}

                {/* Step 2: Book Details */}
                {currentStep === 2 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Book Title</Label>
                        <Input placeholder="The Great Adventure" />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtitle (optional)</Label>
                        <Input type='text' placeholder="A Tale of Adventure" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>About the Author</Label>
                      <p className="text-sm text-muted-foreground">Approximately 50–100 words. Written in third person.</p>
                      <Input placeholder="I am a writer with a passion for storytelling." />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Photographs Within the Manuscrip</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Copyrighted Material Used Within Manuscript</Label>
                      <Textarea rows={6} placeholder="None" />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Input placeholder="Teenagers, Adults" />
                    </div>
                  </>
                )}

                {/* Step 3: Additional Details  */}
                {currentStep === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label>Dedications</Label>
                      <p className='text-sm text-muted-foreground'>Optional • Keep it brief and heartfelt</p>
                      <Textarea rows={6} placeholder="None" />
                    </div>
                    <div className="space-y-2">
                      <Label>Acknowledgements</Label>
                      <p className='text-sm text-muted-foreground'>Thank everyone who supported your writing journey</p>
                      <Textarea rows={6} placeholder="None" />
                    </div>
                    <div className="space-y-2">
                      <Label>Back Cover Blurbs</Label>
                      <p className='text-sm text-muted-foreground'>120–180 words • Third person • Dramatic & engaging • No spoilers!</p>
                      <Textarea rows={6} placeholder="None" />
                    </div>
                  </>
                )}

                {/* Step 4: Book Category  */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold">Book Category (Select up to 3)</h3>
                      <p className="text-muted-foreground mt-2">
                        Choose the <strong>best-fitting</strong> categories for your book. This helps with marketing, cover design, and retail placement.
                      </p>
                    </div>

                    {showWarning && (
                      <div className="p-4 text-center text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
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
                              ${selectedCategories.includes(cat.name)
                                ? 'border-red-600 bg-red-50 dark:bg-red-950/30'
                                : 'border-border hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                              }
                            `}
                          >
                            <Checkbox
                              checked={selectedCategories.includes(cat.name)}
                              onCheckedChange={(checked) => handleCategoryChange(cat.name, checked as boolean)}
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
                )}

                {/* Step 5: Cover Design */}
                {currentStep === 5 && (

                  <div className="space-y-6">

                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center">
                      <Image className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium">Upload Cover Design</p>
                      <p className="text-sm text-muted-foreground">High-res JPG/PNG • 1600x2560 recommended</p>
                      <Button variant="outline" className="mt-4">
                        Choose File
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Cover Idea Description</Label>
                      <p className='text-sm text-muted-foreground'>Be as specific as possible — this directly influences your final cover!</p>
                      <Textarea rows={6} placeholder="None" />
                    </div>
                    <div className="space-y-2">
                      <Label>Final Cover Design Notes</Label>
                      <p className='text-sm text-muted-foreground'>Optional, but highly recommended. Be vivid — this is your last input for the designers!</p>
                      <Textarea rows={6} placeholder="None" />
                    </div>
                    {/* <div className="space-y-2">
                      <Label>Designer Name (optional)</Label>
                      <Input placeholder="John Doe Designs" />
                    </div> */}
                  </div>
                )}

              
                {/* {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Final Cover Design Notes</Label>
                      <p className='text-sm text-muted-foreground'>Be as specific as possible — this directly influences your final cover!</p>
                      <Textarea rows={6} placeholder="None" />
                    </div>
                  </div>
                )}

             
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <RadioGroup defaultValue="no">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="audio-yes" />
                        <Label htmlFor="audio-yes">Yes, produce an audiobook version</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="audio-no" />
                        <Label htmlFor="audio-no">No audiobook needed</Label>
                      </div>
                    </RadioGroup>
                    <div className="space-y-2">
                      <Label>Preferred Narrator Style (optional)</Label>
                      <Input placeholder="Deep male voice, British accent..." />
                    </div>
                  </div>
                )}

                {currentStep === 8 && (
                  <div className="space-y-6">
                    <RadioGroup defaultValue="yes">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="copyright-yes" />
                        <Label htmlFor="copyright-yes">Yes, I want assistance registering copyright</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="copyright-no" />
                        <Label htmlFor="copyright-no">No, I will handle copyright myself</Label>
                      </div>
                    </RadioGroup>
                    <div className="space-y-2">
                      <Label>Additional Notes (optional)</Label>
                      <Textarea rows={4} placeholder="Any special instructions for copyright filing..." />
                    </div>
                  </div>
                )}

        
                {currentStep === 9 && (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium">Drop your manuscript here</p>
                      <p className="text-sm text-muted-foreground">PDF, DOCX, or EPUB • Max 50MB</p>
                      <Button variant="outline" className="mt-4">
                        Choose File
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Version: Draft v1.0 • Submitted automatically upon completion
                    </p>
                  </div>
                )} */}

         
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between">
                        <span>Manuscript Review Fee</span>
                        <span className="font-semibold">$149.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Copyright Assistance (optional)</span>
                        <span className="font-semibold">$99.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Audiobook Production Deposit (optional)</span>
                        <span className="font-semibold">$299.00</span>
                      </div>
                      <div className="border-t pt-4 flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>$547.00</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Card Number</Label>
                        <Input placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Expiry</Label>
                          <Input placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label>CVC</Label>
                          <Input placeholder="123" />
                        </div>
                        <div className="space-y-2">
                          <Label>ZIP</Label>
                          <Input placeholder="12345" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep === steps.length ? (
                    <Button size="lg">
                      Submit for Review
                    </Button>
                  ) : (
                    <Button onClick={nextStep}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}