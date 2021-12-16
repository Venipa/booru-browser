import { IS_SSR } from "@library/helper";
import { Fragment, PropsWithChildren } from "react";

export default function ({ children, predicate }: PropsWithChildren<any>) {
  if (IS_SSR || !predicate || !predicate()) return null;
  return <Fragment>{children}</Fragment>;
}
