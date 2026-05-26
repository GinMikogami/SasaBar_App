import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadMenuImage(file: File, menuId: string): Promise<string> {
  return uploadImage(file, `menus/${menuId}/${file.name}`);
}

export async function uploadEventImage(file: File, eventId: string): Promise<string> {
  return uploadImage(file, `events/${eventId}/${file.name}`);
}
