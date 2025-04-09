import React, { useState } from 'react';
import { Button, Upload, Modal } from 'antd';
import ImgCrop from 'antd-img-crop';

function ImageUploader() {
  
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [image, setImage] = useState(null);
  
  const handleToggleCropper = () => {
    setIsCropperOpen(!isCropperOpen);
  };
  
  const handleImageChange = (info) => {
    if (info.file.status === 'done') {
      setImage(info.file.originFileObj);
    }
  };
  
  return (
    <div>
      <button onClick={handleToggleCropper}>Edit Image</button>
      {/* <Modal
        visible={isCropperOpen}
        onCancel={handleToggleCropper}
        footer={null}
      >
        {image && (
          <ImgCrop>
            <Upload
              onChange={handleImageChange}
              defaultFileList={[{ uid: '1', name: 'image.png', status: 'done', url: URL.createObjectURL(image) }]}
            >
              <button>+ Edit Image</button>
            </Upload>
          </ImgCrop>
        )}
      </Modal> */}
    </div>
  );
}

export default ImageUploader;