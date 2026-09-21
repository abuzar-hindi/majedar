import ReserveTable from "../../components/ReserveTable";

export const metadata = {
  title: "Reserve a Table | Dine-in in Ayodhya",
  description:
    "Reserve your dining table at Majedaar Restaurant in Ayodhya. Book comfortable seating for family, friends, or gatherings with fast WhatsApp reservation.",
  alternates: {
    canonical: "/reserve-table",
  },
  openGraph: {
    title: "Reserve a Table | Majedaar Restaurant Ayodhya",
    description:
      "Book your dine-in table at Majedaar Restaurant in Ayodhya. Enjoy authentic Indian cuisine in a warm, welcoming ambiance.",
    url: "/reserve-table",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reserve a Table | Majedaar Restaurant Ayodhya",
    description:
      "Book your dine-in table at Majedaar Restaurant in Ayodhya. Enjoy authentic Indian cuisine in a warm, welcoming ambiance.",
  },
};

export default function ReserveTablePage() {
  return <ReserveTable />;
}
