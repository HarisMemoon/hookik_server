import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/spaces.js";
import { v4 as uuidv4 } from "uuid";

export async function uploadToSpaces(file) {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;

  const key = `staging/products/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: key,
    Body: file.buffer,
    ACL: "public-read",
    ContentType: file.mimetype,
  });

  await s3.send(command);

  // Return full public URL
  return `${process.env.DO_SPACES_URL}/${key}`;
}
export async function uploadProfilePictureToSpaces(file, userId) {
  if (!file) throw new Error("No file provided");

  const fileExtension = file.originalname.split(".").pop();
  const fileName = `user_${userId}_${Date.now()}.${fileExtension}`;

  const key = `staging/profile_pictures/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: key,
    Body: file.buffer,
    ACL: "public-read",
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return `${process.env.DO_SPACES_URL}/${key}`;
}
