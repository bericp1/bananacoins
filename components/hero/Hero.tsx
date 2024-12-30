import Image from "next/image";
import hero from "./hero.jpg";

export default function Hero() {
  return (
    <div className="relative w-full h-screen md:h-[500px]">
      {/* Background Image */}
      <Image
        src={hero}
        alt="Surreal Mario Kart inspired artwork with rainbow tracks and mushrooms"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/60" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center max-w-4xl">
          MarioKart 8 <span className="text-nowrap">2024-25</span>
        </h1>
      </div>
    </div>
  );
}
