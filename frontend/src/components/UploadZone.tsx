import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { api } from '../api';

const VALID_IMAGE = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const VALID_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_SIZE = 25 * 1024 * 1024;

interface UploadZoneProps {
  label: string;
  file: string | null;
  onFile: (url: string | null, isVideo?: boolean) => void;
  isPortrait?: boolean;
  isVideoFile?: boolean;
}

export default function UploadZone({ label, file, onFile, isPortrait, isVideoFile }: UploadZoneProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (f: File | null) => {
      if (!f) {
        onFile(null);
        return;
      }

      const isImage = VALID_IMAGE.includes(f.type);
      const isVideo = VALID_VIDEO.includes(f.type);

      if (isPortrait ? (!isImage && !isVideo) : !isImage) {
        const allowed = isPortrait ? 'PNG, JPG, WebP, GIF, MP4, WebM' : 'PNG, JPG, WebP, GIF';
        toast.error(`Invalid file type. Accepted: ${allowed}`);
        return;
      }
      if (f.size > MAX_SIZE) {
        toast.error('File too large (max 25MB)');
        return;
      }

      setUploading(true);
      try {
        const url = await api.uploadMedia(f);
        onFile(url, isVideo);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onFile, isPortrait],
  );

  const drop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const change = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      e.target.value = '';
    },
    [handleFile],
  );

  const zoneClass = [
    'upload-drop',
    dragging ? 'drag' : '',
    file ? 'upload-filled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="upload-zone">
      <div className="label">{label}</div>
      <div
        className={zoneClass}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        onClick={() => !file && !uploading && ref.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!file && !uploading) ref.current?.click();
          }
        }}
      >
        <input
          ref={ref}
          type="file"
          accept={isPortrait ? 'image/*,video/mp4,video/webm,video/mov' : 'image/*'}
          hidden
          onChange={change}
        />
        {uploading ? (
          <div>Uploading…</div>
        ) : file ? (
          <>
            {isVideoFile ? (
              <video src={file} autoPlay loop muted playsInline />
            ) : (
              <img src={file} alt={`${label} preview`} />
            )}
            <button
              type="button"
              className="upload-remove"
              aria-label={`Remove ${label}`}
              onClick={(e) => {
                e.stopPropagation();
                onFile(null);
              }}
            >
              ×
            </button>
          </>
        ) : (
          <>
            <div className="icon" aria-hidden="true">
              {isPortrait ? '🎬' : '📷'}
            </div>
            <div>
              Drag &amp; drop or click
              <br />
              {isPortrait ? 'Image or video' : 'Image only'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
