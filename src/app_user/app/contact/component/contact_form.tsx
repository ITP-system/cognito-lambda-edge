"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// shadcn ui
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  text: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  file: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function InputFile() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </div>
  );
}

export default function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      text: "",
      file: "",
    },
  });

  const formActions = async (FormData: FormData) => {
    console.log("FormData");
    console.log(FormData);
  };

  return (
    <>
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            お問い合わせフォーム
          </h2>
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="py-2">
                  <FormLabel>title</FormLabel>{" "}
                  <b className="text-sm text-red-500">*</b>
                  <FormControl>
                    <Input placeholder="title" {...field} />
                  </FormControl>
                  <FormDescription>title description</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="py-2">
                  <FormLabel>text</FormLabel>{" "}
                  <b className="text-sm text-red-500">*</b>
                  <FormControl>
                    <Textarea placeholder="text" {...field} />
                  </FormControl>
                  <FormDescription>text description</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="py-2">
                  <FormLabel>file upload</FormLabel>
                  <FormControl>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      {/* <Label htmlFor="picture">ファイルを添付する</Label> */}
                      <Input id="picture" type="file" multiple {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>.json file upload</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-8">
              <Button type="submit" className="">
                submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
