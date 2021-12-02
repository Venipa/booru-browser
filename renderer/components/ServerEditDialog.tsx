import { Dialog, Portal, Transition } from "@headlessui/react";
import React, {
  Attributes,
  DOMAttributes,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { serverQuery, ServerType } from "renderer/stores/server";
import { of } from "rxjs";
import { useObservable } from "rxjs-hooks";
type Props = {
  trigger: React.ReactElement;
  server: ServerType;
  disabled?: boolean;
} & DOMAttributes<HTMLButtonElement | HTMLInputElement>;
export default function ({ trigger: Trigger, server, ...props }: Props) {
  let [isOpen, setIsOpen] = useState(false);
  function closeModal() {
    setIsOpen(false);
  }
  const ButtonWrapper = React.cloneElement(Trigger, {
    onClick: function (ev: MouseEvent) {
      if (server) setIsOpen(!isOpen);
      Trigger.props.onClick?.(ev);
    },
  });
  return (
    <>
      {ButtonWrapper}
      <Portal>
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={closeModal}>
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0">
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40" />
              </Transition.Child>

              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true">
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95">
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl h-96 rounded-xl">
                  <div className="h-full flex flex-col flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 -mt-2 mb-2 text-gray-900">
                      Server
                    </Dialog.Title>
                    <form className="mt-2 flex flex-col flex-1">
                      <div className="flex flex-col space-y-3">
                        <input type="text" value={server.name} />
                        <input type="text" value={server.url} />
                      </div>
                      <div className="flex-1"></div>
                      <div className="">
                        <button
                          type="button"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                          onClick={closeModal}>
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </Portal>
    </>
  );
}
