import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (f: File | null) => {
      setError(null);
      if (!f) {
        onFile(null);
        return;
      }

      const isImage = VALID_IMAGE.includes(f.type);
      const isVideo = VALID_VIDEO.includes(f.type);

      if (isPortrait ? (!isImage && !isVideo) : !isImage) {
        const allowed = isPortrait ? 'PNG, JPG, WebP, GIF, MP4, WebM' : 'PNG, JPG, WebP, GIF';
        setError(`Invalid file type. Accepted: ${allowed}`);
        return;
      }
      if (f.size > MAX_SIZE) {
        setError('File too large (max 25MB)');
        return;
      }

      setUploading(true);
      try {
        const url = await api.uploadMedia(f);
        onFile(url, isVideo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
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

  return (
    <div>
      <div className="upload-label">{label}</div>
      <div
        className={`upload-zone${dragging ? ' dragging' : ''}${file ? ' has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        onClick={() => !file && !uploading && ref.current?.click()}
      >
        <input
          ref={ref}
          type="file"
          accept={isPortrait ? 'image/*,video/mp4,video/webm,video/mov' : 'image/*'}
          style={{ display: 'none' }}
          onChange={change}
        />
        {uploading ? (
          <div className="upload-text">Uploading…</div>
        ) : file ? (
          <>
            {isVideoFile ? (
              <video src={file} className="preview" autoPlay loop muted playsInline />
            ) : (
              <img src={file} className="preview" alt="Preview" />
            )}
            <button className="remove-file" onClick={(e) => { e.stopPropagation(); onFile(null); }}>
              ×
            </button>
          </>
        ) : (
          <>
            <div className="upload-icon">{isPortrait ? '🎬' : '📷'}</div>
            <div className="upload-text">Drag & drop or click<br/>{isPortrait ? 'Image or video' : 'Image only'}</div>
          </>
        )}
      </div>
      {error && <div style={{ color: '#ff5050', fontSize: '11px', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}
