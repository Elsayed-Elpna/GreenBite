import { Listbox, Portal } from "@headlessui/react";
import { useState, useRef } from "react";

const expiryOptions = [
  { name: "All", value: "" },
  { name: "Expired", value: true },
  { name: "Not Expired", value: false },
];

export function ExpirySelect({ onChange }) {
  const [selected, setSelected] = useState(expiryOptions[0]);
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
    <div className="w-40">
      <Listbox
        value={selected}
        onChange={(item) => {
          setSelected(item);
          onChange(item.value); // "" | true | false
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
                    fixed z-9999
                    
                    rounded-md bg-[#F4F4F4]
                    shadow-lg
                    focus:outline-none
                  "
                >
                  {expiryOptions.map((item) => (
                    <Listbox.Option
                      key={item.name}
                      value={item}
                      className={({ active, selected }) =>
                        `
                        text-center cursor-pointer
                        px-2 py-2 my-1 mx-2
                        rounded-[20px]
                        outline-none focus:outline-none
                        ${
                          selected || active
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
