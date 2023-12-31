"use client";

// next.js
import { redirect } from "next/navigation";
import { useState } from "react";

// server actions
import { userEditFormAction } from "@/components/common/formActions/userForm";

// form library
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// shadcn
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

const formSchema = z.object({
  userEmail: z.string().min(2, {
    message: "userName must be at least 2 characters.",
  }),
  groupItems: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
});

export default function EditUserForm({ username, email }: any) {
  const [userEditError, setUserEditError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userEmail: email,
    },
  });

  const formActions = async (FormData: FormData) => {
    const email_update = FormData.get("userEmail");

    const res = await userEditFormAction(
      String(username),
      String(email_update),
    );

    if (res.success === true) {
      redirect("/user");
    } else {
      setUserEditError(res.error);
    }
  };

  return (
    <div className="mt-[calc(var(--header-height)+2.25rem)] flex flex-col items-center">
      <div className="w-min break-all rounded-md border border-gray-500 px-6 pb-12 pt-6 text-sm">
        <div className="flex w-fit flex-col items-center">
          <h2 className="bold text-xl">ユーザー更新</h2>
          <div className="py-8">
            <p className="text-xs">
              <b className="text-red-500">*</b>
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
                    <span className="text-gray-400">
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
        {userEditError ? (
          <p className="relative left-0 mt-2 text-sm text-red-500">
            {userEditError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
