import React, { useState, useEffect } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import Modal from "../Modal";
import { ReactCrop, makeAspectCrop, centerCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Grip, Trash2, Upload, Pencil } from "lucide-react";
import ColorThief from "colorthief";
import Dropdown from "../Panel/Dropdown";
import ImageGenerator from "../Panel/ImageGenerator";
import ImageUploader from "../Panel/ImageUploader";

function ImageInput() {
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
    updateGrain,
    activeImageSource,
    setActiveImageSource,
    isMobile,
  } = useDevice();

  const activeSource = activeImageSource;
  const setActiveSource = setActiveImageSource;
  const activeInfo = activeSource === "Upload" ? uploadInfo : generatedInfo;
  const menuOptions = activeSource !== "Upload" ? ["Upload"] : ["AI"];
  const [modalOpen, setModalOpen] = useState(false);
  const [crop, setCrop] = useState();
  const fileTypes = ["JPEG", "PNG", "GIF", "SVG", "JPG", "WEBP"];

  const openModal = () => {
    // When opening modal, sync crop with the saved activeInfo.crop
    if (activeInfo.crop) {
      setCrop(activeInfo.crop);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    // Reset crop to the saved crop value when canceling
    if (activeInfo.crop) {
      setCrop(activeInfo.crop);
    } else {
      // If no saved crop, clear the temporary crop
      setCrop(undefined);
    }
    setModalOpen(false);
  };

  // KEEPING YOUR ORIGINAL handleChange - it works perfectly!
  function handleChange(file) {
    file.preventDefault();
    if (file.dataTransfer.items.length > 1) return;
    const items = file.dataTransfer.items || file.dataTransfer.files;
    for (const item of items) {
      const currFile = item.kind === "file" ? item.getAsFile?.() || item : item;
      if (currFile) {
        const reader = new FileReader();
        reader.onload = () => {
          // Clear crop when uploading new image
          setCrop(undefined);
          updateUploadInfo({
            originalImageData: reader.result,
            filename: currFile.name,
            crop: null,
            croppedImageData: null,
          });
        };
        reader.readAsDataURL(currFile);
        openModal();
      }
    }
  }

  function handleClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = fileTypes.map((t) => `.${t.toLowerCase()}`).join(",");
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = (event) => {
      console.log("onchange fired!");
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setCrop(undefined);
          updateUploadInfo({
            originalImageData: reader.result,
            filename: file.name,
            crop: null,
            croppedImageData: null,
          });
        };
        reader.readAsDataURL(file);
        openModal();
      }
      document.body.removeChild(input);
    };

    input.click();
  }

  const initCrop = (e) => {
    // Only initialize if there's no crop AND no saved crop
    if (!crop && !activeInfo.crop) {
      const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
      if (width && height) {
        const aspectRatio = device.size.x / device.size.y;

        // Calculate maximum size that maintains aspect ratio
        let cropWidth = 100;
        let cropHeight = 100;

        const imageAspect = width / height;

        if (imageAspect > aspectRatio) {
          // Image is wider than needed, limit by height
          cropHeight = 100;
          cropWidth = ((aspectRatio * height) / width) * 100;
        } else {
          // Image is taller than needed, limit by width
          cropWidth = 100;
          cropHeight = (width / (aspectRatio * height)) * 100;
        }

        // Create and center the crop
        const initialCrop = centerCrop(
          makeAspectCrop(
            {
              unit: "%",
              width: cropWidth,
            },
            aspectRatio,
            width,
            height
          ),
          width,
          height
        );

        setCrop(initialCrop);
      }
    }
  };

  const [height, setHeight] = useState(236);
  const [minMax, setMinMax] = useState([236, Infinity]);

  const changeSource = (e) => {
    setActiveSource(e);
    takeSnapshot("Change source");
    const newActiveInfo = e === "Upload" ? uploadInfo : generatedInfo;
    updateBackground({
      style: "image",
      bg: newActiveInfo.croppedImageData,
    });
  };

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

  // Remove the problematic useEffect that was interfering
  // Don't need it since openModal handles the sync

  useEffect(() => {
    if (activeInfo.originalImageData) {
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
    }
  }, [activeInfo.originalImageData]);

  const deleteFile = () => {
    takeSnapshot("Delete image");
    updateBackground({ bg: "" });
    updateImagePalette([]);
    // Clear crop when deleting
    setCrop(undefined);
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
        // Clear crop for new generated images
        setCrop(undefined);
        updateGeneratedInfo({
          filename: `${new Date()
            .toLocaleString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(/[\/\s,:]/g, "-")}.png`,
          originalImageData: reader.result,
          croppedImageData: null,
          crop: null,
        });
        openModal();
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
      >
        <ReactCrop
          crop={crop}
          unit="%"
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          aspect={device.size.x / device.size.y}
          keepSelection
          ruleOfThirds
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={activeInfo.originalImageData || undefined}
            onLoad={initCrop}
            alt="Crop preview"
            style={{
              maxWidth: "100%",
              maxHeight: "calc(90vh - 180px)",
              width: "auto",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </ReactCrop>
      </Modal>

      <div className="dark:text-white">
        <div className="flex flex-row items-center justify-between w-full mb-2">
          <Dropdown
            options={menuOptions}
            value={activeSource || "Upload"}
            onChange={changeSource}
          />
          <span className="flex items-center gap-2 pointer-events-auto">
            <Grip
              className={` cursor-pointer 
                ${device.grain ? `text-[var(--accent)] ${ device.grain == 1 ? "opacity-100 hover:opacity-75" : "opacity-66 hover:opacity-50"}` 
                  : "text-[var(--text-secondary)] opacity-100 hover:opacity-75"}`}
              size={20}
              onClick={() => {
                takeSnapshot("Toggle grain");
                updateGrain();
              }}
            />
          </span>
        </div>

        {activeInfo.originalImageData ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            className={`${
              isMobile ? "h-[150px]" : "h-[200px]"
            } w-full mb-[1.5px] rounded-sm border border-[5px] border-[var(--bg-main)] !shadow-[0_0_0_.95px_var(--border-color)]`}
          >
            <div
              onDrop={handleChange}
              className="w-full min-w-0 h-full flex items-center justify-center relative"
            >
              <div className="hover absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity">
                <Pencil
                  onClick={openModal}
                  className="p-2 z-1500 mx-2 cursor-pointer hover:opacity-50"
                  size={42}
                />
                <Trash2
                  onClick={deleteFile}
                  className="p-2 z-1500 mx-2 cursor-pointer hover:opacity-50"
                  size={42}
                />
              </div>
              <img
                src={activeInfo.originalImageData || null}
                alt="Thumbnail"
                style={{
                  objectFit: "fit",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              />
            </div>
          </div>
        ) : activeSource === "AI" ? (
          <ImageGenerator
            setOriginalFile={setOriginalFile}
            generatedInfo={generatedInfo}
            updateGeneratedInfo={updateGeneratedInfo}
          />
        ) : (
          <ImageUploader
            handleChange={handleChange}
            handleClick={handleClick}
            fileTypes={fileTypes}
          />
        )}
      </div>

      {activeInfo.originalImageData && (
        <div className=" mt-4 space-y-2">
          <h4 className=""> File Name </h4>
          <div className=" max-w-full h-[24px] text-[var(--text-primary)] px-1.5 py-[2.5px] border border-[var(--border-color)]/50 rounded-sm bg-black/5 dark:bg-black/15 flex items-center justify-between">
            <span className="truncate flex-1 min-w-0 max-w-[75%]">
              {activeInfo.crop ? activeInfo.filename : "No image selected"}
            </span>
            <span className="flex-none flex items-center gap-2">
              <Pencil
                onClick={openModal}
                size={16}
                className="cursor-pointer hover:opacity-50"
              />
              <Trash2
                size={16}
                onClick={deleteFile}
                className="cursor-pointer hover:opacity-50"
              />
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageInput;

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
