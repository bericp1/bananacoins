import Image from "next/image";
import hero from "./hero.jpg";

export default function Hero() {
  return (
    <div className="relative w-full h-screen md:h-[500px]">
      {/* Background Image */}
      <Image
        src={hero}
        alt="A vibrant cartoon image of six people in go-karts, driving side-by-side towards the viewer on a rainbow track in a whimsical Mario Kart-style world. Each character wears a hat with their name (Joe, Kim, Kristin, Alex, Brandon, Justin)."
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/40" />

      {/* Content */}
      <div className="relative z-10 flex items-start justify-center w-full h-full px-4 py-18">
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center max-w-4xl">
          MarioKart 8 <span className="text-nowrap">2025-26</span>
        </h1>
      </div>
    </div>
  );
}
