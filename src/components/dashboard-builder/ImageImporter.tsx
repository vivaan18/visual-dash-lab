import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ImageImporterProps {
  open: boolean;
  onClose: () => void;
  onTemplateGenerated: (payload: any) => void;
}

export default function ImageImporter({ open, onClose, onTemplateGenerated }: ImageImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [useServer, setUseServer] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFile = (f: File | null) => {
    setFile(f);
  };

  // Local parse stub (returns empty suggestion list)
  const parseLocally = async (blob: Blob) => {
    // Placeholder: real implementation would use Tesseract.js / OpenCV.js
    return { suggestions: [] };
  };

  const handleGenerate = async () => {
    if (!file) {
      toast({ title: 'Pick an image first' });
      return;
    }
    setLoading(true);
    try {
      const blob = file;
      if (useServer) {
        // optional: send to serverless function (not implemented)
        try {
          const fd = new FormData();
          fd.append('image', blob, file.name);
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const res = await fetch('/api/parse-image', { method: 'POST', body: fd, signal: controller.signal });
          clearTimeout(timeout);
          if (res.ok) {
            const json = await res.json();
            if (json?.suggestions?.length) {
              onTemplateGenerated(json);
              onClose();
              return;
            }
          }
        } catch (err) {
          console.warn('Server parse failed, falling back to local', err);
        }
      }

      const local = await parseLocally(blob);
      if (local?.suggestions?.length) {
        onTemplateGenerated(local);
        onClose();
        return;
      }

      toast({ title: 'No template found', description: 'Could not extract a dashboard from the image.' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Parsing failed', description: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Import from image</DialogTitle>
          <DialogDescription>Upload a screenshot or sketch and let AI suggest a dashboard template.</DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <div className="grid gap-2">
            <Label>Choose Image</Label>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </div>

          <div className="flex items-center gap-2">
            <input id="useServer" type="checkbox" checked={useServer} onChange={(e) => setUseServer(e.target.checked)} />
            <Label htmlFor="useServer">Use server AI (optional)</Label>
          </div>

          <div className="text-xs text-gray-500">Local parsing used by default. Server AI will upload image if enabled.</div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={loading}>{loading ? 'Parsing…' : 'Parse image'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
