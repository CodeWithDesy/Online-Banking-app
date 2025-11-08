import Contact from "../model/contact.model.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    await resend.emails.send({
      from: "Linz American Bank <onboarding@resend.dev>",
      to: process.env.EMAIL_RECEIVER,
      subject,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("Resend error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
    });
  }
};

const fetchMessage = async (req, res) => {
  try {
    const messages = await Contact.find({});
    res.status(200).json({
      success: true,
      message: "Messages fetched successfully!",
      data: messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export { sendMessage, fetchMessage };
