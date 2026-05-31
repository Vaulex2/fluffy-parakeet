"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTable, updateTable, toggleTableActive } from "@/lib/actions/admin/tables";
import type { RestaurantTable } from "@/types/database";

export default function TablesClient({ initialTables }: { initialTables: RestaurantTable[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addForm, setAddForm] = useState({ table_number: "", seat_count: "2", description: "" });
  const [editModal, setEditModal] = useState<RestaurantTable | null>(null);
  const [editForm, setEditForm] = useState({ table_number: "", seat_count: "", description: "" });

  function openEdit(t: RestaurantTable) {
    setEditModal(t);
    setEditForm({
      table_number: String(t.table_number),
      seat_count: String(t.seat_count),
      description: t.description ?? "",
    });
  }

  function doToggle(id: string, active: boolean) {
    startTransition(async () => {
      await toggleTableActive(id, !active);
      router.refresh();
    });
  }

  function doAdd() {
    if (!addForm.table_number || !addForm.seat_count) return;
    startTransition(async () => {
      await createTable({
        table_number: Number(addForm.table_number),
        seat_count: Number(addForm.seat_count),
        table_type: "indoor",
        is_available: true,
        description: addForm.description || null,
      });
      setAddForm({ table_number: "", seat_count: "2", description: "" });
      router.refresh();
    });
  }

  function doUpdate() {
    if (!editModal || !editForm.table_number || !editForm.seat_count) return;
    startTransition(async () => {
      await updateTable(editModal.id, {
        table_number: Number(editForm.table_number),
        seat_count: Number(editForm.seat_count),
        description: editForm.description || null,
      });
      setEditModal(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-4xl text-text-primary tracking-tight">TABLES</h1>
        <p className="text-text-muted font-body text-sm">
          {initialTables.filter((t) => t.is_available).length} active
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {initialTables.map((table) => (
          <div
            key={table.id}
            className={`bg-surface border rounded-xl p-5 space-y-3 ${
              table.is_available ? "border-surface-border" : "border-surface-border opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="font-headline text-5xl text-text-primary tracking-tight">
                {String(table.table_number).padStart(2, "0")}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  onClick={() => openEdit(table)}
                  className="w-7 h-7 rounded-lg border border-surface-border flex items-center justify-center hover:border-primary/40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px] text-text-muted">edit</span>
                </button>
                <button
                  onClick={() => doToggle(table.id, table.is_available)}
                  disabled={isPending}
                  className={`relative w-10 h-5 rounded-full transition-colors overflow-hidden disabled:opacity-40 ${
                    table.is_available ? "bg-green-500" : "bg-surface-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      table.is_available ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted font-body text-sm">
                <span className="material-symbols-outlined text-[14px]">person</span>
                {table.seat_count} guests
              </div>
              {table.description && (
                <p className="text-text-muted font-body text-xs">{table.description}</p>
              )}
            </div>

            <p className={`text-xs font-body font-semibold ${table.is_available ? "text-green-400" : "text-text-muted"}`}>
              {table.is_available ? "ACTIVE" : "INACTIVE"}
            </p>
          </div>
        ))}
      </div>

      {/* Quick add */}
      <section className="bg-surface border border-surface-border rounded-xl p-5">
        <h2 className="font-headline text-base text-text-primary tracking-tight mb-4">QUICK ADD TABLE</h2>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="space-y-1.5">
            <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest">Number</label>
            <input
              type="number"
              value={addForm.table_number}
              onChange={(e) => setAddForm((f) => ({ ...f, table_number: e.target.value }))}
              placeholder="e.g. 05"
              className={inputCls + " w-28"}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest">Capacity</label>
            <select
              value={addForm.seat_count}
              onChange={(e) => setAddForm((f) => ({ ...f, seat_count: e.target.value }))}
              className={inputCls + " w-32"}
            >
              {[2, 4, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>{n} Guests</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 flex-1 min-w-[160px]">
            <label className="block text-text-muted text-xs font-body font-medium uppercase tracking-widest">Description</label>
            <input
              value={addForm.description}
              onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Near kitchen"
              className={inputCls}
            />
          </div>
          <button
            onClick={doAdd}
            disabled={isPending || !addForm.table_number}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-body text-sm hover:bg-red-700 transition-colors disabled:opacity-40 h-[42px]"
          >
            Add
          </button>
        </div>
      </section>

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditModal(null)} />
          <div className="relative bg-[#0f0f0f] border border-surface-border rounded-xl p-6 w-full max-w-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl text-text-primary tracking-tight">
                EDIT TABLE {String(editModal.table_number).padStart(2, "0")}
              </h2>
              <button onClick={() => setEditModal(null)} className="text-text-muted hover:text-text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-text-muted text-xs font-body uppercase tracking-widest">Number</label>
                <input
                  type="number"
                  value={editForm.table_number}
                  onChange={(e) => setEditForm((f) => ({ ...f, table_number: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-text-muted text-xs font-body uppercase tracking-widest">Capacity</label>
                <input
                  type="number"
                  value={editForm.seat_count}
                  onChange={(e) => setEditForm((f) => ({ ...f, seat_count: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-text-muted text-xs font-body uppercase tracking-widest">Description</label>
              <input
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-surface-border text-text-muted font-body text-sm hover:border-primary/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={doUpdate}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-body text-sm hover:bg-red-700 transition-colors disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full bg-background border border-surface-border rounded-xl px-4 py-2.5 text-text-primary font-body text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors";
