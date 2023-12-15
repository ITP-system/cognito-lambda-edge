"use client";
import { userCreateFormAction } from "@/components/common/formActions/userForm";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  userName: z.string().min(2, {
    message: "userName must be at least 2 characters.",
  }),
  userEmail: z.string().min(2, {
    message: "userName must be at least 2 characters.",
  }),
  userCreateDate: z.string().min(2, {
    message: "userName must be at least 2 characters.",
  }),
});

export default function CreateUserForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      userCreateDate: "",
    },
  });

  return (
    <div className="mt-[calc(var(--header-height)+2.25rem)] flex flex-col items-center">
      <div>
        <span>
          <b className="text-red-500">*</b>マークのある項目は入力必須項目です。
        </span>
        <Form {...form}>
          <form
            action={async (FormData) => {
              await userCreateFormAction(FormData);
            }}
            className="space-y-3"
          >
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem className="max-w-xs w-[100dvw]">
                  <FormLabel>
                    userName<b className="text-red-500">*</b>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="username" required {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userEmail"
              render={({ field }) => (
                <FormItem className="max-w-xs w-[100dvw]">
                  <FormLabel>
                    userEmail<b className="text-red-500">*</b>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="xxx@xxx.email" required {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userCreateDate"
              render={({ field }) => (
                <FormItem className="max-w-xs w-[100dvw]">
                  <FormLabel>userCreateDate</FormLabel>
                  <FormControl>
                    <Input placeholder="last modify" {...field} />
                  </FormControl>
                  <FormDescription>last modify </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="float-right">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
