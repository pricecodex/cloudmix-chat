import { ApiRoute } from "@/types/route";
import { useState } from "react";
import z, { ZodObject } from "zod";
import useSession from "./use-session";

type Props<T extends ZodObject> = {
  schema: T;
  formData: z.infer<T>;
  path: ApiRoute;
};

type SchemaErrors<T extends ZodObject> = Partial<Record<keyof z.infer<T>, string>>;

function useMutation<R extends object, T extends ZodObject>(props: Props<T>) {
  // const { showError } = useToast()
  const { get } = useSession();
  const [formData, setFormData] = useState<z.infer<T>>(props.formData);
  const [errors, setErrors] = useState<SchemaErrors<T>>({});

  async function mutate() {
    const result = props.schema.safeParse(formData);
    if (!result.success) {
      const formErrors: SchemaErrors<T> = {};
      result.error.issues.forEach((err) => {
        const [fieldName] = err.path;
        formErrors[fieldName as keyof SchemaErrors<T>] = err.message;
      });
      setErrors(formErrors);
      return { isValid: false, result: null };
    }
    const activeSession = get() ?? {};

    const res = await fetch(props.path, {
      method: "POST",
      body: JSON.stringify({ ...formData, ...activeSession }),
    });

    if (res.ok) {
      const { data } = await res.json();

      return { isValid: true, result: data as R };
    } else {
      const { error } = await res.json();
      // TODO uncomment when ready
      // showError(error)
      return { isValid: true, result: null };
    }
  }

  return {
    mutate,
    formData,
    errors,
    setFormData,
  };
}

export default useMutation;
