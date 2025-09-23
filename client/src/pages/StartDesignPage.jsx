import React from "react";
import { useNavigate } from "react-router-dom";
function StartDesignPage() {
  const navigate = useNavigate();
  const handleStartNewDesign = () => {
    navigate("/studio");
  };
  return (
    <div className="overlow-hidden flex flex-col h-full min-h-[calc(100dvh-40px)] md:min-h-[calc(100dvh-60px)] items-center relative p-10 bg-[var(--bg-secondary)]">
      <section className=" w-full p-10 sm:p-20 flex flex-col items-center justify-center gap-8 sm:gap-10 relative self-stretch max-w-[850px] w-fit m-auto my-auto top-[45%] bg-[var(--bg-main)] rounded-[30px] sm:rounded-[45px] border-[0.5px] border-solid border-[var(--border-color)] ">
      <p className="relative w-full rubik font-black text-4xl sm:text-5xl text-[var(--text-primary)] text-center leading-[0.75] tracking-wider [font-variant:all-small-caps] ">
          Start Your Qreation
        </p>
        {/* <p className="relative mt-[-1.00px] rubik font-extrabold text-[var(--accent)] text-4xl sm:text-5xl text-center tracking-[0] leading-[43.2px]">
          Ready to make it yours?
        </p> */}
        <p className="relative sm:max-w-[675px]  text-lg sm:text-2xl text-[var(--text-secondary)] sm:mb-10 text-center tracking-[0] leading-[1.25]">
        Make your mark. Whether it’s your LinkedIn or that brilliant side project, QRKI puts your best link front and center. <br/><br/>Ready to get started?
        </p>
        <button
          className="inline-flex flex-col justify-center py-[8px] px-[12px] bg-[#03bec0]  rounded-[60px] border border-solid border-[#817e6ba8] items-center gap-2.5 relative flex-[0_0_auto] hover:opacity-75 cursor-pointer transition-colors duration-200"
          onClick={handleStartNewDesign}
          aria-label="Start creating from scratch"
        >
          <span className="relative w-fit font-normal text-black text-lg sm:text-lg text-center tracking-wide leading-[normal] whitespace-nowrap uppercase">
          Let's Do This
          </span>
        </button>
      </section>
    </div>
  );
}
export default StartDesignPage;
