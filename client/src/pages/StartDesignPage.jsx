import React from "react";
import { useNavigate } from "react-router-dom";
function StartDesignPage() {
  const navigate = useNavigate();
  const handleStartNewDesign = () => {
    navigate("/studio");
  };
  return (
    <div className="flex flex-col h-fit min-h-[calc(100dvh-40px)] md:min-h-[calc(100dvh-60px)] items-center relative p-10 bg-[var(--bg-secondary)]">
      <section className="p-10 sm:p-20 flex flex-col items-center justify-center gap-8 sm:gap-10 relative self-stretch max-w-[850px] w-fit m-auto my-auto mt-20 bg-[var(--bg-main)] rounded-[30px] sm:rounded-[45px] border-[0.5px] border-solid border-[var(--border-color)] ">
        <p className="relative w-fit slab font-black text-3xl sm:text-4xl text-[var(--text-secondary)] text-center tracking-wider [font-variant:all-small-caps] whitespace-nowrap">
          Build Your Qreation
        </p>
        <p className="relative mt-[-1.00px] rubik font-extrabold text-[var(--accent)] text-4xl sm:text-5xl text-center tracking-[0] leading-[43.2px]">
          Ready to make it yours?
        </p>
        <p className="relative sm:max-w-[678px] rubik text-lg font-light sm:text-3xl text-[var(--text-secondary)] sm:mb-10 text-center tracking-[0] leading-[normal]">
          What deserves the spotlight? LinkedIn? That one creative side project?
          Your secret cooking blog? (we don't judge)
        </p>
        <button
          className=" cursor-pointer inline-flex flex-col justify-center py-[12px] px-[18px] bg-[#03bec0] rounded-[60px] border border-solid border-[#817e6ba8] items-center gap-2.5 relative flex-[0_0_auto] hover:bg-[#02a8aa] transition-colors duration-200 "
          onClick={handleStartNewDesign}
          aria-label="Start creating from scratch"
        >
          <span className="relative w-fit font-normal text-black text-lg sm:text-xl text-center tracking-wide leading-[normal] whitespace-nowrap uppercase">
            Let's Do This
          </span>
        </button>
      </section>
    </div>
  );
}
export default StartDesignPage;
