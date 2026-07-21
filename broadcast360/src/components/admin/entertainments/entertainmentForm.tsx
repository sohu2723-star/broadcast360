"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { EntertainmentFormData }
  from "@/types/entertainment";
import {
  createEntertainmentSchema,
  editEntertainmentSchema,
} from "@/lib/validators/entertainment.validator";

type Props = {
  onSubmit: (data: EntertainmentFormData) => Promise<void>;

  entertainmentId?: number;

  initialData?: EntertainmentFormData;

  initialThumbnail?: string;

  initialVideo?: string;

  titleError?: string;

  clearTitleError?: () => void;

  onCancel?: () => void;
};

export default function EntertainmentForm({
  onSubmit,
  entertainmentId,
  initialData,
  initialThumbnail,
  initialVideo,
  titleError,
  clearTitleError,
}: Props){
  const router = useRouter();


  const [form, setForm] =
    useState<EntertainmentFormData>({
      title: "",
      description: "",
      category: "",
      releaseYear: 0,
      duration: 0,
      video: null,
      thumbnail: null,
    });
    const initialized = useRef(false);


useEffect(() => {

  if(
    initialData &&
    !initialized.current
  ){

    setForm(initialData);

    initialized.current = true;

  }

}, [initialData]);

const [videoPreview, setVideoPreview] = useState(
  initialVideo ?? ""
);

const [thumbnailPreview, setThumbnailPreview] = useState(
  initialThumbnail ?? ""
);

const isCreateMode = !entertainmentId;

const [showPreview, setShowPreview] = useState(false);

useEffect(() => {

  setVideoPreview(
    initialVideo ?? ""
  );

  setThumbnailPreview(
    initialThumbnail ?? ""
  );

}, [
  initialVideo,
  initialThumbnail
]);
  const originalVideo = useRef(
  initialVideo ?? ""
);

const originalThumbnail = useRef(
  initialThumbnail ?? ""
);
  const [videoName, setVideoName] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPickerOpened = useRef(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  
  const thumbnailPickerOpened = useRef(false);
 function openVideoPicker() {

  videoPickerOpened.current = true;

  if (videoInputRef.current) {

    videoInputRef.current.value = "";

    videoInputRef.current.click();

  }

}
function openThumbnailPicker() {

  thumbnailPickerOpened.current = true;

  if (thumbnailInputRef.current) {

    thumbnailInputRef.current.value = "";

    thumbnailInputRef.current.click();

  }

}
  useEffect(() => {

    function handleFocus() {

      setTimeout(() => {


        // VIDEO CANCEL

        if (videoPickerOpened.current) {

          const input = videoInputRef.current;


          if (input && !input.files?.length) {


            setForm(prev => ({
  ...prev,
  video: null
}));


if (entertainmentId) {

  // EDIT
  setVideoPreview(
    originalVideo.current
  );

} else {

  // CREATE
  setVideoPreview("");

}


setVideoName("");


            // CREATE ONLY
            if (!entertainmentId) {

              setErrors(prev => ({
                ...prev,
                video: "Video file is required"
              }));

            }

          }


          videoPickerOpened.current = false;

        }



        // THUMBNAIL CANCEL

        if (thumbnailPickerOpened.current) {

          const input =
            thumbnailInputRef.current;


          if (input && !input.files?.length) {


           setForm(prev => ({
  ...prev,
  thumbnail: null
}));


if (entertainmentId) {

  // EDIT
  setThumbnailPreview(
    originalThumbnail.current
  );

} else {

  // CREATE
  setThumbnailPreview("");

}


setThumbnailName("");


            // CREATE ONLY
            if (!entertainmentId) {

              setErrors(prev => ({
                ...prev,
                thumbnail: "Thumbnail is required"
              }));

            }

          }


          thumbnailPickerOpened.current = false;

        }


      }, 300);

    }



    window.addEventListener(
      "focus",
      handleFocus
    );


    return () => {

      window.removeEventListener(
        "focus",
        handleFocus
      );

    };


  }, [entertainmentId]);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    


    
const schema =
  entertainmentId
    ? editEntertainmentSchema
    : createEntertainmentSchema;


const result =
  schema.safeParse(form);

    if (!result.success) {

      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {

        const key =
          issue.path[0]?.toString();


        if (key) {
          fieldErrors[key] = issue.message;
        }

      });


      setErrors(fieldErrors);

      return;
    }


    setErrors({});


   await onSubmit({
  ...result.data,
  duration: result.data.duration ?? 0,
  thumbnail: result.data.thumbnail ?? null,
  video: result.data.video ?? null,
});

  }


  return (
    <div className="w-full">
<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT PREVIEW */}
       {(!isCreateMode || videoPreview || thumbnailPreview) && (
  <div className="lg:col-span-2 space-y-5">

          {/* VIDEO PREVIEW */}
          {videoPreview && (
<div className="bg-[#111936] border border-white/5 rounded-2xl p-4">

<label className="block text-xs font-semibold text-slate-400 uppercase mb-3">
  Video Preview
</label>

<div className="bg-[#070b19] rounded-xl aspect-video overflow-hidden border border-white/10 flex items-center justify-center">

<video
  key={videoPreview}
  controls
  className="w-full h-full object-contain bg-black"
>
  <source src={videoPreview} />
</video>

</div>

</div>
)}



          {/* THUMBNAIL PREVIEW */}
         {thumbnailPreview && (
<div className="bg-[#111936] border border-white/5 rounded-2xl p-4">

<label className="block text-xs font-semibold text-slate-400 uppercase mb-3">
  Thumbnail Preview
</label>

<div className="bg-[#070b19] rounded-xl aspect-video overflow-hidden border border-white/10 flex items-center justify-center">

<img
  src={thumbnailPreview}
  className="w-full h-full object-cover"
/>

</div>

</div>
)}
        </div>
        )}
        {/* FORM RIGHT */}
      <form
  onSubmit={handleSubmit}
  className="bg-[#0B1026] border border-white/10 rounded-2xl p-6 lg:col-span-3"
