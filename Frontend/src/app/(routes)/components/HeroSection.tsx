import Image from "next/image";
import React from "react";
import HeroImage from "@/assets/HeroImage.png";
import { IoPhonePortraitOutline } from "react-icons/io5";
const HeroSection = () => {
  return (
    <div className="flex justify-end">
      <div className="max-w-[1680px] w-full h-[800px] flex justify-between">
        <div className="w-[30%] flex flex-col gap-8 justify-center items-start">
          <div className="text-[48px] font-bold">
            <h1> আমরা শুধু ঘর খুঁজি না,</h1>
            <h2>স্বপ্ন খুঁজে দিই</h2>
          </div>
          <div className="w-full flex justify-start">
            <button className="font-bold flex gap-2 items-center justify-center text-[#1D4ED8] h-[45px] px-[13px] rounded-lg border border-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white">
              <span>
                <IoPhonePortraitOutline />
              </span>
              <span className="text-sm">অ্যাপ ডাউনলোড</span>
            </button>
          </div>
        </div>

        <div className="w-[70%] flex justify-end">
          <Image src={HeroImage} alt="HeroImage" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
