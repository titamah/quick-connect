import React, { useState, useEffect, useContext } from "react";
import { DeviceContext } from "../../App";
import { Modal } from "antd";
import { ReactCrop, makeAspectCrop, centerCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Trash2, Upload } from "lucide-react";

function ImageUploader() {
  const { device, setDevice } = useContext(DeviceContext);

  const [file, setFile] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [crop, setCrop] = useState();

  const fileTypes = ["JPEG", "PNG", "GIF", "SVG", "JPG", "WEBP"];

  function handleChange(file) {
    file.preventDefault();
    if (file.dataTransfer.items.length > 1) return;

    const items = file.dataTransfer.items || file.dataTransfer.files;
    for (const item of items) {
      const currFile = item.kind === "file" ? item.getAsFile?.() || item : item;
      if (currFile) setOriginalFile(currFile);
    }
    setModalOpen(true);
  }

  const initCrop = (e) => {
    if (!crop) {
      const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
      const initialCrop = centerCrop(
        makeAspectCrop(
          { unit: "%", width: 90 },
          device.size.x / device.size.y,
          width,
          height
        ),
        width,
        height
      );
      setCrop(initialCrop);
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const cropImage = async () => {
    const croppedBlob = await getCroppedImg(
      URL.createObjectURL(originalFile),
      crop
    );
    const croppedFile = new File([croppedBlob], originalFile.name, {
      type: originalFile.type,
    });
    setFile(croppedFile);
    closeModal();
  };

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setDevice((prev) => ({ ...prev, bg: url }));
    }
  }, [file]);

  return (
    <>
      <Modal
        open={modalOpen}
        onOk={cropImage}
        onCancel={closeModal}
        okText="Crop"
        cancelText="Cancel"
        width={400}
        style={{ position: "relative" }}
      >
        <ReactCrop
          crop={crop}
          unit="%"
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          aspect={device.size.x / device.size.y}
          keepSelection
          ruleOfThirds
        >
          <img
            src={originalFile ? URL.createObjectURL(originalFile) : undefined}
            onLoad={initCrop}
            alt="Crop preview"
          />
        </ReactCrop>
      </Modal>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        className="dark:text-white h-[183.5px] w-fill mx-5 space-y-2.5 mb-3.5 !rounded-[4px] !border-[5px] !border-white dark:!border-[rgba(38,38,38,1)] !shadow-[0_0_0_.95px_rgb(215,215,215)] dark:!shadow-[0_0_0_.95px_rgb(66,66,66)]"
      >
        {file ? (
          <div
            onClick={openModal}
            onDrop={handleChange}
            className="w-full h-full flex items-center justify-center relative"
          >
            <div className="hover absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity">
              <button
                onClick={() => setFile(null)}
                className="bg-red-500 text-white p-2 rounded-full mx-2"
              >
                🗑️
              </button>
              <button
                onClick={openModal}
                className="bg-blue-500 text-white p-2 rounded-full mx-2"
              >
                ✏️
              </button>
            </div>
            <img
              src={originalFile ? URL.createObjectURL(originalFile): null}
              alt="Thumbnail"
              style={{ objectFit: "fit", maxWidth: "100%", maxHeight: "100%" }}
            />
          </div>
        ) : (
          <div
            onDrop={handleChange}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = fileTypes.map((type) => `.${type.toLowerCase()}`).join(",");
              input.onchange = (event) => {
                const selectedFile = event.target.files[0];
                if (selectedFile) {
                  setOriginalFile(selectedFile);
                  setModalOpen(true);
                }
              };
              input.click();
            }}
            className="dark:text-white dark:hover:bg-white/5 hover:bg-black/5 w-full h-full dark:bg-neutral-800 flex flex-col items-center justify-center text-center text-md p-5 gap-1 relative cursor-pointer"
          >
            <Upload size={48}/>
            Drop your image here or browse to select a file
            <span className="text-xs italic text-black/65 dark:text-white/65">Supported formats: JPEG, PNG, GIF, SVG, JPG, WEBP</span>
          </div>
        )}
      </div>
      <div
            className="dark:text-white w-fill h-full dark:bg-neutral-800 mx-5 px-2 py-1 border text-sm
            border-neutral-200 dark:border-neutral-700 rounded-md flex items-center justify-between">
              <span>{originalFile ? originalFile.name : "No image selected"}</span>
                <Trash2 size={16} onClick={()=>{setOriginalFile(null)}}/>
      </div>
    </>
  );
}

export default ImageUploader;

function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const x = (image.naturalWidth * crop.x) / 100;
      const y = (image.naturalHeight * crop.y) / 100;
      const width = (image.naturalWidth * crop.width) / 100;
      const height = (image.naturalHeight * crop.height) / 100;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    };
  });
}