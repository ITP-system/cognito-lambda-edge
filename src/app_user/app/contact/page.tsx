import { Metadata } from "next";
import React from "react";

import ContactForm from "./component/contact_form";

export const metadata: Metadata = {
  title: "お問い合わせフォーム",
  description:
    "〇〇のお問い合わせページです。ご意見、ご要望等ございましたら、本ページのフォームにて、必要事項をご入力の上、お送りくださいますようお願いします。",
};

const Contact = () => {
  return (
    <div>
      <ContactForm />
    </div>
  );
};

export default Contact;
