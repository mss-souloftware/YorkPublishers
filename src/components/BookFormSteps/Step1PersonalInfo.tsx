'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  data: any;
  updateData: (data: Partial<any>) => void;
};

export default function Step1PersonalInfo({ data, updateData }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(data.profileImage || null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/books/book-images', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.secure_url) {
        updateData({ profileImage: json.secure_url });
      } else {
        console.error('Upload failed:', json);
        // Optionally revert preview on failure
        setPreview(data.profileImage || null);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input
            value={data.fullName || ''}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label>Pen Name (optional)</Label>
          <Input
            value={data.penName || ''}
            onChange={(e) => updateData({ penName: e.target.value })}
            placeholder="J.D. Author"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Mobile Phone *</Label>
          <Input
            value={data.mobilePhone || ''}
            onChange={(e) => updateData({ mobilePhone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label>Home Phone (optional)</Label>
          <Input
            value={data.homePhone || ''}
            onChange={(e) => updateData({ homePhone: e.target.value })}
            placeholder="+1 (555) 987-6543"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Home Address *</Label>
        <Input
          value={data.address || ''}
          onChange={(e) => updateData({ address: e.target.value })}
          placeholder="123 Main St, Anytown, NY 12345"
        />
      </div>

      <div className="space-y-2">
        <Label>Preferred Email Address *</Label>
        <Input
          type="email"
          value={data.email || ''}
          onChange={(e) => updateData({ email: e.target.value })}
          placeholder="author@example.com"
        />
      </div>

      <div className="space-y-4">
        <Label>Profile Picture</Label>
        <div className="flex flex-col items-center gap-6">
          {preview ? (
            <img
              src={preview}
              alt="Profile preview"
              className="h-40 w-40 rounded-full object-cover border-4 border-background shadow-lg"
            />
          ) : (
            <div className="h-40 w-40 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Fixed: Proper label + input association */}
          <div className="relative">
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" disabled={uploading} asChild>
              <label htmlFor="profile-image-upload" className="cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Choose Profile Image'
                )}
              </label>
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center max-w-full">
          Please ensure this is a high-quality head-and-shoulders photo with a neutral background.
        </p>
      </div>
    </div>
  );
}