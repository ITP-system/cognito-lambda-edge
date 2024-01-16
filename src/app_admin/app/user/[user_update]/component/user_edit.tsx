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
import { Checkbox } from "@/components/ui/checkbox";

type EditUserFormType = {
  username: string;
  email: string;
  usergroups: string[];
};

const formSchema = z.object({
  userEmail: z.string().min(2, {
    message: "userName must be at least 2 characters.",
  }),
  userGroup: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
});

export default function EditUserForm({
  username,
  email,
  usergroups,
}: EditUserFormType) {
  const [userEditError, setUserEditError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      userEmail: email,
      userGroup: usergroups,
    },
  });

  const userGroupItems = [
    {
      id: "Admins",
      label: "Admins",
    },
    {
      id: "Users",
      label: "Users",
    },
  ];

  const formActions = async (FormData: FormData) => {
    const res = await userEditFormAction(
      String(username),
      FormData,
      usergroups,
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

              <FormField
                control={form.control}
                name="userGroup"
                render={() => (
                  <FormItem>
                    <div className="my-3">
                      <FormLabel className="text-sm">
                        ユーザーグループ
                      </FormLabel>
                    </div>
                    {userGroupItems.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="userGroup"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  name="userGroup"
                                  value={item.id}
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id,
                                          ),
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
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
