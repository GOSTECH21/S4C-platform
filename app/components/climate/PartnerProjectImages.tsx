"use client";

import { useEffect, useState } from "react";
import {
  MAX_PROJECT_IMAGES,
  fileToProjectImage,
  showcaseImagesForProject,
  writeStoredProjectImages,
} from "@/app/lib/project-images";
import { updateListedProjectImage } from "@/app/services/partner.service";

export function PartnerProjectImages({
  projectId,
  imageUrl,
  canUpload = false,
}: {
  projectId: string;
  imageUrl?: string | null;
  canUpload?: boolean;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImages(showcaseImagesForProject({ id: projectId, image_url: imageUrl }));
  }, [projectId, imageUrl]);

  async function persist(next: string[]) {
    const clipped = next.slice(0, MAX_PROJECT_IMAGES);
    setImages(clipped);
    writeStoredProjectImages(projectId, clipped);
    try {
      await updateListedProjectImage(projectId, clipped[0] ?? null);
    } catch {
      // Listing still shows locally if hosted image_url cannot be updated.
    }
  }

  async function onFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError(null);
    setBusy(true);
    try {
      const room = MAX_PROJECT_IMAGES - images.length;
      if (room <= 0) {
        throw new Error(`You can attach up to ${MAX_PROJECT_IMAGES} images.`);
      }
      const added: string[] = [];
      for (const file of Array.from(fileList).slice(0, room)) {
        added.push(await fileToProjectImage(file));
      }
      await persist([...images, ...added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not attach that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-dashed border-emerald-500/30 bg-slate-950/60 p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-emerald-400">
        Project images
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Attach photos that explain and showcase this Climate Project.
      </p>
      {images.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((src, index) => (
            <li key={`${src.slice(0, 24)}-${index}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Project image ${index + 1}`}
                className="h-28 w-full rounded-lg object-cover"
              />
              {canUpload ? (
                <button
                  type="button"
                  onClick={() => void persist(images.filter((_, item) => item !== index))}
                  className="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-[0.65rem] font-bold text-white"
                >
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 flex h-28 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-sm text-slate-500">
          No images attached yet.
        </div>
      )}
      {canUpload ? (
        <label className="mt-3 block text-sm text-slate-300">
          <span className="sr-only">Upload project images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={busy || images.length >= MAX_PROJECT_IMAGES}
            onChange={(event) => {
              void onFilesSelected(event.target.files);
              event.target.value = "";
            }}
            className="w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:font-bold file:text-slate-950"
          />
          <span className="mt-2 block text-xs text-slate-500">
            JPG, PNG or WebP. Up to {MAX_PROJECT_IMAGES} images, 2 MB each.
            {busy ? " Attaching..." : ""}
          </span>
        </label>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
