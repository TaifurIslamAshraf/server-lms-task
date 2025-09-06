export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    url: string;
    path: string;
    size?: number;
    mimetype?: string;
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  message: string;
  data: {
    filePaths: string[];
    files: UploadResponse['data'][];
  };
}