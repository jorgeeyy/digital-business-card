import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react';

const VALID_IMAGE = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const VALID_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];

interface UploadZoneProps {
  label: string;
  accept?: string;
  file: string | null;
  onFile: (dataUrl: string | null) => void;
  isPortrait?: boolean;
}

export default function UploadZone({ label, file, onFile, isPortrait }: UploadZoneProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (f: File | null) => {
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

      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        if (isVideo) {
          onFile(`data:video/mp4;base64,${url.split(',')[1]}`);
        } else {
          onFile(url);
        }
      };
      reader.readAsDataURL(f);
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
        onClick={() => !file && ref.current?.click()}
      >
        <input
          ref={ref}
          type="file"
          accept={isPortrait ? 'image/*,video/mp4,video/webm,video/mov' : 'image/*'}
          style={{ display: 'none' }}
          onChange={change}
        />
        {file ? (
          <>
            {file.startsWith('data:video') ? (
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
