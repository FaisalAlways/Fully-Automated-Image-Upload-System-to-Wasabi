import Link from "next/link";
import React from "react";
import { FaUser } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
const Navbar = () => {
  const menuList = [
    {
      name: "সার্ভিস",
      path: "/service",
      subMenu: [
        {
          name: "সার্ভিস ১",
          path: "/service/service1",
        },
        {
          name: "সার্ভিস ১",
          path: "/service/service1",
        },
        {
          name: "সার্ভিস ১",
          path: "/service/service1",
        },
        {
          name: "সার্ভিস ১",
          path: "/service/service1",
        },
      ],
    },
    {
      name: "ব্লগ",
      path: "/blog",
    },
    {
      name: "হেল্প",
      path: "/help",
    },
    {
      name: "যোগাযোগ",
      path: "/contact",
    },
  ];

  return (
    <div className="shadow-md">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between h-[75px]">
        {/* Logo part */}
        <div className="w-[30%] lg:w-[10%] pl-[5px]">
          <div>
            <div className="mobile_logo block sm:hidden">
              <FaHome color="#1D4ED8" size={40} />
            </div>
            <div className="hidden sm:block lg:hidden tablet_logo">
              <FaHome color="#1D4ED8" size={45} />
            </div>
            <div className="hidden lg:block desktop_logo">
              <FaHome color="#1D4ED8" size={50} />
            </div>
          </div>
        </div>

        {/* Menu part */}

        <div className="menu_part hidden lg:flex justify-center gap-6 items-center lg:w-[70%]">
          <div className="flex gap-6 justify-center items-center">
            {menuList?.map((item, index) => (
              <div key={index}>
                <Link href={item.path} className="text-[15px]">{item.name}</Link>
              </div>
            ))}
          </div>
          <div>
            <button className="bg-[#5A8CFA] text-[15px] px-4 py-2 rounded-lg text-white">খুজে দেখুন</button>
          </div>
        </div>
        {/* Button part */}
        <div className="w-[70%] lg:w-[20%] flex justify-end">
          <button className="flex gap-2 items-center justify-center text-white h-[45px] px-[13px] rounded-lg bg-[#1D4ED8]">
            <span>
              <FaUser />
            </span>
            <span className="text-sm">নতুন একাউন্ট বানান</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
