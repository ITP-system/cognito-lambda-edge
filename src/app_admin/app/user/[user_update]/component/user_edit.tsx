"use client";

// server actions
import { userEditFormAction } from "@/components/common/formActions/userForm";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { redirect } from "next/navigation";

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

export default function EditUserForm({ username, email }: any) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      userCreateDate: "",
    },
  });

  const formActions = async (FormData: FormData) => {
    const email_update = FormData.get("userEmail");

    const res = await userEditFormAction(
      String(username),
      String(email_update),
    );

    if (res) {
      redirect("/user");
    } else {
      throw new Error(res);
    }
  };

  return (
    <div className="mt-[calc(var(--header-height)+2.25rem)] flex flex-col items-center">
      <div className="flex w-fit flex-col items-center rounded-md border border-gray-500 px-6 pb-12 pt-6">
        <h2 className="bold text-xl">ユーザー更新</h2>
        <div className="py-8">
          <p className="text-xs">
            <b className="text-sm text-red-500">*</b>
            マークのある項目は入力必須項目です。
          </p>
        </div>
        <Form {...form}>
          <form
            action={async (FormData: FormData) => {
              await formActions(FormData);
            }}
          >
            <span className="relative">
              ユーザー名：{username ? username : null}
            </span>
            <FormField
              control={form.control}
              name="userEmail"
              render={({ field }) => (
                <FormItem className="my-3 w-[100dvw] max-w-xs">
                  <FormLabel>
                    メールアドレス<b className="text-red-500">*</b>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="border-gray-500"
                      placeholder="例 : xxx@xxx.email"
                      required
                      {...field}
                    />
                  </FormControl>
                  <span className="text-sm text-gray-400">
                    現在のメールアドレス：{email ? email : null}
                  </span>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-8">
              <Button type="submit" className="w-full">
                更新
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
