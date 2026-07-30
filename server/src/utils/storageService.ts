import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary.js";

export interface UploadResult {
  url: string;
  publicId: string;
}

export interface UploadOptions {
  folder: string;
  resourceType?: "image" | "raw";
  publicId?: string;
}

export interface StorageService {
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult>;
  delete(publicId: string, resourceType?: "image" | "raw"): Promise<void>;
}

class CloudinaryStorageService implements StorageService {
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resourceType ?? "image",
          ...(options.publicId ? { public_id: options.publicId } : {}),
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              error ??
                new Error("Cloudinary upload failed with no error or result"),
            );
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  async delete(
    publicId: string,
    resourceType: "image" | "raw" = "image",
  ): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }
}

export const storageService: StorageService = new CloudinaryStorageService();
