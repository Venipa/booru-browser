import { createContext, JSXElementConstructor, ReactElement } from "react";
export type DialogContextType = {
  component: ReactElement | JSXElementConstructor<any> | null;
  props: { [key: string]: any };
  show: <T>(component: ReactElement<T> | JSXElementConstructor<T>, props: T & { [key: string]: any }) => void;
  hide: () => void;
};
const DialogContext = createContext<DialogContextType>({
  component: null,
  props: {},
  show: () => {},
  hide: () => {},
});

const DialogConsumer = DialogContext.Consumer;
export { DialogContext, DialogConsumer };
