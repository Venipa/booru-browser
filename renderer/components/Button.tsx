import { classNames } from "@library/helper";
import { LinkProps } from "next/link";
import React, { DOMAttributes, PropsWithChildren } from "react";
import Link from "next/link";
type Props = {
  className?: string;
  type?: string;
  target?: "_blank" | string;
} & Partial<LinkProps> &
  DOMAttributes<HTMLButtonElement> &
  DOMAttributes<HTMLFormElement>;
function ButtonBase({ children, ...props }: PropsWithChildren<Props>) {
  return React.createElement(
    props.href ? "a" : "button",
    {
      ...props,
      className: classNames(
        props.href ? "flex-inline" : "flex",
        "button flex-row items-center",
        props.className
      ),
    },
    children
  );
}
export default function ({ children, ...props }: PropsWithChildren<Props>) {
  if (props.href) {
    return (
      <Link href={props.href}>
        <ButtonBase {...props}>{children}</ButtonBase>
      </Link>
    );
  }
  return <ButtonBase {...props}>{children}</ButtonBase>;
}
