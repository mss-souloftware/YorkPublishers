import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  data: any;
  updateData: (data: Partial<any>) => void;
};

export default function Step2BookDetails({ data, updateData }: Props) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Book Title *</Label>
          <Input
            value={data.title || ''}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="The Great Adventure"
          />
        </div>
        <div className="space-y-2">
          <Label>Subtitle (optional)</Label>
          <Input
            value={data.subtitle || ''}
            onChange={(e) => updateData({ subtitle: e.target.value })}
            placeholder="A Journey Beyond Imagination"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>About the Author</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Approximately 50–100 words. Written in third person.
        </p>
        <Textarea
          rows={6}
          value={data.aboutAuthor || ''}
          onChange={(e) => updateData({ aboutAuthor: e.target.value })}
          placeholder="John Doe is a passionate storyteller..."
        />
      </div>

      <div className="space-y-2">
        <Label>Number of Photographs in Manuscript</Label>
        <Input
          type="number"
          min="0"
          value={data.photoCount || ''}
          onChange={(e) => updateData({ photoCount: e.target.value })}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label>Copyrighted Material Used</Label>
        <Textarea
          rows={5}
          value={data.copyrightedMaterial || ''}
          onChange={(e) => updateData({ copyrightedMaterial: e.target.value })}
          placeholder="None"
        />
      </div>

      <div className="space-y-2">
        <Label>Target Audience</Label>
        <Input
          value={data.targetAudience || ''}
          onChange={(e) => updateData({ targetAudience: e.target.value })}
          placeholder="Young adults, fantasy readers"
        />
      </div>
    </div>
  );
}