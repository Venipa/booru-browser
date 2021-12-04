import { classNames } from "@library/helper";
import {
  DetailedHTMLProps,
  DOMAttributes,
  InputHTMLAttributes,
  JSXElementConstructor,
  ReactElement,
} from "react";

type Props = {
  label?: string;
  isError?: boolean;
  suffix?: ReactElement;
  prefix?: ReactElement;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export default function ({ label, isError, ...props }: Props) {
  return (
    <div
      className={classNames(
        isError
          ? "border-red-600 focus-within:ring-red-600 focus-within:border-red-600"
          : "border-gray-300 focus-within:ring-indigo-600 focus-within:border-indigo-600",
        "border rounded-md px-3 py-2 shadow-sm focus-within:ring-1",
        props.className
      )}>
      {label && (
        <label
          htmlFor={props.id}
          className={classNames(
            isError ? "text-red-500" : null,
            "block text-xs text-left font-medium text-gray-900 select-none"
          )}>
          {label}
        </label>
      )}

      <div className="flex flex-row flex-1">
        {props.prefix}
        <input
          type="text"
          {...props}
          className={classNames(
            isError ? "text-red-600" : "text-gray-900",
            "block w-full border-0 p-0 placeholder-gray-500 focus:ring-0 sm:text-sm",
            props.className
          )}
        />
        {props.suffix}
      </div>
    </div>
  );
}
