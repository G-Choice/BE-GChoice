import { v2 } from 'cloudinary';
export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return v2.config({
      cloud_name: "dbzhzmxkv",
      api_key: "244691889352194",
      api_secret: `f9DBuTfefR9_zT74f3BS5xEkXg8`,
    });
  },
};