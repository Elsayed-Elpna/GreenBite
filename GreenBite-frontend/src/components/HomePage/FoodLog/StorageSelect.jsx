import { Listbox, Portal } from "@headlessui/react";
import { useState, useRef } from "react";

const storageOptions = [
  { name: "All Storage", value: "" },
  { name: "Fridge", value: "fridge" },
  { name: "Freezer", value: "freezer" },
  { name: "Room Temperature", value: "room_temp" },
];

export function StorageSelect({ onChange }) {
  const [selected, setSelected] = useState(storageOptions[0]);
  const buttonRef = useRef(null);
  const [position, setPosition] = useState(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  return (
    <div className="w-52">
      <Listbox
        value={selected}
        onChange={(item) => {
          setSelected(item);
          onChange(item.value);
        }}
      >
        {({ open }) => (
          <>
            {/* Button */}
            <Listbox.Button
              ref={buttonRef}
              onClick={updatePosition}
              className="
                w-full rounded-full
                bg-[#EEEEF0]

                px-2 py-2
                text-center text-[#8B8C91]
                focus:outline-none
              "
            >
              {selected.name}
            </Listbox.Button>

            {/* PORTAL */}
            {open && position && (
              <Portal>
                <Listbox.Options
                  static
                  style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                  }}
                  className="
                    fixed 
                    z-9999
                    rounded-md bg-[#F4F4F4]
                    shadow-lg
                    py-1
                    focus:outline-none
                  "
                >
                  {storageOptions.map((item) => (
                    <Listbox.Option
                      key={item.value}
                      value={item}
                      className={({ active, selected }) =>
                        `
                        cursor-pointer 
                        px-3 py-2 my-1 mx-2
                        rounded-[20px]
                        outline-none focus:outline-none
                        ${
                          selected
                            ? "bg-[#7EB685] text-white"
                            : active
                            ? "bg-[#7EB685] text-white"
                            : "text-[#8B8C91]"
                        }
                      `
                      }
                    >
                      {item.name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Portal>
            )}
          </>
        )}
      </Listbox>
    </div>
  );
}
