import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Step6Payment() {
  return (
    <div className="space-y-8">
      <div className="bg-muted/50 rounded-lg p-8 space-y-6">
        <h3 className="text-xl font-semibold">Order Summary</h3>
        <div className="space-y-4">
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
          <div className="border-t pt-4 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>$547.00</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Payment Details</h3>
        <div className="space-y-2">
          <Label>Card Number</Label>
          <Input placeholder="1234 5678 9012 3456" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input placeholder="MM/YY" />
          </div>
          <div className="space-y-2">
            <Label>CVC</Label>
            <Input placeholder="123" />
          </div>
          <div className="space-y-2">
            <Label>ZIP Code</Label>
            <Input placeholder="12345" />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Your card will be charged upon submission. All fees are non-refundable.
      </p>
    </div>
  );
}