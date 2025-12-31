'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

type Props = {
  data: any;
  updateData: (data: Partial<any>) => void;
};

export default function Step5CoverDesign({ data, updateData }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(data.coverImage || null);

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
        updateData({ coverImage: json.secure_url });
      } else {
        console.error('Upload failed:', json);
        // Optional: revert preview on server failure
        setPreview(data.coverImage || null);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label>Cover Image Upload</Label>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          {preview ? (
            <img
              src={preview}
              alt="Cover preview"
              className="mx-auto max-h-96 rounded-lg shadow-lg object-contain"
            />
          ) : (
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          )}

          <div className="mt-6">
            {/* Fixed upload trigger using shadcn/ui best practices */}
            <div className="relative inline-block">
              <input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" disabled={uploading} asChild>
                <label htmlFor="cover-image-upload" className="cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Choose Cover Image'
                  )}
                </label>
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            High-resolution JPG/PNG • 1600×2560 recommended
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cover Idea Description</Label>
        <p className="text-sm text-muted-foreground">
          Be as specific as possible — this directly influences your final cover!
        </p>
        <Textarea
          rows={6}
          value={data.coverIdea || ''}
          onChange={(e) => updateData({ coverIdea: e.target.value })}
          placeholder="A dark forest with a glowing path leading to a mysterious castle..."
        />
      </div>

      <div className="space-y-2">
        <Label>Final Cover Design Notes</Label>
        <p className="text-sm text-muted-foreground">
          Optional, but highly recommended. Be vivid!
        </p>
        <Textarea
          rows={6}
          value={data.coverNotes || ''}
          onChange={(e) => updateData({ coverNotes: e.target.value })}
          placeholder="Prefer bold red tones, minimalist style, author's name in gold..."
        />
      </div>
    </div>
  );
}