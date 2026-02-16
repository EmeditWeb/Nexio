/**
 * ImagePreview — full-size image viewer overlay.
 */
const ImagePreview = ({ src, onClose }) => {
    return (
        <div className="image-preview-overlay" onClick={onClose}>
            <img src={src} alt="Preview" onClick={e => e.stopPropagation()} />
        </div>
    );
};

export default ImagePreview;
