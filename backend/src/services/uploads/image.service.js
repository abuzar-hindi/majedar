import { cloudinary } from '../../config/cloudinary.js';

export const uploadImageBuffer = async (buffer, folder = 'majedar/menu') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    return reject(new Error(`Cloudinary upload failed: ${error.message}`));
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        uploadStream.end(buffer);
    });
};

export const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return false;
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.warn(`[Cloudinary Deletion Warning]: Failed to delete asset ${publicId}:`, error.message);
        return false;
    }
};
