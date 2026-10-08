/** Showcase images a Climate Partner attaches to their own listed project. */

export const MAX_PROJECT_IMAGES = 6;
export const PROJECT_IMAGE_MAX_BYTES = 2_000_000;
export const PROJECT_IMAGE_MAX_EDGE = 1280;

const STORAGE_KEY = "s4p.partner.projectImages.";

export function projectImageStorageKey(projectId: string) {
  return STORAGE_KEY + projectId;
}

export function readStoredProjectImages(projectId: string): string[] {
  if (typeof window === "undefined" || !projectId) return [];
  try {
    const raw = window.localStorage.getItem(projectImageStorageKey(projectId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item)).filter((item) => item.startsWith("data:image/"))
      : [];
  } catch {
    return [];
  }
}

export function writeStoredProjectImages(projectId: string, images: string[]) {
  if (typeof window === "undefined" || !projectId) return;
  const next = images.filter((item) => item.startsWith("data:image/")).slice(0, MAX_PROJECT_IMAGES);
  window.localStorage.setItem(projectImageStorageKey(projectId), JSON.stringify(next));
}

export function showcaseImagesForProject(project: {
  id: string;
  image_url?: string | null;
}): string[] {
  const stored = readStoredProjectImages(project.id);
  const primary = (project.image_url ?? "").trim();
  const merged = [...stored];
  if (primary && (primary.startsWith("data:image/") || primary.startsWith("http"))) {
    if (!merged.includes(primary)) merged.unshift(primary);
  }
  return merged.slice(0, MAX_PROJECT_IMAGES);
}

export function fileToProjectImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("Please choose an image file (JPG, PNG or WebP)."));
  }
  if (file.size > PROJECT_IMAGE_MAX_BYTES) {
    return Promise.reject(new Error("Each image must be under 2 MB."));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const image = new Image();
      image.onload = () => {
        const longest = Math.max(image.width, image.height) || 1;
        const scale = Math.min(1, PROJECT_IMAGE_MAX_EDGE / longest);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(dataUrl);
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => reject(new Error("That file could not be used as an image."));
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
