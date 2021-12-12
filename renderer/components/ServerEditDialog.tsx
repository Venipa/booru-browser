import Button from "@/components/Button";
import { DialogProps } from "@/components/Dialog";
import FormControl from "@/components/FormControl";
import FormError from "@/components/FormError";
import SelectServerBox from "@/components/SelectServerBox";
import { Checkbox, Switch } from "@chakra-ui/react";
import { Dialog, Transition } from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { testUniqueServer } from "@library/helper";
import React, {
  Attributes,
  DOMAttributes,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  EndpointType,
  serverQuery,
  serverStore,
  ServerType,
} from "renderer/stores/server";
import * as yup from "yup";

type Props = {
  server: ServerType;
  disabled?: boolean;
} & DialogProps;

const schema = (server: ServerType) =>
  yup
    .object({
      name: yup
        .string()
        .required()
        .test(
          "unique-server",
          "Server Name must be unique",
          (v) => v === server.name || testUniqueServer(v!)
        ),
      url: yup.string().url().required(),
      type: yup
        .mixed()
        .required()
        .test("type", "Booru Type is required", (v) => {
          return !Object.keys(EndpointType).find((x) => x === v);
        }),
      username: yup.string().optional(),
      password: yup.string().when("username", {
        is: (x?: string) => x && x.length > 0,
        then: yup.string().required("Auth needs requires username & password"),
      }),
    })
    .required();

export default function ({ onRequestClose, server }: Props) {
  let [isOpen, setIsOpen] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: server.name,
      url: server.url,
      type: server.meta?.type,
      username: server.auth?.login,
      password: server.auth?.pass,
    },
    resolver: yupResolver(schema(server)),
  });
  const [authEnabled, setAuthEnabled] = useState(!!server.auth?.login);
  const removeServer = () => {
    serverStore.remove((x) => x.name === server.name);
    closeModal();
  };
  const onSubmit = ({ name, url, type, username, password }: any) => {
    const wasActive = serverQuery.getActiveId() === server.name;
    serverStore.upsert(
      server.name,
      Object.assign(
        { ...server },
        { name, url },
        {
          meta: { ...server.meta, type: type, added: new Date().toISOString() },
        },
        username ? { auth: { login: username, pass: password } } : {}
      )
    );
    if (wasActive) serverStore.setActive(server.name);

    closeModal();
  };
  function closeModal() {
    setIsOpen(false);
    setTimeout(() => {
      onRequestClose?.();
    }, 100);
  }
  return (
    <>
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
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
                <div className="h-full flex flex-col flex-1">
                  <form
                    className="-mt-1 flex flex-col flex-1"
                    onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col space-y-8 divide-y divide-gray-200">
                      <div className="space-y-8 divide-y divide-gray-200">
                        <div>
                          <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              Server
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Needed information to access booru
                            </p>
                          </div>

                          <div className="mt-6 flex flex-col space-y-6">
                            <Controller
                              name="name"
                              control={control}
                              render={({ field }) => (
                                <div>
                                  <FormControl
                                    {...field}
                                    id={field.name}
                                    label="Server Name"
                                    isError={!!errors[field.name]}
                                  />
                                  <FormError
                                    className="ml-3 mt-1"
                                    error={errors[field.name]}
                                  />
                                </div>
                              )}
                            />
                            <Controller
                              name="url"
                              control={control}
                              render={({ field }) => (
                                <div>
                                  <FormControl
                                    {...field}
                                    id={field.name}
                                    label="Server Url"
                                    isError={!!errors[field.name]}
                                  />
                                  <FormError
                                    className="ml-3 mt-1"
                                    error={errors[field.name]}
                                  />
                                </div>
                              )}
                            />
                            <Controller
                              name="type"
                              control={control}
                              render={({ field }) => (
                                <SelectServerBox
                                  {...field}
                                  isError={!!errors[field.name]}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="mt-6">
                            <div
                              className="flex items-center cursor-pointer mb-2 space-x-2"
                              onClick={() => setAuthEnabled(!authEnabled)}>
                              <Switch
                                isChecked={authEnabled}
                                className="cursor-pointer mt-0.5"></Switch>
                              <h3 className="text-lg leading-none font-medium text-gray-900">
                                Auth
                              </h3>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              Some booru websites need authentication to access
                              features or posts in general
                            </p>
                          </div>

                          <div className="mt-6 flex flex-col space-y-6">
                            {authEnabled && (
                              <>
                                <Controller
                                  name="username"
                                  control={control}
                                  render={({ field }) => (
                                    <div>
                                      <FormControl
                                        {...field}
                                        id={field.name}
                                        label="Username"
                                        isError={!!errors[field.name]}
                                      />
                                      <FormError
                                        className="ml-3 mt-1"
                                        error={errors[field.name]}
                                      />
                                    </div>
                                  )}
                                />
                                <Controller
                                  name="password"
                                  control={control}
                                  render={({ field }) => (
                                    <div>
                                      <FormControl
                                        {...field}
                                        id={field.name}
                                        label="Password"
                                        isError={!!errors[field.name]}
                                      />
                                      <FormError
                                        className="ml-3 mt-1"
                                        error={errors[field.name]}
                                      />
                                    </div>
                                  )}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1"></div>
                    <div className="mt-6 flex items-center">
                      <Button type="submit">Save Changes</Button>
                      <div className="flex-1"></div>
                      <Button
                        onClick={(ev) => {
                          ev.preventDefault();
                          removeServer();
                        }}
                        className="button-danger">
                        Delete
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
