import React from 'react';
import { useDevice } from '../contexts/DeviceContext';
import { useNavigate } from 'react-router-dom';
const LandingPage = () => {
  const { isMobile } = useDevice();
  const navigate = useNavigate();
  const handleStartQreating = () => {
    navigate('/start-design/');
  };
  const howItWorksSteps = [
    {
      id: 1,
      title: "1. DESIGN YOUR QREATION.",
      description:
        "Pick your vibe - colors, backgrounds, QR placement. Make it totally you.",
      bgColor: "bg-[#f0f66e]",
    },
    {
      id: 2,
      title: "2. DOWNLOAD YOUR WALLPAPER.",
      description:
        "Export your custom lock screen and set it as your wallpaper. That's it.",
      bgColor: "bg-[#7ed03b]",
    },
    {
      id: 3,
      title: "3. MAKE CONNECTIONS.",
      description:
        "Show your phone, they scan, magic happens. No apps, no awkward exchanges.",
      bgColor: "bg-[#03bec0]",
    },
  ];
  return (
    <div className={`pointer-events-auto overflow-y-scroll ${isMobile ? "h-[calc(100dvh-40px)]" : "h-[calc(100dvh-60px)]"}`}>
    <main className="flex flex-col h-fit w-[100vw] overflow-x-hidden items-start relative bg-[var(--bg-main)]">
      <section className="flex z-2 relative flex-row flex-wrap h-full min-h-[87.5vh] w-full justify-center  text-center  space-y-[15px] gap-[25px] px-[25px] pt-[75px] relative self-stretch rounded-[0px_0px_50px_50px] sm:rounded-[0px_0px_90px_90px]"
      style={{backgroundImage: 'url(/Hero.webp)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        {/* <img
          className={` ${isMobile ? "hidden" : ""} relative max-w-[450px] w-full !bg-pink-500`}
          alt="Custom QR code wallpaper example showing a phone with a personalized QR code design"
          src="/MockUp1.png"
        /> */}
          <text className="absolute bottom-[63.5%] md:bottom-[65%] left-[50%] translate-x-[-50%] translte-y-[-50%] rubik font-black text-[var(--brand-yellow)] md:text-6xl text-5xl w-full">
          LOCK SCREENS <br/>THAT SPARK <br/>CONNECTIONS.
          </text>
          <div className="flex flex-col justify-center max-w-[525px] w-full px-15 gap-[25px] items-center absolute bottom-[9%] left-[50%] translate-x-[-50%] tranlate-y-[-50%]">

          <p className="rubik font-medium text-white text-xl sm:text-2xl tracking-[0] leading-[normal] w-full" style={{textShadow: '0.5px 0.5px 3px rgba(0, 0, 0, 0.35)'}}>
            Custom QR wallpapers that are actually you. No unlock needed, just connection.
          </p>
          <button 
            className="inline-flex items-center  !cursor-pointer w-fit items-end gap-2.5 p-[12px] relative flex-[0_0_auto] bg-[var(--brand-green)] rounded-[75px] border-[0.5px] border-solid border-neutral-900 hover:opacity-90 transition-opacity"
            onClick={handleStartQreating}
          >
            <span className="relative w-fitfont-normal text-neutral-900 text-md sm:text-lg tracking-[0] leading-[normal] whitespace-nowrap">
              START QREATING
            </span>
          </button>
        </div>
      </section>
              {/* <img
          className={` ${isMobile ? "z-1 mt-[-45px]" : "hidden"} w-full !bg-pink-500`}
          alt="Custom QR code wallpaper example showing a phone with a personalized QR code design"
          src="/MockUp1.png"
        /> */}
      <section className="flex flex-col mt-[50px] h-fit min-h-[90vh] items-center justify-center w-full  p-[25px] sm:p-[50px] relative space-y-[35px]">
        {}
           <p className=" flex-shrink-0 relative w-full max-w-[1200px] mx-auto rubik-mono text-[var(--text-primary)] self-start sm:text-5xl text-4xl tracking-[0] leading-[normal] whitespace-nowrap">
            How It Works
          </p>
          <span className="flex-wrap gap-[15px] max-w-[1200px] h-full mx-auto w-full flex relative grow">
          {howItWorksSteps.map((step) => (
            <article
              key={step.id}
              className={`flex flex-col min-w-[375px] min-h-[100px] max-h-[600px] items-start self-stretch ${
                step.id === 2
                  ? "justify-center"
                  : step.id === 3
                  ? "justify-end"
                  : ""
              } gap-[10px] sm:gap-[15px] p-5 pr-6 sm:p-6.5 sm:pr-8 relative flex-1 self-stretch grow ${
                step.bgColor
              }`}
            >
              <text className="relative self-stretch mt-[-1.00px] rubik font-black text-[#001d28] text-2xl sm:text-3xl">
                {step.title}
              </text>
              <p className="relative self-stretch font-bold text-neutral-900 text-lg sm:text-3xl tracking-[0] leading-[normal]">
                {step.description}
              </p>
            </article>
          ))}
          </span>
        {}
      </section>
      <section className="flex flex-row flex-wrap mt-[100px] sm:mt-[150px] justify-center gap-[35px] sm:gap-[100px] px-6 py-[75px] sm:py-[150px] self-stretch w-full h-fit min-h-[100vh] flex-[0_0_auto] bg-[var(--brand-orange)] rounded-[50px_50px_0px_0px] sm:rounded-[90px_90px_0px_0px] items-center relative">
        <div className="inline-flex flex-col items-center justify-center gap-[35px] sm:gap-[75px] px-[33px] py-0 relative flex-[0_0_auto]">
          <p className={`relative w-full tracking-tighter max-w-[385px] sm:max-w-[555px] md:max-w-[653px] rubik-mono font-normal text-white text-[30px] sm:text-4xl md:text-5xl text-justify tracking-[0] leading-[normal]`}>
            Because business cards get lost and you're way more interesting than
            a black and white square.
          </p>
          <button 
            className="inline-flex items-center cursor-pointer justify-center gap-2.5 p-[12px] relative flex-[0_0_auto] bg-[var(--brand-yellow)] rounded-[75px] border-[0.5px] border-solid border-neutral-900 hover:opacity-90 transition-opacity"
            onClick={handleStartQreating}
          >
            <span className="relative w-fit font-normal text-neutral-900 text-md sm:text-lg tracking-[0] leading-[normal] whitespace-nowrap">
              START QREATING
            </span>
          </button>
        </div>
        <img
          className="relative max-w-[450px] w-full !bg-pink-500"
          alt="Phone displaying custom QR code wallpaper in use"
          src="/MockUp1.png"
        />
      </section>
      <footer className="flex w-full items-center justify-center py-4 px-6 bg-[var(--brand-orange)]  border-t border-[var(--border-color)]">
        <p className="text-sm text-white opacity-60">
          © 2025 QRKI. Made with ❤️ for better connections.
        </p>
      </footer>
    </main>
    </div>
  );
};
export default LandingPage;
