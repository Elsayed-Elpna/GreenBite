import { createTheme } from "flowbite-react";

const profileTheme = createTheme({
  dropdown: {
    floating: {
      base: " z-50 w-44 rounded-2xl bg-white shadow-xl overflow-hidden",

      item: {
        base: "flex w-full items-center justify-center px-4 py-3 text-sm text-black hover:bg-gray-100 transition-colors",
      },

      divider: "my-1 h-px bg-[#C2E66E]",
    },
  },
});

export default profileTheme;
