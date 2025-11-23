
export enum ImageStatus {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

export interface EditedImage {
  id: number;
  src: string;
  prompt: string;
  status: ImageStatus;
  error?: string;
}
