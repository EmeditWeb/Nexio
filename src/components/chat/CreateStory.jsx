import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUpload } from '../../hooks/useUpload';

/**
 * CreateStory — modal for creating text or image stories.
 */
const CreateStory = ({ onClose, onCreated, storiesHook }) => {
    const { currentUser } = useAuth();
    const [mode, setMode] = useState('text'); // 'text' | 'image'
    const [text, setText] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [file, setFile] = useState(null);
    const [creating, setCreating] = useState(false);
    
    // We don't use useUpload hook here because useStories.createStory handles upload internally now
    // This simplifies the double-handling logic

    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        e.target.value = '';
        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));
        setMode('image');
    };

    const handleCreate = async () => {
        if (creating) return;
        setCreating(true);

        try {
            if (mode === 'text') {
                if (!text.trim()) return;
                await storiesHook.createStory(text.trim(), null);
            } else {
                if (!file) return;
                // Pass text as caption if we want, or empty string. 
                // The new hook signature is (content, mediaFile)
                await storiesHook.createStory(text.trim(), file);
            }
            onCreated();
        } catch (err) {
            console.error('Failed to create story:', err);
        }
        setCreating(false);
    };

    return (
        <div className="create-story-modal" onClick={onClose}>
            <div className="create-story-card" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{margin:0}}>Create Story</h3>
                    <button className="icon-btn" onClick={onClose}>✕</button>
                </div>

                {/* Toggle Mode */}
                <div className="story-mode-tabs">
                    <button 
                        className={`mode-tab ${mode === 'text' ? 'active' : ''}`}
                        onClick={() => { setMode('text'); setFile(null); setPreviewUrl(null); }}
                    >
                        📝 Text
                    </button>
                    <button 
                        className={`mode-tab ${mode === 'image' ? 'active' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        📷 Photo
                    </button>
                </div>

                {/* Preview Area */}
                <div className="story-preview-area">
                    {mode === 'image' && previewUrl ? (
                         <div className="image-preview-wrapper">
                            <img src={previewUrl} alt="Preview" />
                            <button className="remove-img-btn" onClick={() => { setFile(null); setPreviewUrl(null); setMode('text'); }}>✕</button>
                         </div>
                    ) : mode === 'image' && !previewUrl ? (
                        <div className="image-placeholder" onClick={() => fileInputRef.current?.click()}>
                           <span>Select Image</span>
                        </div>
                    ) : (
                        <textarea
                            className="story-text-input"
                            placeholder="Type something colorful..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                            autoFocus
                        />
                    )}
                </div>

                {/* Caption input for image mode */}
                {mode === 'image' && !!previewUrl && (
                     <input 
                        className="modal-input" 
                        placeholder="Add a caption..." 
                        value={text} 
                        onChange={e => setText(e.target.value)}
                        style={{marginTop: 12}}
                     />
                )}

                <button
                    className="modal-btn modal-btn-primary w-full"
                    onClick={handleCreate}
                    disabled={creating || (mode === 'text' && !text.trim()) || (mode === 'image' && !file)}
                    style={{ marginTop: 16 }}
                >
                    {creating ? <div className="btn-spinner" /> : 'Share to Story'}
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />
            </div>
        </div>
    );
};

export default CreateStory;
