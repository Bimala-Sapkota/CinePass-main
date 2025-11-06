import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadOnCloudinary = async (fileBuffer, originalMimeType, folderName = "misc") => {
    try {
        if (!fileBuffer) {
            console.error("Cloudinary upload failed: No file buffer provided.");
            return null;
        }

        const base64String = fileBuffer.toString('base64');
        const dataUri = `data:${originalMimeType};base64,${base64String}`;

        const response = await cloudinary.uploader.upload(dataUri, {
            resource_type: "auto",
            folder: `cinepass/${folderName}`
        })

        return response;
    } catch (error) {
        console.error(`Error during Cloudinary upload to folder '${folderName}':`, error);
        return null;
    }
}

export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
        console.log("No public_id provided, skipping deletion.");
        return null;
    }

    // eg: https://res.cloudinary.com/drr5tymvb/image/upload/v1751105920/cinepass/s9vm02jjsj4jgcvcvsie.png
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        console.log(`Deleted file from Cloudinary with public_id: ${publicId}`);
        return result;
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error.message);
        return null;
    }
}

