import Button from "@/components/Button";
import FormError from "@/components/FormError";
import FormControl from "@/components/FormControl";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { settingsQuery, settingsStore } from "renderer/stores/settings";
import { access } from "fs/promises";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { useObservable } from "rxjs-hooks";
import { HiFolder, HiSave, HiSaveAs, HiSelector } from "react-icons/hi";
import { dialog } from "electron";
import { ipcRenderer } from "electron";
import { useEffect } from "react";

const schema = yup
  .object({
    path: yup
      .string()
      .required()
      .test(
        "path-exits",
        "Path must be valid and exist",
        (v) =>
          new Promise((resolve) =>
            resolve(
              (v && v === settingsStore.getValue().downloadPath) ||
                access(v!)
                  .then(() => true)
                  .catch(() => false)
            )
          )
      ),
  })
  .required();
export default function () {
  const settings = useObservable(
    () => settingsQuery.select(),
    settingsQuery.getValue()
  );
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm({
    defaultValues: {
      path: settings.downloadPath,
    },
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
    criteriaMode: "firstError",
  });
  useEffect(() => {
    handleSubmit((...args) => console.log(...args));
  });
  const onSubmit = (data: typeof schema.__inputType) => {
    settingsStore.update((state) => {
      if (data.path) state.downloadPath = data.path;
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="path"
        control={control}
        render={({ field }) => (
          <div
            className="cursor-pointer"
            onClick={() =>
              ipcRenderer.invoke("api/dir:select").then((x) => {
                if (x) {
                  setValue("path", x);
                }
              })
            }>
            <FormControl
              {...field}
              id={field.name}
              label="Download Path"
              isError={!!errors[field.name]}
              suffix={<HiFolder className="w-6 h-6 -mt-2" />}
              className="select-none pointer-events-none"
            />
            <FormError className="ml-3 mt-1" error={errors[field.name]} />
          </div>
        )}
      />
      <Button type="submit" className="mt-8" disabled={isDirty && !isValid}>
        Save Changes
      </Button>
    </form>
  );
}
