"use client";

import { CldUploadWidget } from "next-cloudinary";

export default function CloudinaryUpload({
  onUpload,
  resourceType = "image",
  value,
}) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{ resourceType }}
      onSuccess={(result) => {

        const duration =
          resourceType === "video" ? result.info.duration : undefined;

        onUpload(result.info.secure_url, duration);
      }}
    >
      {({ open }) => (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => open()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Upload {resourceType === "image" ? "Thumbnail" : "Video"}
          </button>

          {value &&
            (resourceType === "image" ? (
              <img
                src={value}
                alt="Uploaded preview"
                className="w-24 h-24 object-cover rounded-md border"
              />
            ) : (
              <video
                src={value}
                controls
                className="w-48 h-32 rounded-md border"
              />
            ))}
        </div>
      )}
    </CldUploadWidget>
  );
}
