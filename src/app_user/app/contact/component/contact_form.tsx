"use client";

// shadcn ui
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// server action
import { submitContactForm } from "@/components/common/formActions/contactForm";

export default function ProfileForm() {
  const formActions = async (FormData: FormData) => {
    const res = await submitContactForm(FormData);
    if (res) {
      console.log("送信完了");
      document.contactform.reset();
    }
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
            マークのある項目は入力必須となっております。
          </p>
        </div>

        <form
          name="contactform"
          action={async (FormData: FormData) => {
            await formActions(FormData);
          }}
        >
          <div className="py-3">
            <Label htmlFor="address">mail address</Label>
            <b className="text-sm text-red-500">*</b>
            <Input required name="address" placeholder="exam@example.com" />
          </div>
          <div className="py-3">
            <Label htmlFor="title">title</Label>{" "}
            <b className="text-sm text-red-500">*</b>
            <Input required name="title" placeholder="title" />
          </div>
          <div className="py-3">
            <Label htmlFor="text">text</Label>{" "}
            <b className="text-sm text-red-500">*</b>
            <Textarea required name="text" placeholder="text" />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5 py-3">
            <Label htmlFor="file">ファイルを添付する</Label>
            <Input
              name="file"
              accept=".jpg, .jpeg, .png, .svg, .gif, .mp4"
              type="file"
            />
          </div>
          <div className="mt-8">
            <Button type="submit" className="">
              submit
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
