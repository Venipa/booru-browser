import {
  DialogConsumer,
  DialogContext,
  DialogContextType,
} from "@library/modal";
import { PropsWithChildren, ReactElement, JSXElementConstructor, useState } from "react";

interface Props {}
interface DialogProps {
  onRequestClose?: () => void;
  [key: string]: any;
}
function DialogProvider({ children, ...args }: PropsWithChildren<Props>) {
  const show = <T extends {}>(
    component: ReactElement<T> | JSXElementConstructor<T>,
    props: T & { [key: string]: any } = {} as any
  ) => {
    setState((s) => ({
      ...s,
      component,
      props,
    }));
  };

  const hide = () => {
    setState((s) => ({
      ...s,
      component: null,
      props: {},
    }));
  };
  const [state, setState] = useState<DialogContextType>({
    component: null,
    props: {},
    show,
    hide,
  });
  return (
    <DialogContext.Provider value={state}>{children}</DialogContext.Provider>
  );
}
const DialogRoot = () => (
  <DialogConsumer>
    {({ component: Component, props, hide }) =>
      Component ? <Component {...props} onRequestClose={hide} /> : null
    }
  </DialogConsumer>
);

export { DialogProvider, DialogRoot, DialogProps };
