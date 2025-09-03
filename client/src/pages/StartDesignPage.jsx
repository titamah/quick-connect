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
  <div className="flex flex-col h-fit min-h-[calc(100dvh-40px)] md:min-h-[calc(100dvh-60px)] items-center relative p-3 bg-[var(--bg-secondary)]">
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

  );
}

export default StartDesignPage;

