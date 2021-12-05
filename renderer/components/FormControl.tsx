import { classNames } from "@library/helper";
import {
  DetailedHTMLProps,
  DOMAttributes,
  InputHTMLAttributes,
  JSXElementConstructor,
  ReactElement,
  useEffect,
  useState,
} from "react";

type Props = {
  label?: string;
  isError?: boolean;
  suffix?: ReactElement;
  prefix?: ReactElement;
} & DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
    value?: any;
  };

function CheckBox({ value, onChange, ...props }: Props) {
  return (
    <div
      className={classNames(
        props.disabled ? "cursor-default" : "cursor-pointer",
        "select-none",
        props.className
      )}>
      <span>{value ? "Enabled" : "Disabled"}</span>
      <input
        value={value as any}
        onChange={onChange}
        {...props}
        className=""
        type="hidden"
      />
    </div>
  );
}
export default function ({
  label,
  isError,
  value,
  onChange,
  children,
  ...props
}: Props) {
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
            "block text-xs text-left font-medium text-gray-900 select-none",
            props.type === "checkbox" ? "cursor-pointer" : null
          )}>
          {label}
        </label>
      )}

      <div className="flex flex-row flex-1">
        {props.prefix}
        {props.type === "checkbox" ? (
          <div>
            <label className="inline-flex items-center mt-3">
              <CheckBox
                {...props}
                value={value as any}
                onChange={onChange}
                className={classNames(
                  isError ? "text-red-600" : "text-gray-900",
                  "sm:text-sm",
                  props.className
                )}
              />
              {children && (
                <span className="ml-2 text-gray-700">{children}</span>
              )}
            </label>
          </div>
        ) : (
          <input
            type="text"
            {...props}
            value={value}
            onChange={onChange}
            className={classNames(
              isError ? "text-red-600" : "text-gray-900",
              "block w-full border-0 p-0 placeholder-gray-500 focus:ring-0 sm:text-sm",
              props.className
            )}
          />
        )}
        {props.suffix}
      </div>
    </div>
  );
}
