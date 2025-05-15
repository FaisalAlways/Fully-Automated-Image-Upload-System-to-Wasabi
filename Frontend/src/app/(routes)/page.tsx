import Navbar from "@/components/Navbar";
import React from "react";
import HeroSection from "./components/HeroSection";

const page = () => {
  return (
    <div className="bg-[#F8FAFC]">
      <Navbar />
      <HeroSection/>
    </div>
  );
};

export default page;
