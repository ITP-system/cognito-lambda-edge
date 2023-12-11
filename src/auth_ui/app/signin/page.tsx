"use client";

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

import { Amplify } from "aws-amplify";
import awsExports from "../../src/aws-exports";
import { signIn, type SignInInput } from "aws-amplify/auth";

Amplify.configure({
  ...awsExports,
  //  authenticationFlowType: "CUSTOM_AUTH",
  // cookieStorage: {
  //   domain: process.env.CLOUD_FRONT_DOMAIN,
  //   path: "/",
  //   expires: 365,
  //   secure: true,
  // },
});

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export default function SigninForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const username = values.username;
    const password = values.password;
    await signIn({ username, password }).then(async (challenge) => {
      console.log(challenge);
      window.location.href = "/";
      // if (challenge.challengeName === "CUSTOM_CHALLENGE") {
      //   await Auth.sendCustomChallengeAnswer(challenge, "kawa").then((user) => {
      //     console.log(user);
      //   });
      // }
    });
  }
  return (
    <div className="mt-10 flex justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="border-gray w-96 space-y-3 border border-gray-400 p-8 shadow-md"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4">
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
