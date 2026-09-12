import React, { useState } from "react";
import Title from "./Title";

const ReserveTable = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const whatsappMsg = `
🍽️ *Table Reservation Request*

👤 Name: ${form.name}
📞 Phone: ${form.phone}
📅 Date: ${form.date}
⏰ Time: ${form.time}
👥 Guests: ${form.guests}

📝 Note:
${form.message || "—"}
    `;

    const phoneNumber = "+917525899794"; // owner number
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      whatsappMsg
    )}`;

    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen border-t pt-10 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-10">
        <Title text1="RESERVE" text2="TABLE" />

        <p className="text-gray-500 mt-2 mb-8 text-sm">
          Fill the details below and confirm your reservation via WhatsApp.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              required
              name="name"
              placeholder="Your Name"
              className="input rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
              onChange={handleChange}
            />
            <input
              required
              name="phone"
              placeholder="Phone Number"
              className="input rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
              onChange={handleChange}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              required
              type="date"
              name="date"
              className="input rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
              onChange={handleChange}
            />
            <input
              required
              type="time"
              name="time"
              className="input rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
              onChange={handleChange}
            />
          </div>

          <input
            required
            type="number"
            name="guests"
            placeholder="Number of Guests"
            className="input rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
            onChange={handleChange}
          />

          <textarea
            name="message"
            placeholder="Any special request (optional)"
            rows="4"
            className="input resize-none rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 rounded-lg hover:from-orange-500 hover:to-orange-600 transition"
          >
            CONFIRM VIA WHATSAPP
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReserveTable;