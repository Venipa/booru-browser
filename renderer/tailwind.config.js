const createPlugin = require("tailwindcss/plugin");
const defaultTheme = require("tailwindcss/defaultTheme");
const tailwindFilters = require("tailwindcss-filters");
const tailwindForms = require("@tailwindcss/forms");
/**
 * @type {import("tailwindcss/tailwind-config").TailwindConfig}
 */
module.exports = {
  mode: "aot",
  purge: {
    enabled: false,
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
  },
  darkMode: false,
  corePlugins: {
    container: false,
  },
  theme: {
    extend: {
      backdropFilter: {
        none: "none",
        blur: "blur(20px)",
      },
      colors: {
        silver: {
          100: "#F3F3F3",
          200: "#E2E2E2",
          300: "#D0D0D0",
          400: "#ADADAD",
          500: "#8A8A8A",
          600: "#7C7C7C",
          700: "#535353",
          800: "#3E3E3E",
          900: "#292929",
        },
      },
      filter: {
        blur: "blur(10px)",
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xxs: "0.7rem",
      },
      lineHeight: {
        12: "3rem",
      },
      opacity: {
        20: "0.2",
        90: "0.9",
      },
      screens: {
        dark: { raw: "(prefers-color-scheme: dark)" },
        light: { raw: "(prefers-color-scheme: light)" },
      },
      spacing: {
        "post-image": "calc(100vh - 8rem)",
        toolbar: "calc(3.25rem + 1px)",
        container: "768px",
      },
      transitionDuration: {
        hover: "50ms",
      },
      width: {
        sidebar: "286px",
        previewPane: "768px",
        previewPaneMax: "1024px",
      },
    },
  },
  variants: {
    extend: {
      scale: ["group-hover"],
    },
  },
  plugins: [
    tailwindFilters,
    tailwindForms,
    createPlugin(({ addUtilities }) => {
      const variants = [1, 2, 3, 10];

      variants.forEach((number) => {
        addUtilities({
          [`.max-lines-${number}`]: {
            display: "-webkit-box",
            "-webkit-line-clamp": `${number}`,
            "-webkit-box-orient": "vertical",
            overflow: "hidden",
            width: "100%",
            "word-wrap": "break-word",
          },
        });
      });
    }),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
