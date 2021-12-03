import { classNames } from "@library/helper";
import { FieldError } from "react-hook-form";

interface Props {
  error?: FieldError;
  className?: string;
}
export default function ({ error, ...props }: Props) {
  if (!error?.message) return null;
  return (
    <div
      {...props}
      className={classNames("text-red-600 text-xs font-semibold", props.className)}>
      {error.message}
    </div>
  );
}
