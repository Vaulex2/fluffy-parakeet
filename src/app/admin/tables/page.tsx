import { getTables } from "@/lib/actions/admin/tables";
import TablesClient from "@/components/admin/TablesClient";

export default async function TablesPage() {
  const tables = await getTables();
  return <TablesClient initialTables={tables} />;
}
