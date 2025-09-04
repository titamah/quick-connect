import React, { useState, useEffect } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import Modal from "antd/es/modal/index.js";
import { ReactCrop, makeAspectCrop, centerCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Grip, Trash2, Upload, Pencil } from "lucide-react";
import ColorThief from "colorthief";
import Dropdown from "../Panel/Dropdown";
import ImageLibrary from "../Panel/ImageLibrary";
import { Resizable } from "react-resizable";

function ImageUploader() {
  const {
    device,
    background,
    updateBackground,
    takeSnapshot,
    updateImagePalette,
    uploadInfo,
    generatedInfo,
    updateUploadInfo,
    updateGeneratedInfo,
    isMobile,
  } = useDevice();

  const [activeSource, setActiveSource] = useState("Upload");
  const activeInfo = activeSource === "Upload" ? uploadInfo : generatedInfo;
  const menuOptions = activeSource !== "Upload" ? ["Upload"] : ["Library"];

  const [modalOpen, setModalOpen] = useState(false);
  const [crop, setCrop] = useState();

  const fileTypes = ["JPEG", "PNG", "GIF", "SVG", "JPG", "WEBP"];

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  function handleChange(file) {
    file.preventDefault();
    if (file.dataTransfer.items.length > 1) return;

    const items = file.dataTransfer.items || file.dataTransfer.files;
    for (const item of items) {
      const currFile = item.kind === "file" ? item.getAsFile?.() || item : item;
      if (currFile) {
        const reader = new FileReader();
        reader.onload = () => {
          updateUploadInfo({
            originalImageData: reader.result,
            filename: currFile.name,
          });
        };
        reader.readAsDataURL(currFile);
        openModal();
      }
    }
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

  const [height, setHeight] = useState(236);
  const [minMax, setMinMax] = useState([236, Infinity]);

  const changeSource = (e) => {
    setActiveSource(e);
  };

  useEffect(() => {
    if (activeSource == "Library") {
      setMinMax([236, Infinity]);
      setHeight(236);
    } else {
      setMinMax([180.5, 180.5]);
      setHeight(180.5);
    }
  }, [activeSource]);

  useEffect(() => {
    if (activeInfo.originalImageData) {
      const newMinMax = [180.5, 180.5];
      setMinMax(newMinMax);
      setHeight(newMinMax[0]);
    } else {
      const newMinMax =
        activeSource == "Upload" ? [180.5, 180.5] : [236, Infinity];
      setMinMax(newMinMax);
      setHeight(newMinMax[0]);
    }
  }, [activeInfo.originalImageData, activeSource]);

  const cropImage = async () => {
    takeSnapshot("Crop image");

    const croppedBlob = await getCroppedImg(activeInfo.originalImageData, crop);

    const croppedDataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(croppedBlob);
    });

    if (activeSource === "Upload") {
      updateUploadInfo({
        crop: crop,
        croppedImageData: croppedDataUrl,
      });
    } else {
      updateGeneratedInfo({
        crop: crop,
        croppedImageData: croppedDataUrl,
      });
    }

    updateBackground({
      style: "image",
      bg: croppedDataUrl,
    });

    closeModal();
  };

  useEffect(() => {
    if (activeInfo.crop && !crop) {
      setCrop(activeInfo.crop);
    }
  }, [activeInfo.crop, crop]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = activeInfo.originalImageData;

    img.onload = () => {
      const colorThiefInstance = new ColorThief();
      const paletteArray = colorThiefInstance.getPalette(img, 4);

      const rgbPalette = paletteArray.map((color) => {
        const hex =
          "#" + color.map((v) => v.toString(16).padStart(2, "0")).join("");
        return hex;
      });

      updateImagePalette(rgbPalette);
      console.log("New color palette:", rgbPalette);
      console.log("device palette:", device.palette);
    };
  }, [activeInfo.originalImageData]);

  const deleteFile = () => {
    takeSnapshot("Delete image");
    updateBackground({ bg: "" });
    updateImagePalette([]);

    if (activeSource === "Upload") {
      updateUploadInfo({
        originalImageData: null,
        croppedImageData: null,
        crop: null,
        filename: null,
      });
    } else {
      updateGeneratedInfo({
        filename: null,
        originalImageData: null,
        croppedImageData: null,
        crop: null,
      });
    }

    closeModal();
  };

  const setOriginalFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Since this is for Library/AI images, use generatedInfo
        updateGeneratedInfo({
          filename: `ai-generated-${Date.now()}.png`, // Generated filename for AI images
          originalImageData: reader.result,
          croppedImageData: null, // Will be set after cropping
          crop: null // Will be set after cropping
        });
        openModal(); // Opens the crop modal
      };
      reader.readAsDataURL(file);
    }
    console.log(generatedInfo);
  };

  return (
    <>
      <Modal
        open={modalOpen}
        maskClosable={false}
        onOk={cropImage}
        onCancel={closeModal}
        okText="Crop"
        cancelText="Cancel"
        width={'50vw'}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        }}
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
            src={activeInfo.originalImageData || undefined}
            onLoad={initCrop}
            alt="Crop preview"
          />
        </ReactCrop>
      </Modal>
      <div className="dark:text-white w-full mb-4">
        <div className="flex flex-row items-center justify-between w-full mb-2">
          <Dropdown
            options={menuOptions}
            value={activeSource || "Upload"}
            onChange={changeSource}
          />
          <span className="flex items-center gap-2 pointer-events-auto">
            <Grip
              className="opacity-75 hover:opacity-100 cursor-pointer"
              size={20}
              color={device.grain ? "var(--accent)" : "var(--text-secondary)"}
              onClick={() => {
                takeSnapshot("Toggle grain");
                updateBackground({ grain: !device.grain });
              }}
            />
          </span>
        </div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            className={`${isMobile ? "h-[425px]" : "h-[470.5px]"} w-fill mb-[1.5px] rounded-sm border border-[5px] border-[var(--bg-main)] !shadow-[0_0_0_.95px_var(--border-color)]`}
          >
            {activeSource === "Library" ? (
              <ImageLibrary setOriginalFile={setOriginalFile}/>
            ) : background.bg ? (
              <div
                onDrop={handleChange}
                className="w-full h-[170.5px] flex items-center justify-center relative"
              >
                <div className="hover absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity">
                  <Pencil
                    onClick={openModal}
                    className="p-2 z-1500 mx-2"
                    size={42}
                  />
                  <Trash2
                    onClick={deleteFile}
                    className="p-2 z-1500 mx-2"
                    size={42}
                  />
                </div>
                <img
                  src={background.bg || null}
                  alt="Thumbnail"
                  style={{
                    objectFit: "fit",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              </div>
            ) : (
              <div
                onDrop={handleChange}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = fileTypes
                    .map((type) => `.${type.toLowerCase()}`)
                    .join(",");
                  input.onchange = (event) => {
                    const selectedFile = event.target.files[0];
                    if (selectedFile) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        updateUploadInfo({
                          originalImageData: reader.result,
                          filename: selectedFile.name,
                        });
                      };
                      reader.readAsDataURL(selectedFile);
                      openModal();
                    }
                  };
                  input.click();
                }}
                className={`h-full px-1 rounded-sm hover:bg-[var(--border-color)]/50 w-full flex flex-col justify-center items-center text-center text-md gap-1 relative cursor-pointer`}
              >
                <Upload size={48} />
                Drop image here or browse to select a file
                <span className="text-xs italic text-black/65 dark:text-white/65">
                  Supported formats: JPEG, PNG, GIF, SVG, JPG, WEBP
                </span>
              </div>
            )}
          </div>
        {(activeSource == "Upload" || background.bg) && (
          <>
            <h4 className="p-1 pt-2"> File Name </h4>
            <div
              className="w-fill h-full px-2 py-1 border text-sm
            border-[var(--border-color)]/50 rounded-md flex items-center justify-between"
            >
              <span>
                {activeInfo.crop
                  ? activeInfo.filename || "Library image"
                  : "No image selected"}
              </span>
              <Trash2 size={16} onClick={deleteFile} />
            </div>{" "}
          </>
        )}
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
      ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    };
  });
}
