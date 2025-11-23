
import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageFeed from './components/ImageFeed';
import { generateEditPrompts, editImage } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';
import type { EditedImage } from './types';
import { ImageStatus } from './types';
import { ResetIcon } from './components/icons';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ file: File; base64: string; mimeType: string; } | null>(null);
  const [editPrompts, setEditPrompts] = useState<string[]>([]);
  const [editedImages, setEditedImages] = useState<EditedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageReady = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      const mimeType = file.type;

      setOriginalImage({ file, base64, mimeType });

      const firstImage: EditedImage = {
        id: 0,
        src: `data:${mimeType};base64,${base64}`,
        prompt: 'Original Image',
        status: ImageStatus.LOADED,
      };
      setEditedImages([firstImage]);
      
      const prompts = await generateEditPrompts();
      setEditPrompts(prompts);

    } catch (err) {
      console.error(err);
      setError('Failed to process image or generate prompts. Please try again.');
      setOriginalImage(null);
      setEditedImages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateNextImage = useCallback(async (index: number) => {
    if (!originalImage || index >= editPrompts.length) return;

    const prompt = editPrompts[index -1];
    
    // Prevent re-triggering generation for an existing index
    if(editedImages.find(img => img.id === index)) return;

    setEditedImages(prev => [
      ...prev,
      { id: index, src: '', prompt, status: ImageStatus.LOADING },
    ]);

    try {
      const result = await editImage(originalImage.base64, originalImage.mimeType, prompt);
      if (result.image) {
        setEditedImages(prev =>
          prev.map(img =>
            img.id === index
              ? { ...img, src: `data:image/png;base64,${result.image}`, status: ImageStatus.LOADED }
              : img
          )
        );
      } else {
        throw new Error(result.text || 'AI failed to generate an image.');
      }
    } catch (err) {
      console.error(err);
      setEditedImages(prev =>
        prev.map(img =>
          img.id === index
            ? { ...img, status: ImageStatus.ERROR, error: (err as Error).message }
            : img
        )
      );
    }
  }, [originalImage, editPrompts, editedImages]);

  const handleReset = () => {
    setOriginalImage(null);
    setEditPrompts([]);
    setEditedImages([]);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-black text-white font-sans overflow-hidden">
      {!originalImage ? (
        <ImageUploader onImageReady={handleImageReady} isLoading={isLoading} error={error} />
      ) : (
        <>
          <ImageFeed 
            images={editedImages} 
            onGenerateNext={generateNextImage} 
            hasMore={editedImages.length - 1 < editPrompts.length}
          />
          <button 
            onClick={handleReset}
            className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-300 z-20"
            aria-label="Start Over"
          >
            <ResetIcon />
          </button>
        </>
      )}
    </div>
  );
};

export default App;
