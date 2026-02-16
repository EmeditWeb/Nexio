/**
 * ImagePreview — full-screen lightbox for viewing images.
 */
const ImagePreview = ({ src, onClose }) => {
    if (!src) return null;

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <button className="lightbox-close" onClick={onClose} aria-label="Close preview">✕</button>
            <img
                className="lightbox-image"
                src={src}
                alt="Preview"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

export default ImagePreview;
