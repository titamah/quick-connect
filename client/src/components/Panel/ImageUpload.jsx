import React, { useState } from 'react';
import { Button, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
const App = () => {
  const [fileList, setFileList] = useState([
    {
      uid: '-1',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
  ]);
  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.body.appendChild(image);
  };
  return (
    <div>
    <Button
      type="primary"
      onClick={onPreview}
      disabled={fileList.length === 0}
    //   loading={uploading}
      style={{
        marginTop: 16,
      }}
    >
    </Button>
    <ImgCrop rotationSlider>
      <Upload
        action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
        listType="picture-card"
        fileList={fileList}
        onChange={onChange}
        onPreview={onPreview}
        maxCount={1}
        accept=".png,.jpeg,.jpg,.gif,.svg"
      >
        {fileList.length < 1 && '+ Upload'}
      </Upload>
    </ImgCrop>
    </div>
  );
};
export default App;