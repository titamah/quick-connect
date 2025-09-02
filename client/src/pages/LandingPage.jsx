import React from 'react';
import { useDevice } from '../contexts/DeviceContext';
import { Link } from 'react-router-dom';
// import bendito1 from "./bendito-1.png";
// import image3 from "./image-3.png";

const LandingPage = () => {
  const { isMobile } = useDevice();
  const navigationItems = [
    { text: "START QREATING", type: "button" },
    { text: "ABOUT", type: "link" },
  ];

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
    <main className="flex flex-col h-fit items-start relative bg-[#f5f3e9]">
      

      <section className="flex flex-row flex-wrap h-fit min-h-[80vh] w-full items-center justify-center space-y-[15px] gap-[25px] px-[50px] pb-[50px] pt-[50px] relative self-stretch bg-[var(--brand-orange)] rounded-[0px_0px_90px_90px]">
        <div
          className="relative max-w-[450px] w-full aspect-[1] !bg-pink-500"
          alt="Custom QR code wallpaper example showing a phone with a personalized QR code design"
          // src={image3}
        >
        </div>

        <div className="flex flex-col h-full w-fit max-w-[515px] items-start justify-center gap-[25px] relative">
          <text className="relative self-stretch w-full slab font-black text-[#001d28] text-5xl">
            Make Custom Qr Code Wallpapers
          </text>

          <p className="relative w-full rubik font-medium text-neutral-900 text-2xl tracking-[0] leading-[normal]">
            Turn your lock screen into your superpower. Custom wallpapers with
            QR codes that are actually you - no unlock needed, just connection.
          </p>

          <button className="inline-flex items-center justify-center gap-2.5 p-[12px] relative flex-[0_0_auto] bg-[var(--brand-green)] rounded-[75px] border-[0.5px] border-solid border-neutral-900 hover:opacity-90 transition-opacity">
            <span className="relative w-fit font-normal text-neutral-900 text-lg tracking-[0] leading-[normal] whitespace-nowrap">
              START QREATING
            </span>
          </button>
        </div>
      </section>

      <section className="flex flex-col mt-[150px] h-fit min-h-[90vh] w-full items-start gap-[35px] p-[50px] relative self-stretch w-full rounded-[0px_0px_90px_90px] bg-variable-collection-color">
        <text className="relative w-fit mt-[-1.00px] slab font-black text-[#001d28] text-6xl tracking-[0] leading-[normal] whitespace-nowrap">
          How It Works
        </text>

        <div className="flex-wrap items-center gap-[15px] flex-1 self-stretch w-full grow flex relative">
          {howItWorksSteps.map((step) => (
            <article
              key={step.id}
              className={`flex flex-col min-w-[415px] min-h-[225px] max-h-[600px] items-start ${step.id === 2 ? "justify-center" : step.id === 3 ? "justify-end" : ""} gap-[15px] p-7.5 pr-9 relative flex-1 self-stretch grow ${step.bgColor}`}
            >
              <text className="relative self-stretch mt-[-1.00px] rubik font-black text-[#001d28] text-4xl">
                {step.title}
              </text>

              <p className="relative self-stretch font-bold text-neutral-900 text-3xl tracking-[0] leading-[normal]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="flex flex-wrap mt-[150px] justify-center gap-[102px_102px] px-0 py-[150px] self-stretch w-full h-fit min-h-[90vh] flex-[0_0_auto] bg-[#001d28] rounded-[90px_90px_0px_0px] items-center relative">
        <div className="inline-flex flex-col items-center justify-center gap-[75px] px-[33px] py-0 relative flex-[0_0_auto]">
          <p className="relative w-[653px] rubik-mono font-normal text-white text-5xl text-justify tracking-[0] leading-[normal]">
            Because business cards get lost and you're way more interesting than
            a black and white square.
          </p>

          <button className="inline-flex items-center justify-center gap-2.5 p-[12px] relative flex-[0_0_auto] bg-[var(--brand-green)] rounded-[75px] border-[0.5px] border-solid border-neutral-900 hover:opacity-90 transition-opacity">
            <span className="relative w-fit font-normal text-neutral-900 text-lg tracking-[0] leading-[normal] whitespace-nowrap">
              START QREATING
            </span>
          </button>
        </div>

        <div
          className="relative max-w-[450px] w-full aspect-[1] !bg-pink-500"
          alt="Phone displaying custom QR code wallpaper in use"
          // src={image2}
        >
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
