import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDevice } from "../contexts/DeviceContext";
import { getAllTemplates } from "../utils/templates";

function StartDesignPage() {
  const navigate = useNavigate();
  const { loadTemplateData } = useDevice();

  const handleStartNewDesign = () => {
    navigate("/studio");
  };

  const handleLoadTemplate = (template) => {
    loadTemplateData(template);
    navigate("/studio");
  };

  const templates = getAllTemplates();

  return (
  <div className="flex flex-col h-fit min-h-[calc(100dvh-40px)] md:min-h-[calc(100dvh-60px)] items-center relative p-3 bg-[var(--bg-main)]">
    <section className="flex flex-col items-center justify-center gap-8 sm:gap-10 relative self-stretch w-full my-auto">
      {/* <span className="flex flex-col items-center justify-center gap-10 relative self-stretch w-full"> */}
      <p className="relative w-fit slab font-black text-3xl sm:text-4xl text-[var(--text-secondary)] text-center tracking-wider [font-variant:small-caps] whitespace-nowrap">
        start a qreation
      </p>

      <div className="flex-col gap-2 inline-flex items-center justify-center relative flex-[0_0_auto] px-1">
        <p className="relative mt-[-1.00px] rubik font-extrabold text-[var(--accent)] text-4xl sm:text-5xl text-center tracking-[0] leading-[43.2px]">
          Pick a template to <br />
          remix or start fresh
        </p>

        <p className="relative sm:max-w-[678px] rubik font-medium text-xl sm:text-3xl text-[var(--text-secondary)] text-center tracking-[0] leading-[normal]">
          Templates for inspiration, or go rogue and start
          from scratch - either way, make it yours
        </p>
      </div>

      <button
        className="inline-flex flex-col justify-center py-[8px] px-[12px] bg-[#03bec0] rounded-[60px] border border-solid border-[#817e6ba8] items-center gap-2.5 relative flex-[0_0_auto] hover:bg-[#02a8aa] transition-colors duration-200 "
        onClick={handleStartNewDesign}
        aria-label="Start creating from scratch"
      >
        <span className="relative w-fit font-normal text-black text-md sm:text-lg text-center tracking-wide leading-[normal] whitespace-nowrap">
          START FROM SCRATCH
        </span>
      </button>
      {/* </span> */}
      <section className="inline-flex flex-col sm:max-w-[1200px] w-full sm:min-w-[725px]  overflow-x-scroll items-start justify-center gap-2.5 sm:gap-5 px-0 pt-3 sm:py-5 relative flex-[0_0_auto] bg-[var(--bg-main)] rounded-[30px] sm:rounded-[45px] overflow-hidden border-[0.5px] border-solid border-[var(--border-color)] mb-1 sm:mt-15">
        <div className="flex px-5 sm:px-10 py-0 self-stretch w-full gap-2.5 sticky left-0 flex-[0_0_auto]">
          <p className="relative w-full slab font-semibold text-[var(--text-secondary)] sm:text-3xl text-2xl tracking-[0] leading-[normal]">
            Choose A Template
          </p>
        </div>

        <div className="flex-wrap sm:flex-nowrap gap-2.5 h-[325px] sm:h-fit sm:gap-[32px] px-4 sm:px-8 py-0 overflow-y-scroll sm:overflow-x-scroll inline-flex justify-start  relative flex-[0_0_auto]">
          {templates.map((template) => (
            <button
              key={template.id}
              className={`relative sm:w-[275px] sm:h-[325px] w-[180px] h-[212.5px] bg-[#f5f3e9] rounded-[15px] sm:rounded-[20px] hover:bg-[#f0ede0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#fc6524] focus:ring-offset-2`}
              onClick={() => handleLoadTemplate(template.id)}
              aria-label={`Select ${template.name}`}
            />
          ))}
        </div>
      </section>
    </section>
  </div>




    // <div className="min-h-screen bg-[var(--bg-main)] dark:bg-neutral-900">
    //   <div className="container mx-auto px-4 py-8">
    //     <div className="text-center mb-12">
    //       <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
    //         Start Your Design
    //       </h1>
    //       <p className="text-lg text-[var(--text-secondary)]">
    //         Choose a template or start from scratch
    //       </p>
    //     </div>

    //     {/* Templates Section */}
    //     <div className="mb-12">
    //       <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
    //         Templates
    //       </h2>
    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    //         {templates.map((template) => (
    //           <div
    //             key={template.id}
    //             className="bg-[var(--bg-secondary)] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
    //             onClick={() => handleLoadTemplate(template)}
    //           >
    //             {/* Template preview based on background */}
    //             <div 
    //               className="w-full h-48 rounded-md mb-3 flex items-center justify-center relative overflow-hidden"
    //               style={{
    //                 backgroundColor: template.background?.style === 'solid' 
    //                   ? template.background?.color 
    //                   : template.background?.style === 'gradient'
    //                   ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)'
    //                   : '#f0f0f0'
    //               }}
    //             >
    //               {/* QR Code preview */}
    //               <div className="text-center">
    //                 <div 
    //                   className="w-16 h-16 mx-auto mb-2 flex items-center justify-center rounded-lg"
    //                   style={{
    //                     backgroundColor: template.qrConfig?.custom?.primaryColor || '#000000',
    //                     color: template.qrConfig?.custom?.secondaryColor || '#FFFFFF'
    //                   }}
    //                 >
    //                   <span className="text-xs font-bold">QR</span>
    //                 </div>
    //                 <p className="text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
    //                   {template.qrConfig?.url || 'QR Code'}
    //                 </p>
    //               </div>
                  
    //               {/* Template badge */}
    //               <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
    //                 Template
    //               </div>
    //             </div>
                
    //             <div>
    //               <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">
    //                 {template.name}
    //               </p>
    //               <p className="text-xs text-gray-400">
    //                 {template.description}
    //               </p>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>

    //     {/* Start from Scratch Button */}
    //     <div className="text-center">
    //       <button
    //         onClick={handleStartNewDesign}
    //         className="inline-block bg-[var(--accent)] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
    //       >
    //         Start from Scratch
    //       </button>
    //     </div>
    //   </div>
    // </div>
  );
}

export default StartDesignPage;

