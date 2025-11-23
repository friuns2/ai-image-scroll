
import React from 'react';
import type { EditedImage } from '../types';
import { ImageStatus } from '../types';
import Spinner from './Spinner';

interface ImageSlideProps {
  image: EditedImage;
}

const ImageSlide: React.FC<ImageSlideProps> = ({ image }) => {
  return (
    <div className="h-screen w-screen flex-shrink-0 relative snap-start flex items-center justify-center bg-black">
      {image.status === ImageStatus.LOADING && (
        <div className="flex flex-col items-center">
            <Spinner />
            <p className="mt-4 text-lg font-semibold text-gray-300">AI is thinking...</p>
        </div>
      )}

      {image.status === ImageStatus.LOADED && (
        <img
          src={image.src}
          alt={image.prompt}
          className="max-h-full max-w-full object-contain"
        />
      )}

      {image.status === ImageStatus.ERROR && (
        <div className="text-center p-8 text-red-400">
          <h3 className="text-xl font-bold">Generation Failed</h3>
          <p className="mt-2 text-red-300">{image.error || 'An unknown error occurred.'}</p>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-center text-lg font-medium text-white drop-shadow-lg">
          {image.prompt}
        </p>
      </div>
    </div>
  );
};

export default ImageSlide;
