import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  uploadImages(
    images: Express.Multer.File[],
    folderName: string,
  ): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    const uploadPromises: Promise<UploadApiResponse | UploadApiErrorResponse>[] = [];
    console.log("images", images);
    images.forEach((image) => {
      const uploadPromise = new Promise<UploadApiResponse | UploadApiErrorResponse>((resolve, reject) => {
        const upload = v2.uploader.upload_stream(
          {
            folder: folderName,
            public_id: `${folderName}_${Date.now()}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        toStream(image.buffer).pipe(upload);
      });
      uploadPromises.push(uploadPromise);
    });
    return Promise.all(uploadPromises);
  }
}
