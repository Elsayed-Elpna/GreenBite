import React from "react";

import { FaPlus } from "react-icons/fa6";
import { PiFire } from "react-icons/pi";
import { PiBreadLight } from "react-icons/pi";
import { PiFish } from "react-icons/pi";
import { IoWaterOutline } from "react-icons/io5";

const MenuCard = () => {
  return (
    <>
      <div className="self-stretch p-4 mt-4 bg-white rounded-2xl inline-flex flex-col justify-start items-start gap-4">
        <div className="self-stretch h-16 inline-flex justify-start items-start gap-4">
          <div className="w-16 h-16 relative bg-lime-200 rounded-xl overflow-hidden">
            <img
              className="w-16 h-16 left-0 top-0 absolute"
              src="https://placehold.co/64x64"
            />
          </div>
          <div className="flex-1 self-stretch inline-flex flex-col justify-between items-start">
            <div className="self-stretch justify-start text-zinc-800 text-xs font-semibold font-['Poppins'] leading-4">
              Oatmeal with Almond Butter and Berries
            </div>
            <div className="self-stretch inline-flex justify-between items-end">
              <div className="px-1.5 py-1 bg-lime-200 rounded-md flex justify-center items-center gap-1">
                <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
                  Breakfast
                </div>
              </div>
              <div
                data-show-badge="true"
                data-size="xSmall"
                data-type="Primary"
                className="p-0.75 bg-lime-300 rounded-md flex justify-start items-start gap-2"
              >
                <div className="w-4 h-4 relative">
                  <FaPlus />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-200" />
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiFire className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                C
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              350 kcal
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiBreadLight className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                C
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              45g
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiFish className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />
              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                P
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              12g
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <IoWaterOutline className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                F
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              14g
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch p-4 mt-4 bg-white rounded-2xl inline-flex flex-col justify-start items-start gap-4">
        <div className="self-stretch h-16 inline-flex justify-start items-start gap-4">
          <div className="w-16 h-16 relative bg-lime-200 rounded-xl overflow-hidden">
            <img
              className="w-16 h-16 left-0 top-0 absolute"
              src="https://placehold.co/64x64"
            />
          </div>
          <div className="flex-1 self-stretch inline-flex flex-col justify-between items-start">
            <div className="self-stretch justify-start text-zinc-800 text-xs font-semibold font-['Poppins'] leading-4">
              Oatmeal with Almond Butter and Berries
            </div>
            <div className="self-stretch inline-flex justify-between items-end">
              <div className="px-1.5 py-1 bg-lime-200 rounded-md flex justify-center items-center gap-1">
                <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
                  Breakfast
                </div>
              </div>
              <div
                data-show-badge="true"
                data-size="xSmall"
                data-type="Primary"
                className="p-0.75 bg-lime-300 rounded-md flex justify-start items-start gap-2"
              >
                <div className="w-4 h-4 relative">
                  <FaPlus />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-200" />
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiFire className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                C
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              350 kcal
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiBreadLight className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                C
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              45g
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiFish className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />
              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                P
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              12g
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <IoWaterOutline className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                F
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              14g
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch p-4 mt-4 bg-white rounded-2xl inline-flex flex-col justify-start items-start gap-4">
        <div className="self-stretch h-16 inline-flex justify-start items-start gap-4">
          <div className="w-16 h-16 relative bg-lime-200 rounded-xl overflow-hidden">
            <img
              className="w-16 h-16 left-0 top-0 absolute"
              src="https://placehold.co/64x64"
            />
          </div>
          <div className="flex-1 self-stretch inline-flex flex-col justify-between items-start">
            <div className="self-stretch justify-start text-zinc-800 text-xs font-semibold font-['Poppins'] leading-4">
              Oatmeal with Almond Butter and Berries
            </div>
            <div className="self-stretch inline-flex justify-between items-end">
              <div className="px-1.5 py-1 bg-lime-200 rounded-md flex justify-center items-center gap-1">
                <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
                  Breakfast
                </div>
              </div>
              <div
                data-show-badge="true"
                data-size="xSmall"
                data-type="Primary"
                className="p-0.75 bg-lime-300 rounded-md flex justify-start items-start gap-2"
              >
                <div className="w-4 h-4 relative">
                  <FaPlus />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-200" />
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiFire className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                C
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              350 kcal
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiBreadLight className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                C
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              45g
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiFish className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />
              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                P
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              12g
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <IoWaterOutline className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                F
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              14g
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch p-4 mt-4 bg-white rounded-2xl inline-flex flex-col justify-start items-start gap-4">
        <div className="self-stretch h-16 inline-flex justify-start items-start gap-4">
          <div className="w-16 h-16 relative bg-lime-200 rounded-xl overflow-hidden">
            <img
              className="w-16 h-16 left-0 top-0 absolute"
              src="https://placehold.co/64x64"
            />
          </div>
          <div className="flex-1 self-stretch inline-flex flex-col justify-between items-start">
            <div className="self-stretch justify-start text-zinc-800 text-xs font-semibold font-['Poppins'] leading-4">
              Oatmeal with Almond Butter and Berries
            </div>
            <div className="self-stretch inline-flex justify-between items-end">
              <div className="px-1.5 py-1 bg-lime-200 rounded-md flex justify-center items-center gap-1">
                <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
                  Breakfast
                </div>
              </div>
              <div
                data-show-badge="true"
                data-size="xSmall"
                data-type="Primary"
                className="p-0.75 bg-lime-300 rounded-md flex justify-start items-start gap-2"
              >
                <div className="w-4 h-4 relative">
                  <FaPlus />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-200" />
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiFire className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                C
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              350 kcal
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiBreadLight className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                C
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              45g
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <PiFish className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />
              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                P
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              12g
            </div>
          </div>
          <div className="flex justify-center items-center gap-1.5">
            <div className="flex justify-start items-center gap-0.5">
              <IoWaterOutline className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3" />

              <div className="justify-start text-neutral-400 text-xs font-normal font-['Poppins'] leading-3">
                F
              </div>
            </div>
            <div className="justify-start text-zinc-800 text-xs font-normal font-['Poppins'] leading-3">
              14g
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuCard;
