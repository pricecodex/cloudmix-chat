import { useState } from "react";
import z, { ZodObject } from "zod";
import useApi, { SchemaErrors, UseApiProps } from "./use-api";

// TODO try catch for sendIfActive, stale connectionid

function useMutation<T extends ZodObject, R extends object = object>(props: UseApiProps<T>) {
  const { request } = useApi();
  const [formData, setFormData] = useState<z.infer<T>>(props.formData);
  const [errors, setErrors] = useState<SchemaErrors<T>>({});

  async function mutate() {
    const { errors = {}, result } = await request<T, R>({ ...props, formData });
    if (Object.keys(errors).length) {
      setErrors(errors);
      return { isValid: false, result: null };
    }

    return { isValid: true, result };
  }

  return {
    mutate,
    formData,
    errors,
    setFormData,
  };
}

export default useMutation;
