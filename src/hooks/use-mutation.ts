import { useState } from "react";
import z, { ZodObject } from "zod";
import useApi, { SchemaErrorsWithSchema, UseApiProps, UseApiPropsWithSchema } from "./use-api";

function useMutation<T extends ZodObject, R extends object = object>(props: UseApiPropsWithSchema<T>) {
  const { request } = useApi();
  const [formData, setFormData] = useState<z.infer<T>>(props.formData);
  const [errors, setErrors] = useState<SchemaErrorsWithSchema<T>>({});

  async function mutate() {
    const { errors = {}, result } = await request<R, T>({
      path: props.path,
      schema: props.schema,
      formData,
    } as UseApiProps<T>);
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
