import { getReservations } from "@/lib/actions/admin/reservations";
import { getTables } from "@/lib/actions/admin/tables";
import ReservationsClient from "@/components/admin/ReservationsClient";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const today = new Date().toISOString().split("T")[0];
  const raw = searchParams.date;
  const date = (Array.isArray(raw) ? raw[0] : raw) ?? today;

  const [reservations, tables] = await Promise.all([
    getReservations({ date }),
    getTables(),
  ]);

  return (
    <ReservationsClient
      reservations={reservations}
      tables={tables}
      selectedDate={date}
    />
  );
}
