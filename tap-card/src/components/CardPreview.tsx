import { useRef, useEffect } from 'react';

interface CardPreviewProps {
  html: string | null;
}

export default function CardPreview({ html }: CardPreviewProps) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe || !html) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  return (
    <div className="preview-panel">
      <div className="preview-label">Preview</div>
      <div className="preview-frame">
        {html ? (
          <iframe ref={ref} title="Card preview" sandbox="allow-same-origin" />
        ) : (
          <div className="preview-empty">
            Fill in your details and the card will render live here.
          </div>
        )}
      </div>
    </div>
  );
}
