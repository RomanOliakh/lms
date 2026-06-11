"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganization, updateOrganization } from "@/lib/actions/organizations";
import { slugify } from "@/lib/utils";
import { Tables } from "@/types/supabase";

type Organization = Tables<"organizations">;

export default function CompanyForm({ organization }: { organization?: Organization }) {
  const router = useRouter();
  const [name, setName] = useState(organization?.name ?? "");
  const [slug, setSlug] = useState(organization?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!organization);
  const [logoUrl, setLogoUrl] = useState(organization?.logo_url ?? "");
  const [seatLimit, setSeatLimit] = useState(String(organization?.seat_limit ?? "0"));
  const [isActive, setIsActive] = useState((organization?.status ?? "active") === "active");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("status", isActive ? "active" : "suspended");

    startTransition(async () => {
      try {
        if (organization) {
          await updateOrganization(organization.id, formData);
        } else {
          const result = await createOrganization(formData);
          router.push(`/admin/companies/${result.id}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка збереження");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-n-700">Назва компанії</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="ТОВ «Компанія»"
          required
          className="border-n-200 focus-visible:ring-lms-accent"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug" className="text-n-700">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
          placeholder="kompaniia"
          required
          className="border-n-200 focus-visible:ring-lms-accent font-mono text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seat_limit" className="text-n-700">Ліміт місць</Label>
        <Input
          id="seat_limit"
          name="seat_limit"
          type="number"
          min="0"
          step="1"
          value={seatLimit}
          onChange={(e) => setSeatLimit(e.target.value)}
          className="border-n-200 focus-visible:ring-lms-accent"
        />
        <p className="text-xs text-n-400">0 — без обмеження</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="logo_url" className="text-n-700">URL логотипа</Label>
        <Input
          id="logo_url"
          name="logo_url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
          className="border-n-200 focus-visible:ring-lms-accent"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-lms-accent"
        />
        <Label htmlFor="is_active" className="text-n-700 cursor-pointer">
          Активна (зніміть, щоб призупинити доступ)
        </Label>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="bg-lms-accent hover:bg-lms-accent-600 text-white"
      >
        {isPending ? "Збереження..." : organization ? "Зберегти зміни" : "Створити компанію"}
      </Button>
    </form>
  );
}
