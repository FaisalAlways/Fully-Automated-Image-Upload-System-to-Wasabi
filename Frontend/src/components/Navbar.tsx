import React from "react";
import { FaUser } from "react-icons/fa";
const Navbar = () => {
  return (
    <div className="shadow-md">
      <div className="max-w-[95%] mx-auto flex items-center justify-between h-[75px]">
        <div className="w-[30%] pl-[5px]"> 
          <div>
            <div className="mobile_logo block sm:hidden">Hello 1</div>
            <div className="hidden sm:block lg:hidden tablet_logo">Hello 2</div>
            <div className="hidden lg:block desktop_logo">Hello 3</div>
          </div>
        </div>

        <div className="w-[70%] flex justify-end">
          <button className="flex gap-2 items-center justify-center text-white h-[55px] px-[25px] rounded-lg bg-[#1D4ED8]">
            <span>
              <FaUser />
            </span>
            <span>নতুন একাউন্ট বানান</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
