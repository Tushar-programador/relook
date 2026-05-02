import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

function getCloudinary() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new ApiError(500, "Cloudinary configuration is incomplete");
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });

  return cloudinary;
}

/**
 * Generate signed upload parameters for direct client-side upload to Cloudinary.
 * Videos get an eager transformation for CDN-optimised, compressed delivery.
 */
export function createSignedUploadParams({ contentType, projectSlug }) {
  const instance = getCloudinary();
  const isVideo = contentType.startsWith("video/");
  const isAudio = contentType.startsWith("audio/");
  const isMedia = isVideo || isAudio;
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `feedspace/${projectSlug}`;

  const paramsToSign = { folder, timestamp };

  // Eager transformation: auto quality + format, convert to mp4 for video / mp3 for audio
  if (isVideo) {
    paramsToSign.eager = "q_auto:low,f_mp4,vc_h264";
    paramsToSign.eager_async = "true";
  }
  if (isAudio) {
    paramsToSign.eager = "q_auto:low,f_mp3";
    paramsToSign.eager_async = "true";
  }

  const signature = instance.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);
  const resourceType = isMedia ? "video" : "image";

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder,
    ...(isVideo ? { eager: "q_auto:low,f_mp4,vc_h264", eager_async: "true" } : {}),
    ...(isAudio ? { eager: "q_auto:low,f_mp3", eager_async: "true" } : {})
  };
}