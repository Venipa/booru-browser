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
import { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

const schema = yup
  .object({
    autoUpdate: yup.boolean(),
  })
  .required();
export default function () {
  const settings = useObservable(
    () => settingsQuery.select(),
    settingsQuery.getValue()
  );
  const { control, handleSubmit, setValue, getValues, formState, watch } =
    useForm({
      defaultValues: {
        autoUpdate: settings.autoUpdate,
      },
      resolver: yupResolver(schema),
      reValidateMode: "onBlur",
      mode: "onBlur",
    });
  const { errors, isValid, isDirty, isValidating } = formState;
  const onSubmit = (data: typeof schema.__inputType) => {
    settingsStore.update((state) => {
      if (data.autoUpdate !== state.autoUpdate)
        state.autoUpdate = !!data.autoUpdate;
    });
  };
  const [values, setValues] = useState(getValues());
  watch(debounce((value) => setValues(value as any)));
  useEffect(() => {
    if (isValid) onSubmit(values as any);
  }, [values]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} onChange={(ev) => console.log(ev)}>
      <Controller
        name="autoUpdate"
        control={control}
        render={({ field }) => (
          <div
            onClick={(ev) => {
              ev.preventDefault();
              setValue(field.name, !field.value);
            }}
            className="cursor-pointer">
            <FormControl
              {...field}
              id={field.name}
              value={field.value as any}
              label="Auto Update"
              isError={!!errors[field.name]}
              className="cursor-pointer"
              type="checkbox"
            />
            <FormError className="ml-3 mt-1" error={errors[field.name]} />
          </div>
        )}
      />
    </form>
  );
}
