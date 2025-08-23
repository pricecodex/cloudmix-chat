import z, { ZodObject } from "zod";
import useSession from "./use-session";
import { toast } from "sonner";

export type UseApiPropsWithSchema<T extends ZodObject> = {
  schema: T;
  formData: z.infer<T>;
  path: string;
};

export type UseApiProps<T extends ZodObject | undefined> = T extends ZodObject
  ? UseApiPropsWithSchema<T>
  : { path: string };

export type SchemaErrorsWithSchema<T extends ZodObject> = Partial<Record<keyof z.infer<T>, string>>;

export type SchemaErrors<T extends ZodObject | undefined> = T extends ZodObject ? SchemaErrorsWithSchema<T> : object;

function useApi() {
  const { get } = useSession();

  async function request<R extends object, T extends ZodObject | undefined = undefined>(props: UseApiProps<T>) {
    if ("schema" in props) {
      const result = props.schema.safeParse(props.formData);
      if (!result.success) {
        const formErrors: SchemaErrors<T> = {} as SchemaErrors<T>;
        result.error.issues.forEach((err) => {
          const [fieldName] = err.path as [keyof SchemaErrors<T>];
          // @ts-expect-error # will work just fine
          formErrors[fieldName] = err.message;
        });
        return { errors: formErrors, result: null };
      }
    }
    const sessionData = get() ?? {};

    const requestData = "formData" in props ? { ...sessionData, ...props.formData } : sessionData;
    const res = await fetch(props.path, {
      method: "POST",
      body: JSON.stringify(requestData),
    });

    if (res.ok) {
      const { data } = await res.json();

      return { result: data as R };
    } else {
      const { error } = await res.json();
      toast.error(error);
      return { result: null };
    }
  }

  return { request };
}

export default useApi;
