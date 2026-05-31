import { getAllMenuItems, getCategories } from "@/lib/actions/menu";
import MenuClient from "@/components/admin/MenuClient";

export default async function AdminMenuPage() {
  const [items, categories] = await Promise.all([getAllMenuItems(), getCategories()]);
  return <MenuClient initialItems={items} categories={categories} />;
}
