import Image from "next/image";
import React from "react";
import HeroImage from "@/assets/HeroImage.png";
import HeroImage2 from "@/assets/HeroImage-2.jpg";
import HeroImage3 from "@/assets/HeroImage-3.jpg";
import HeroImage4 from "@/assets/HeroImage-4.jpg";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { Worker } from "@/assets/svg/Worker";
import { Map } from "@/assets/svg/Map";
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

        <div className="w-[70%] relative flex justify-end">
          <div className="absolute left-[223px] top-[138px] z-20 size-[100px] rounded-full bg-white flex justify-center items-center">
            <FaHome color="#FF460D" size={50} />
          </div>
          <div className="absolute  bottom-[180px] left-[70px] z-20 size-[100px] rounded-full bg-white flex justify-center items-center">
            <Worker className="size-[50px]" />
          </div>
          <div className="absolute bottom-[180px] left-[400px] z-20 size-[100px] rounded-full bg-white flex justify-center items-center">
            <Map className="size-[50px]" />
          </div>
          <div className="absolute top-50 left-[51px] w-[474px] flex justify-center items-center rounded-full h-[474px] bg-[#1D4ED8]">
            <Image
              className="size-[398px] rounded-full"
              src={HeroImage2}
              alt="HeroImage2"
            />
          </div>

          <Image src={HeroImage} alt="HeroImage" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
