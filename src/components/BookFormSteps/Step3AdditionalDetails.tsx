import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  data: any;
  updateData: (data: Partial<any>) => void;
};

export default function Step3AdditionalDetails({ data, updateData }: Props) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label>Dedications</Label>
        <p className="text-sm text-muted-foreground mb-2">Optional • Keep it brief and heartfelt</p>
        <Textarea
          rows={4}
          value={data.dedications || ''}
          onChange={(e) => updateData({ dedications: e.target.value })}
          placeholder="To my loving family..."
        />
      </div>

      <div className="space-y-2">
        <Label>Acknowledgements</Label>
        <p className="text-sm text-muted-foreground mb-2">Thank everyone who supported your journey</p>
        <Textarea
          rows={6}
          value={data.acknowledgements || ''}
          onChange={(e) => updateData({ acknowledgements: e.target.value })}
          placeholder="I would like to thank..."
        />
      </div>

      <div className="space-y-2">
        <Label>Back Cover Blurb</Label>
        <p className="text-sm text-muted-foreground mb-2">
          120–180 words • Third person • Dramatic & engaging • No spoilers!
        </p>
        <Textarea
          rows={8}
          value={data.backCoverBlurb || ''}
          onChange={(e) => updateData({ backCoverBlurb: e.target.value })}
          placeholder="In a world where..."
        />
      </div>
    </div>
  );
}