
import React, { useRef, useState, useCallback } from 'react';
import { CameraIcon, UploadIcon } from './icons';
import Spinner from './Spinner';

interface ImageUploaderProps {
  onImageReady: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const CameraView: React.FC<{ onCapture: (file: File) => void; onCancel: () => void }> = ({ onCapture, onCancel }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    React.useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera. Please check permissions.");
                onCancel();
            }
        };
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
                    onCapture(file);
                }
            }, 'image/png');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="mt-6 flex space-x-4">
                <button onClick={handleCapture} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold transition-colors">Capture</button>
                <button onClick={onCancel} className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition-colors">Cancel</button>
            </div>
        </div>
    );
};


const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageReady, isLoading, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageReady(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        onImageReady(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };


  const openFileDialog = () => fileInputRef.current?.click();

  const handlePhotoCaptured = (file: File) => {
    setIsTakingPhoto(false);
    onImageReady(file);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-gray-900 to-indigo-900">
       {isTakingPhoto && <CameraView onCapture={handlePhotoCaptured} onCancel={() => setIsTakingPhoto(false)} />}
      <div 
        className="w-full max-w-lg border-4 border-dashed border-gray-600 hover:border-indigo-500 transition-all duration-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer"
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        >
        <UploadIcon />
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Upload your image</h2>
        <p className="mt-2 text-gray-400">Drag & drop or click to select a file</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="my-6 text-gray-500 font-bold">OR</div>

      <button onClick={() => setIsTakingPhoto(true)} className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-full font-semibold shadow-lg">
        <CameraIcon />
        Use Camera
      </button>

      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-40">
            <Spinner />
            <p className="mt-4 text-lg">Warming up the AI...</p>
        </div>
      )}
      {error && <p className="mt-4 text-red-400 font-semibold">{error}</p>}
    </div>
  );
};

export default ImageUploader;
