import Button from "@/components/Button";
import FormError from "@/components/FormError";
import FormControl from "@/components/FormControl";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { settingsQuery, settingsStore } from "renderer/stores/settings";
import { access } from "fs/promises";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { useEventCallback, useObservable } from "rxjs-hooks";
import { HiFolder, HiSave, HiSaveAs, HiSelector } from "react-icons/hi";
import { dialog } from "electron";
import { ipcRenderer } from "electron";
import { useEffect } from "react";
import { distinctUntilChangedJson } from "@library/helper";
import { Observable } from "rxjs";

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
    getValues,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    defaultValues: {
      path: settings.downloadPath,
    },
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
    criteriaMode: "firstError",
  });
  const onSubmit = (data: typeof schema.__inputType) => {
    settingsStore.update((state) => {
      if (data.path) state.downloadPath = data.path;
    });
  };
  const [submitCallback, newValues] = useEventCallback(
    (_value: Observable<typeof schema.__inputType>) =>
      _value.pipe(distinctUntilChangedJson()),
    getValues()
  );
  watch((value) => submitCallback(value as any));
  useEffect(() => {
    onSubmit(newValues);
  }, [newValues]);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
    </form>
  );
}
