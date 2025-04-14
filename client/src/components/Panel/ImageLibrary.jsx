import React, { useState, useEffect, useContext } from "react";
import { DeviceContext } from "../../App";
import { Grip, Trash2, Upload } from "lucide-react";
import { MasonryPhotoAlbum } from "react-photo-album";
import InfiniteScroll from "react-photo-album/scroll";
import "react-photo-album/masonry.css";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";

function ImageLibrary({setOriginalFile}) {
  const { device, setDevice } = useContext(DeviceContext);

  const [search, setSearch] = useState("");
  const [searchVal, setSearchVal] = useState(null);

  const urlToFile = async (url, id) => {
    try {
      const extension = url.split('.').pop().split('?')[0];
      const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
  
      const response = await fetch(url);
      const blob = await response.blob();
  
      return new File([blob], `${id}.${extension}`, { type: mimeType });
    } catch (error) {
      console.error("Error converting URL to file:", error);
    }
  };
  

  const fetchPhotos = async (pageNumber) => {
    if (!search) return;

    const API_KEY = "CMQsbtTbbtMM66iV6zIu2uWIf73LQLeT6KSN6gJgw4HrDHFOZtmnlcAe";
    const url = `https://api.pexels.com/v1/search?query=${searchVal}&page=${pageNumber}&per_page=15`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();
      console.log(response.status);
      if (!data.photos || data.photos.length === 0) return null;

      const formattedPhotos = data.photos.map((photo) => ({
        src: photo.src.medium,
        file: photo.src.original,
        id: photo.id,
        width: photo.width,
        height: photo.height,
      }));


      return formattedPhotos;
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };
  const [height, setHeight] = useState(236);
  return (
    // <Resizable
    //   height={height}
    //   width={Infinity}
    //   minConstraints={[0, 236]}
    //   resizeHandles={["s"]}
    //   onResize={(e, { size }) => setHeight(size.height)}
    //   handle={
    //     <div className="absolute h-3 bottom-0 w-full cursor-row-resize translate-y-1 z-1500">
    //     </div>
    //   }
    // >
      <div  className="pb-1 pointer-events-auto pt-2 w-full h-full flex flex-col gap-2 overflow-y-scroll relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              console.log("enter pressed");
              setSearchVal(search);
            }
          }}
          placeholder="Search..."
          className="dark:text-white text-xs w-[98%] mx-[1px] h-4 mb-1 px-2 rounded-full sticky !shadow-[0_0_0_.95px_rgb(215,215,215)] dark:!shadow-[0_0_0_.95px_rgb(66,66,66)]"
        />{searchVal ? (
            <InfiniteScroll
            // photos={photos}
            onClick={async ({ photo }) => {
  console.log("Clicked photo:", photo);
  const image = await urlToFile(photo.file, photo.id);
  if (image) setOriginalFile(image);
}}
              key={searchVal}
              singleton
              fetch={fetchPhotos}
              loading={<p className="text-xs text-center my-2 text-gray-400">Loading...</p>}
              finished={<p className="text-xs text-center my-2 text-gray-400">No more images.</p>}
            >
              <MasonryPhotoAlbum/>
            </InfiniteScroll>
          ) : (
            <p className="text-xs text-center mt-[100px] text-gray-400">Start typing to search</p>
          )}
      </div>
      // </Resizable>
  );
}

export default ImageLibrary;
