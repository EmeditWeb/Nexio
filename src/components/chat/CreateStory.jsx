import { useState, useRef } from 'react';

/**
 * CreateStory — modal for creating text or image stories.
 */
const CreateStory = ({ onClose, onCreate }) => {
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [creating, setCreating] = useState(false);
    const fileRef = useRef();

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handleCreate = async () => {
        if (!content.trim() && !mediaFile) return;
        setCreating(true);
        await onCreate(content.trim(), mediaFile);
        setCreating(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                <div className="modal-header">
                    <button className="icon-btn" onClick={onClose}>←</button>
                    <h3>Create Story</h3>
                </div>

                <div className="modal-body">
                    {/* Image preview */}
                    {mediaPreview && (
                        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                            <img
                                src={mediaPreview}
                                alt="Preview"
                                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                            />
                            <div
                                className="text-muted"
                                style={{ cursor: 'pointer', marginTop: '6px', fontSize: '13px' }}
                                onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                            >
                                ✕ Remove image
                            </div>
                        </div>
                    )}

                    <textarea
                        className="modal-textarea"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={3}
                        autoFocus
                    />

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="modal-btn modal-btn-secondary"
                            onClick={() => fileRef.current?.click()}
                        >
                            📷 Add Photo
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileRef}
                            style={{ display: 'none' }}
                            onChange={handleImageSelect}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="modal-btn modal-btn-primary"
                        onClick={handleCreate}
                        disabled={creating || (!content.trim() && !mediaFile)}
                    >
                        {creating ? 'Posting...' : 'Post Story'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStory;
