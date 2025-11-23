
import React, { useRef, useEffect, useCallback } from 'react';
import type { EditedImage } from '../types';
import ImageSlide from './ImageSlide';

interface ImageFeedProps {
  images: EditedImage[];
  onGenerateNext: (index: number) => void;
  hasMore: boolean;
}

const ImageFeed: React.FC<ImageFeedProps> = ({ images, onGenerateNext, hasMore }) => {
  const observer = useRef<IntersectionObserver | null>(null);
  
  // This callback ref is attached to the *last* element in the list.
  // When it comes into view, we trigger the next generation.
  const lastImageElementRef = useCallback((node: HTMLDivElement) => {
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      // If the last element is intersecting and we have more prompts, generate the next image
      if (entries[0].isIntersecting && hasMore) {
        onGenerateNext(images.length);
      }
    });

    if (node) observer.current.observe(node);
  }, [onGenerateNext, images.length, hasMore]);

  return (
    <div 
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
      // Hide scrollbar for a cleaner look
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        .snap-y::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {images.map((image, index) => {
        // Attach the ref only to the last image in the array
        if (images.length === index + 1) {
          return (
            <div ref={lastImageElementRef} key={image.id}>
              <ImageSlide image={image} />
            </div>
          );
        }
        return <ImageSlide key={image.id} image={image} />;
      })}
    </div>
  );
};

export default ImageFeed;
