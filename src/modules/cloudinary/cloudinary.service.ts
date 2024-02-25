import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
  uploadImages(
    files: Array<Express.Multer.File>,
    folderName: string,
  ): Promise<Array<UploadApiResponse | UploadApiErrorResponse>> {
    return new Promise((resolve, reject) => {
      const uploads = [];
      const uploadCount = files.length;
  
      files.forEach((file) => {
        const upload = v2.uploader.upload_stream(
          {
            folder: folderName,
            public_id: `${folderName}_${Date.now()}`,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              uploads.push(result);
              if (uploads.length === uploadCount) {
                resolve(uploads);
              }
            }
          }
        );
        toStream(file.buffer).pipe(upload);
      });
    });
  }
  
}