>
          <div className="space-y-5">

            {/* TITLE */}
            <div>
              <label className="block text-sm text-slate-200 mb-2">
                Entertainment Title
              </label>

              <input
                className={`w-full bg-[#111936] border rounded-lg p-3 text-white focus:outline-none ${errors.title
                  ? "border-red-500"
                  : "border-white/10 focus:border-blue-500"
                  }`}
                value={form.title}
                onChange={(e) => {

                  setForm({
                    ...form,
                    title: e.target.value,
                  });


                  if (errors.title) {

                    setErrors({
                      ...errors,
                      title: "",
                    });

                  }


                  if (titleError && clearTitleError) {

                    clearTitleError();

                  }

                }}
                placeholder="Enter entertainment title"
              />

              {errors.title && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.title}
                </p>
              )}


              {titleError && (
                <p className="text-red-400 text-xs mt-1">
                  {titleError}
                </p>
              )}
            </div>


            {/* CATEGORY */}
            <div>
              <label className="block text-sm text-slate-200 mb-2">
                Category
              </label>

              <input
                className={`w-full bg-[#111936] border rounded-lg p-3 text-white ${errors.category
                  ? "border-red-500"
                  : "border-white/10 focus:border-blue-500"
                  }`}
                value={form.category}
                onChange={(e) => {

                  setForm({
                    ...form,
                    category: e.target.value,
                  });

                  if (errors.category) {
                    setErrors({
                      ...errors,
                      category: "",
                    });
                  }

                }}
                placeholder="Drama, Comedy, Action..."
              />


              {errors.category && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.category}
                </p>
              )}
            </div>

            {/* TYPE + RELEASE YEAR */}

              

              <div>
                <label className="block text-sm text-slate-200 mb-2">
                  Release Year
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="2026"
                  className={`w-full bg-[#111936] border rounded-lg p-3 text-white ${errors.releaseYear
                    ? "border-red-500"
                    : "border-white/10"
                    }`}
                  value={
                    form.releaseYear === 0
                      ? ""
                      : String(form.releaseYear)
                  }
                  onChange={(e) => {

                    const value = e.target.value;


                    if (/^\d*$/.test(value)) {

                      setForm({
                        ...form,
                        releaseYear:
                          value === ""
                            ? 0
                            : Number(value),
                      });


                      if (errors.releaseYear) {
                        setErrors({
                          ...errors,
                          releaseYear: "",
                        });
                      }

                    }

                  }}
                />


                {errors.releaseYear && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.releaseYear}
                  </p>
                )}

              </div>


            {/* VIDEO + THUMBNAIL */}
            <div className="grid grid-cols-2 gap-4">

              {/* VIDEO */}
              <div>

                <label className="block text-sm text-slate-200 mb-2">
                  Video File
                </label>
                <button
                  type="button"
                  onClick={openVideoPicker}
                  className="flex items-center justify-center h-12 w-full bg-[#111936] border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-blue-500"
                >

                  <span className="text-sm text-slate-400">
                    {videoName || "Choose Video"}
                  </span>

                </button>


                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                 onChange={(e) => {

  const file =
    e.target.files?.[0] ?? null;

  setForm({
    ...form,
    video: file,
  });

 if (file) {

   const preview = URL.createObjectURL(file);

   setVideoPreview(preview);

   setVideoName(file.name);

   if (!entertainmentId) {
     setShowPreview(true);
   }

   setErrors({
     ...errors,
     video: "",
   });

} else {

    if (entertainmentId) {

      setVideoPreview(
        originalVideo.current
      );

    } else {

      setVideoPreview("");

    }

    setVideoName("");

  }

}}
                />


                {errors.video && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.video}
                  </p>
                )}
              </div>

              {/* THUMBNAIL */}
              <div>

                <label className="block text-sm text-slate-200 mb-2">
                  Thumbnail
                </label>
                <button
                  type="button"
                  onClick={openThumbnailPicker}
                  className="flex items-center justify-center h-12 w-full bg-[#111936] border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-blue-500"
                >

                  <span className="text-sm text-slate-400">
                    {thumbnailName || "Choose Image"}
                  </span>

                </button>


                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {

                    const file =
                      e.target.files?.[0] ?? null;


                    setForm({
                      ...form,
                      thumbnail: file,
                    });


                   if (file) {

  setThumbnailPreview(
    URL.createObjectURL(file)
  );

  setThumbnailName(file.name);

  if (!entertainmentId) {
    setShowPreview(true);
  }

  setErrors({
    ...errors,
    thumbnail: "",
  });

}

                  }}
                />


                {errors.thumbnail && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.thumbnail}
                  </p>
                )}

              </div>

            </div>

            {/* DESCRIPTION */}
            <div>

              <label className="block text-sm text-slate-200 mb-2">
                Description
              </label>
              <textarea
                rows={5}
                className={`w-full bg-[#111936] border rounded-lg p-3 text-white ${errors.description
                  ? "border-red-500"
                  : "border-white/10 focus:border-blue-500"
                  }`}
                value={form.description}
                onChange={(e) => {

                  setForm({
                    ...form,
                    description: e.target.value,
                  });

                  if (errors.description) {
                    setErrors({
                      ...errors,
                      description: "",
                    });
                  }

                }}
                placeholder="Enter description..."
              />


              {errors.description && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.description}
                </p>
              )}

            </div>

          </div>

          {/* BUTTON */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/10">

           <button
  type="submit"
  className="
    px-8
    py-2.5
    rounded-lg
    bg-blue-600
    text-white
    font-medium
    hover:bg-blue-700
    transition
  "
>
  {
    entertainmentId
      ? "Update Entertainment"
      : "Create Entertainment"
  }
</button>

            <button
  type="button"
  onClick={() =>
    router.push("/admin/entertainments")
  }
  className="
    px-6
    py-2.5
    rounded-lg
    bg-red-600
    text-white
    font-medium
    hover:bg-red-700
    transition
  "
>
  Cancel
</button>
          </div>

        </form>
      </div>
    </div>
  );
  
}




