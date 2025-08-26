import React, { useState, useEffect, useContext } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { Col, Modal } from "antd";
import { ReactCrop, makeAspectCrop, centerCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Grip, Trash2, Upload, Pencil } from "lucide-react";
import ColorThief from "colorthief";
import Dropdown from "../Panel/Dropdown";
import ImageLibrary from "../Panel/ImageLibrary";
import { Resizable } from "react-resizable";
import { useImageCache } from "../../hooks/useImageCache";

function ImageUploader() {
  const { device, updateBackground, updateQRConfig, updateDeviceInfo, updateImagePalette } = useDevice();
  const { createObjectURL } = useImageCache();

  const [source, setSource] = useState("Upload");
  // const [source, setSource] = useState("Upload");
  const menuOptions = source !== "Upload" ? ["Upload"] : ["Library"];

  const [file, setFile] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
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
      if (currFile) setOriginalFile(currFile);
    }
    openModal();
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
    setSource(e);
  };

  useEffect(() => {
    if (source == "Library") {
      setMinMax([236, Infinity]);
      setHeight(236);
    } else {
      setMinMax([180.5, 180.5]);
      setHeight(180.5);
    }
  }, [source]);

  useEffect(() => {
    if (file) {
      const newMinMax = [180.5, 180.5];
      setMinMax(newMinMax);
      setHeight(newMinMax[0]);
    } else {
      const newMinMax = source == "Upload" ? [180.5, 180.5] : [236, Infinity];
      setMinMax(newMinMax);
      setHeight(newMinMax[0]);
    }
  }, [file]);

  useEffect(() => {
    deleteFile();
  }, [source]);

  const cropImage = async () => {
    const objectUrl = createObjectURL(originalFile);
    const croppedBlob = await getCroppedImg(objectUrl, crop);
    const croppedFile = new File([croppedBlob], originalFile.name, {
      type: originalFile.type,
    });
    setFile(croppedFile);
    closeModal();
  };

  useEffect(() => {
    if (file) {
      const url = createObjectURL(file);
      updateBackground({ style: "image", bg: url });
    }
  }, [file]);

useEffect(() => {
  if (!originalFile) {
    // Just clear the file - palette will update automatically
    setModalOpen(false);
  } else {
    setModalOpen(true);
    // Create an image from the original file with proper object URL management
    const objectUrl = createObjectURL(originalFile);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = objectUrl;

    img.onload = () => {
      const colorThiefInstance = new ColorThief();
      const paletteArray = colorThiefInstance.getPalette(img, 4);

      const rgbPalette = paletteArray.map((color) => {
        const hex =
          "#" + color.map((v) => v.toString(16).padStart(2, "0")).join("");
        return hex;
      });

      // Add extracted colors to the device palette
      updateImagePalette(rgbPalette);
      console.log("New color palette:", rgbPalette);
      console.log("device palette:", device.palette);
    };
  }
}, [originalFile]);

  const deleteFile = () => {
    setOriginalFile(null);
    setFile(null);
    updateBackground({ style: "solid", bg: "" });
    updateImagePalette([]); // Clear image palette when image is deleted
    closeModal();
  };

  return (
    <>
      <Modal
        open={modalOpen}
        onOk={cropImage}
        onCancel={closeModal}
        okText="Crop"
        cancelText="Cancel"
        width={400}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}
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
            src={originalFile ? createObjectURL(originalFile) : undefined}
            onLoad={initCrop}
            alt="Crop preview"
          />
        </ReactCrop>
      </Modal>
      <div className="dark:text-white w-full mb-4">
        <div className="flex flex-row items-center justify-between w-full mb-2">
          <Dropdown
            options={menuOptions}
            value={source}
            onChange={changeSource}
          />
          <span className="flex items-center gap-2 pointer-events-auto">
          <Grip
  className="opacity-75 hover:opacity-100 cursor-pointer"
  size={20}
  onClick={() => {
    updateBackground({ grain: !device.grain });
  }}
/>
          </span>
        </div>
        <Resizable
          height={height}
          width={Infinity}
          minConstraints={[0, minMax[0]]}
          maxConstraints={[Infinity, minMax[1]]}
          resizeHandles={["s"]}
          onResize={(e, { size }) => setHeight(size.height)}
          handle={
            <div className="absolute h-3 bottom-0 w-full cursor-row-resize translate-y-1 z-1500"></div>
          }
        >
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            style={{ height }}
            className="w-fill mb-[1.5px] rounded-sm border border-[5px] border-[var(--bg-main)] !shadow-[0_0_0_.95px_var(--border-color)]"
          >
            {file ? (
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
                  src={originalFile ? URL.createObjectURL(originalFile) : null}
                  alt="Thumbnail"
                  style={{
                    objectFit: "fit",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              </div>
            ) : source === "Upload" ? (
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
                      setOriginalFile(selectedFile);
                      setModalOpen(true);
                    }
                  };
                  input.click();
                }}
                className=" rounded-sm h-[170.5px] hover:bg-[var(--border-color)]/50 w-full flex flex-col items-center justify-center text-center text-md p-5 gap-1 relative cursor-pointer"
              >
                <Upload size={48} />
                Drop your image here or browse to select a file
                <span className="text-xs italic text-black/65 dark:text-white/65">
                  Supported formats: JPEG, PNG, GIF, SVG, JPG, WEBP
                </span>
              </div>
            ) : (
              <ImageLibrary setOriginalFile={setOriginalFile} />
            )}
          </div>
        </Resizable>
        {(source == "Upload" || file) && (
          <>
            <h4 className="p-1 pt-2">
              {" "}
              File Name{" "}
            </h4>
            <div
              className="w-fill h-full px-2 py-1 border text-sm
            border-[var(--border-color)]/50 rounded-md flex items-center justify-between"
            >
              <span>
                {originalFile ? originalFile.name : "No image selected"}
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
