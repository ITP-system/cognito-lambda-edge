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

export default function EditUserForm({ username, email, data }: any) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      userEmail: "",
      userCreateDate: "",
    },
  });

  const formActions = async (FormData: FormData) => {
    const username = FormData.get("userName");
    const email = FormData.get("userEmail");

    await userEditFormAction(String(username), String(email));

    // redirect("/user");
  };

  return (
    <div className="mt-[calc(var(--header-height)+2.25rem)] flex flex-col items-center">
      <div className="border w-fit px-6 pt-6 pb-12 rounded-md border-gray-500 flex flex-col items-center">
        <h2 className="bold text-xl">ユーザー編集</h2>
        <div className="py-8">
          <p className="text-xs">
            <b className="text-red-500 text-sm">*</b>
            マークのある項目は入力必須項目です。
          </p>
        </div>
        <Form {...form}>
          <form
            action={async (FormData: FormData) => {
              await formActions(FormData);
            }}
          >
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem className="my-3 max-w-xs w-[100dvw]">
                  <FormLabel>
                    ユーザー名<b className="text-red-500">*</b>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="border-gray-500"
                      placeholder="例 : 苗字 名前"
                      required
                      {...field}
                    />
                  </FormControl>
                  <span className="text-gray-400 text-sm">
                    現在のユーザー名：{username ? username : null}
                  </span>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userEmail"
              render={({ field }) => (
                <FormItem className="my-3 max-w-xs w-[100dvw]">
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
                  <span className="text-gray-400 text-sm">
                    現在のメールアドレス：{email ? email : null}
                  </span>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-8">
              <Button type="submit" className="w-full">
                作成
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
