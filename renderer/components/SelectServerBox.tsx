import {
  useState,
  Fragment,
  DetailedHTMLProps,
  InputHTMLAttributes,
  useEffect,
} from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/solid";
import { EndpointList, EndpointType } from "renderer/stores/server";
import FormControl from "./FormControl";
import { classNames } from "@library/helper";
import { HiCheck } from "react-icons/hi";
interface ServerView {
  id: string;
  name: string;
}
const servers = Object.entries(EndpointList).map(([key, name]) => {
  return { id: key, name } as ServerView;
});
type Props = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  onChange: <T = any>(val: T) => void;
  value?: EndpointType;
  isError?: boolean;
};
export default function ServerListBox({
  onChange,
  value,
  onBlur,
  isError,
}: Props) {
  const [selected, setSelected] = useState<ServerView>();
  useEffect(() => {
    // @ts-ignore
    setSelected(servers.find((x) => EndpointType[x.id] === value));
  }, [value]);
  return (
    <Listbox
      as="div"
      className="relative z-10"
      value={selected}
      onChange={(x: any) =>
        onChange<EndpointType>(EndpointType[x.id as keyof typeof EndpointType])
      }>
      {({ open }) => (
        <>
          <div className="relative mt-1">
            <Listbox.Button className="w-full">
              <FormControl
                label="Server Type"
                value={selected?.name}
                className={classNames(
                  "cursor-pointer select-none pointer-events-none"
                )}
                isError={isError}
              />
            </Listbox.Button>
            <>
              <Transition
                as={Fragment}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0">
                <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {servers.map((s) => (
                    /* Use the `active` state to conditionally style the active option. */
                    /* Use the `selected` state to conditionally style the selected option. */
                    <Listbox.Option
                      key={s.id}
                      value={s}
                      className={({ selected, active }) =>
                        classNames(
                          selected
                            ? "cursor-default text-purple-900 bg-purple-100"
                            : active
                            ? "bg-gray-100"
                            : null,
                          "cursor-pointer text-gray-900",
                          `select-none relative py-2 pl-10 pr-4`
                        )
                      }>
                      {({ selected, active }) => (
                        <>
                          <span
                            className={classNames(
                              selected ? "font-medium" : "font-normal",
                              "block truncate"
                            )}>
                            {s.name}
                          </span>
                          {selected && (
                            <span
                              className={classNames(
                                "absolute inset-y-0 left-0 flex items-center pl-3"
                              )}>
                              <HiCheck className="w-5 h-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </>
          </div>
        </>
      )}
    </Listbox>
  );
}
