import {
  ChakraTheme,
  extendTheme,
  withDefaultColorScheme,
  withDefaultProps,
} from "@chakra-ui/react";
import { IS_SSR } from "./helper";
const colors = {
  brand: {
    50: "#f2e3ff",
    100: "#d3b2ff",
    200: "#b57fff",
    300: "#974dff",
    400: "#791aff",
    500: "#6000e6",
    600: "#4a00b4",
    700: "#350082",
    800: "#200050",
    900: "#0d0020",
  },
  gray: {
    50: "#fafafa",
    100: "#f0f0f0",
    200: "#efefef",
    300: "#a6a6a6",
    400: "#adadad",
    500: "#afafaf",
    600: "#595959",
    700: "#404040",
    800: "#262626",
    900: "#0d0d0d",
  },
};
const radius = {
  none: "0",
  sm: "0.125rem",
  base: "0.625rem",
  md: "0.65rem",
  lg: "0.75rem",
  xl: "0.825rem",
  "2xl": "1rem",
  "3xl": "1.125rem",
  full: "9999px",
};
const theme = IS_SSR
  ? undefined
  : (extendTheme(
      <Partial<ChakraTheme>>{
        colors,
        radii: radius,
        components: {
          Button: {
            baseStyle: {
              lineHeight: 1,
              _focus: {
                outline: 0,
                boxShadow: "none",
              },
              _active: {
                scale: 0.95,
              },
            },
          },
          Checkbox: {
            baseStyle: {
              control: {
                borderRadius: 4,
                padding: ".425rem",
                _focus: {
                  outline: 4,
                  boxShadow: "outline",
                },
              },
              icon: {
                padding: 0,
                height: 2,
                width: 2,
              },
            },
          },
          Popover: {
            parts: ["content"],
            baseStyle: {
              content: {
                _focus: {
                  outline: 0,
                  boxShadow: "shadow",
                },
                shadow: "md",
              },
            },
          },
        },
      },
      withDefaultColorScheme({ colorScheme: "gray" }),
      withDefaultColorScheme({
        colorScheme: "brand",
        components: ["Checkbox", "FormControl", "Switch", "Input"],
      }),
      withDefaultProps({
        defaultProps: {
          variant: "ghost",
        },
        components: ["Button"],
      }),
      withDefaultProps({
        defaultProps: {
          size: "md",
        },
        components: ["FormControl", "Input"],
      })
    ) as ChakraTheme);
if (process.env.NODE_ENV !== "production") console.log(theme);
export { theme };
