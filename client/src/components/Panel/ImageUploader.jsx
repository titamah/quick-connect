import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DeviceContext } from '../../App';
import { Modal, Slider } from 'antd';
import Cropper from 'react-easy-crop';
import {ReactCrop, makeAspectCrop, centerCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function ImageUploader() {
  const { device, setDevice } = useContext(DeviceContext);

  const [file, setFile] = useState(null); // Cropped file
  const [originalFile, setOriginalFile] = useState(null); // Raw uploaded file
  const [modalOpen, setModalOpen] = useState(false);

  const [crop, setCrop] = useState();

  const fileTypes = ["JPEG", "PNG", "GIF", "SVG", "JPG", "WEBP"];

  function handleChange(file) {
    console.log(file)
    file.preventDefault();

  if (file.dataTransfer.items.length > 1) {
    console.log("Please drop only one file.");
    return;
  } else if (file.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...file.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const currFile = item.getAsFile();
          setOriginalFile(currFile);
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...file.dataTransfer.files].forEach((currFile, i) => {
        setOriginalFile(currFile);
      });
    }
    setModalOpen(true);
  };

  const initCrop = (e) => {
if (!crop){    
  const { naturalWidth: width, naturalHeight: height } = e.currentTarget
  
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        device.size.x / device.size.y,
        width,
        height
      ),
      width,
      height
    )
  
    setCrop(crop)}
  }

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const onCropComplete = useCallback((e) => {
    console.log(e);
  }, []);

  const cropImage = async () => {
    const croppedBlob = await getCroppedImg(
      URL.createObjectURL(originalFile),
      crop
    );

    const croppedFile = new File([croppedBlob], originalFile.name, {
      type: originalFile.type,
    });

    setFile(croppedFile);
    const img = new Image();
    img.src = URL.createObjectURL(croppedFile);
    img.onload = () => {
      console.log(img);
      document.body.appendChild(img); // Appends the image to the body for viewing
    };
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
        height={400}
        style={{position: 'relative'}}

      >
          <ReactCrop
            crop={crop}
            unit="%"
            onChange={(crop, percentCrop) => {
              setCrop(percentCrop)
            }}
            aspect={device.size.x / device.size.y}
            keepSelection
            ruleOfThirds
            >
              <img src={originalFile ? URL.createObjectURL(originalFile) : null} onLoad={initCrop}/>
            </ReactCrop>
            
        {/* <Slider
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={setZoom}
          style={{ marginTop: 16 }}
        /> */}
      </Modal>
        <div 
        onDragOver={(e)=>{e.preventDefault()}}
        onDrop={(e)=>{e.preventDefault()}}
        className='dark:text-white h-[183.5px] w-fill mx-5 space-y-2.5 mb-3.5 !rounded-[4px] !border-[5px] !border-white dark:!border-[rgba(38,38,38,1)] !shadow-[0_0_0_.95px_rgb(215,215,215)] dark:!shadow-[0_0_0_.95px_rgb(66,66,66)]'>
      {file ? (
        <div
            onClick={openModal}
            onDrop={handleChange} 
            className='w-full h-full flex items-center justify-center relative'>
              
            <div
            className="hover absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity">
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
            src={originalFile ? URL.createObjectURL(originalFile) : null}
            onClick={openModal}
            onDrop={handleChange}
            alt="Thumbnail"
            style={{objectFit: 'fit', maxWidth: '100%', maxHeight: '100%'}}
          />
        </div>
      )  : (
        <div 
        onDrop={handleChange}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = fileTypes.map(type => `.${type.toLowerCase()}`).join(',');
          input.onchange = (event) => {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
              setOriginalFile(selectedFile);
              setModalOpen(true);
            }
          };
          input.click();
        }}
        className='dark:text-white w-full h-full dark:bg-neutral-800'>
          Click or Drag and Drop to Upload Image
        </div>
      )}
        </div>
    </>
  );
}

export default ImageUploader;

// helper to crop using canvas
function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      const canvas = document.createElement('canvas');

      console.log(crop);
      console.log(image.naturalHeight);
      console.log(crop);
      const x = image.naturalWidth * crop.x / 100;
      const y = image.naturalHeight * crop.y / 100;

      const width = image.naturalWidth * crop.width / 100;
      const height = image.naturalHeight * crop.height / 100;

      canvas.width = image.naturalWidth * crop.width / 100;
      canvas.height = image.naturalHeight * crop.height / 100;

      const ctx = canvas.getContext('2d');
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

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    };
  });
}


