import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

let s3Client;

function getS3Client() {
  if (s3Client) {
    return s3Client;
  }

  if (!env.STORAGE_ENDPOINT || !env.STORAGE_BUCKET || !env.STORAGE_ACCESS_KEY_ID || !env.STORAGE_SECRET_ACCESS_KEY) {
    throw new ApiError(500, "Storage configuration is incomplete");
  }

  s3Client = new S3Client({
    region: env.AWS_REGION,
    endpoint: env.STORAGE_ENDPOINT,
    forcePathStyle: false,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY
    }
  });

  return s3Client;
}

export async function createSignedUploadUrl({ fileName, contentType, projectSlug }) {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const objectKey = `${projectSlug}/${Date.now()}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: objectKey,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: env.SIGNED_URL_EXPIRES_SECONDS
  });

  return {
    uploadUrl,
    objectKey,
    publicUrl: env.STORAGE_PUBLIC_URL ? `${env.STORAGE_PUBLIC_URL}/${objectKey}` : null
  };
}