"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { GlobeIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useHotelBySlugQuery } from "@/features/hotel/client/useHotels";
import { HotelLogoUpload } from "@/features/tenant/hotelImages/components/hotel-logo-upload";
import {
  useHotelWebsiteQuery,
  useUpdateHotelWebsite,
} from "@/features/tenant/hotelWebsite/client/useHotelWebsite";
import { defaultSiteContent } from "@/features/tenant/website/types";

import { websiteSchema, type WebsiteValues } from "@/features/tenant/hotelWebsite/schema";


const LOGO_DISPLAY_OPTIONS = [
  { value: "logo", label: "Logo only" },
  { value: "text", label: "Text only" },
  { value: "both", label: "Logo + text" },
] as const;


function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[2, 5, 8].map((rows) => (
        <Card key={rows}>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Reusable field wrapper ────────────────────────────────────────────────

function FormField({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: { message?: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Field data-invalid={!!error} className={cn("flex flex-col gap-1.5", className)}>
      <FieldLabel htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </FieldLabel>
      {children}
      <FieldError errors={[error]} />
    </Field>
  );
}


function SectionDivider({ label }: { label: string }) {
  return (
    <div className="col-span-full flex items-center gap-3 pt-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}


function WebsiteForm({ tenant }: { tenant: string }) {
  const hotelQuery = useHotelBySlugQuery(tenant);
  const websiteQuery = useHotelWebsiteQuery(tenant);
  const updateWebsite = useUpdateHotelWebsite(tenant);

  const hotel = hotelQuery.data;
  const saved = websiteQuery.data?.content;
  const defaults = hotel ? defaultSiteContent(hotel) : undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<WebsiteValues>({
    resolver: zodResolver(websiteSchema),
    values:
      saved && defaults
        ? {
            logoDisplay: saved.logoDisplay ?? "both",
            heroEyebrow: saved.heroEyebrow ?? defaults.heroEyebrow,
            heroHeading: saved.heroHeading ?? defaults.heroHeading,
            heroSubheading: saved.heroSubheading ?? defaults.heroSubheading,
            ctaPrimaryLabel: saved.ctaPrimaryLabel ?? defaults.ctaPrimaryLabel,
            ctaSecondaryLabel: saved.ctaSecondaryLabel ?? defaults.ctaSecondaryLabel,
            aboutHeading: saved.aboutHeading ?? defaults.aboutHeading,
            aboutBody: saved.aboutBody ?? defaults.aboutBody,
            roomsHeading: saved.roomsHeading ?? defaults.roomsHeading,
            roomsSubheading: saved.roomsSubheading ?? defaults.roomsSubheading,
            cabinsHeading: saved.cabinsHeading ?? defaults.cabinsHeading,
            cabinsSubheading: saved.cabinsSubheading ?? defaults.cabinsSubheading,
            galleryHeading: saved.galleryHeading ?? defaults.galleryHeading,
            restaurantHeading: saved.restaurantHeading ?? defaults.restaurantHeading,
            restaurantSubheading: saved.restaurantSubheading ?? defaults.restaurantSubheading,
            contactHeading: saved.contactHeading ?? defaults.contactHeading,
            contactBody: saved.contactBody ?? defaults.contactBody,
          }
        : undefined,
  });

  const logoDisplay = watch("logoDisplay");

  if (hotelQuery.isPending || websiteQuery.isPending || !hotel || !defaults) {
    return <PageSkeleton />;
  }

  async function onSubmit(values: WebsiteValues) {
    await updateWebsite.mutateAsync({
      content: { ...(saved ?? {}), ...values },
    });
  }

  const isPending = updateWebsite.isPending;

  return (
    <form
      id="website-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Navbar</CardTitle>
          <CardDescription>What guests see at the top of your website.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
          {/* Logo upload */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Hotel logo</span>
            <HotelLogoUpload tenant={hotel.slug} disabled={isPending} className="items-start" />
          </div>

          {/* Logo display toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Logo display in navbar</span>
            <p className="text-sm text-muted-foreground">
              Choose what shows beside the hotel name.
            </p>
            <div className="mt-1 flex gap-2">
              {LOGO_DISPLAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue("logoDisplay", opt.value, { shouldDirty: true })
                  }
                  className={cn(
                    "flex-1 cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    logoDisplay === opt.value
                      ? "border-foreground bg-muted shadow-sm"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:bg-muted/50",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.logoDisplay && (
              <p className="text-sm text-destructive">{errors.logoDisplay.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hero section</CardTitle>
          <CardDescription>
            The first thing guests see — your big headline and call to action.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            label="Eyebrow"
            htmlFor="hero-eyebrow"
            error={errors.heroEyebrow}
            className="sm:col-span-2"
          >
            <Input
              id="hero-eyebrow"
              placeholder="Lakeside, Pokhara"
              aria-invalid={!!errors.heroEyebrow}
              {...register("heroEyebrow")}
            />
          </FormField>

          <FormField
            label="Main headline"
            htmlFor="hero-heading"
            error={errors.heroHeading}
            className="sm:col-span-2"
          >
            <Input
              id="hero-heading"
              placeholder="Hotel Everest View"
              aria-invalid={!!errors.heroHeading}
              {...register("heroHeading")}
            />
          </FormField>

          <FormField
            label="Subheading"
            htmlFor="hero-subheading"
            error={errors.heroSubheading}
            className="sm:col-span-2"
          >
            <Textarea
              id="hero-subheading"
              rows={2}
              placeholder="A place to slow down, eat well, and sleep even better."
              aria-invalid={!!errors.heroSubheading}
              {...register("heroSubheading")}
            />
          </FormField>

          <FormField label="Primary button" htmlFor="cta-primary" error={errors.ctaPrimaryLabel}>
            <Input
              id="cta-primary"
              placeholder="Book your stay"
              aria-invalid={!!errors.ctaPrimaryLabel}
              {...register("ctaPrimaryLabel")}
            />
          </FormField>

          <FormField
            label="Secondary button"
            htmlFor="cta-secondary"
            error={errors.ctaSecondaryLabel}
          >
            <Input
              id="cta-secondary"
              placeholder="Explore rooms"
              aria-invalid={!!errors.ctaSecondaryLabel}
              {...register("ctaSecondaryLabel")}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ── 3. Section text ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Section text</CardTitle>
          <CardDescription>
            Headings and body copy shown across your website's content sections.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SectionDivider label="About" />
          <FormField label="Heading" htmlFor="about-heading" error={errors.aboutHeading}>
            <Input
              id="about-heading"
              placeholder="About us"
              aria-invalid={!!errors.aboutHeading}
              {...register("aboutHeading")}
            />
          </FormField>
          <FormField
            label="Body text"
            htmlFor="about-body"
            error={errors.aboutBody}
            className="sm:col-span-1"
          >
            <Textarea
              id="about-body"
              rows={3}
              placeholder="Tell guests what makes a stay here different."
              aria-invalid={!!errors.aboutBody}
              {...register("aboutBody")}
            />
          </FormField>

          <SectionDivider label="Rooms" />
          <FormField label="Heading" htmlFor="rooms-heading" error={errors.roomsHeading}>
            <Input
              id="rooms-heading"
              placeholder="Rooms"
              aria-invalid={!!errors.roomsHeading}
              {...register("roomsHeading")}
            />
          </FormField>
          <FormField label="Subheading" htmlFor="rooms-subheading" error={errors.roomsSubheading}>
            <Input
              id="rooms-subheading"
              placeholder="Considered spaces, dressed simply, built for rest."
              aria-invalid={!!errors.roomsSubheading}
              {...register("roomsSubheading")}
            />
          </FormField>

          <SectionDivider label="Cabins" />
          <FormField label="Heading" htmlFor="cabins-heading" error={errors.cabinsHeading}>
            <Input
              id="cabins-heading"
              placeholder="Cabins"
              aria-invalid={!!errors.cabinsHeading}
              {...register("cabinsHeading")}
            />
          </FormField>
          <FormField
            label="Subheading"
            htmlFor="cabins-subheading"
            error={errors.cabinsSubheading}
          >
            <Input
              id="cabins-subheading"
              placeholder="For guests who want a little more room to breathe."
              aria-invalid={!!errors.cabinsSubheading}
              {...register("cabinsSubheading")}
            />
          </FormField>

          <SectionDivider label="Gallery" />
          <FormField
            label="Heading"
            htmlFor="gallery-heading"
            error={errors.galleryHeading}
            className="sm:col-span-2"
          >
            <Input
              id="gallery-heading"
              placeholder="Gallery"
              aria-invalid={!!errors.galleryHeading}
              {...register("galleryHeading")}
            />
          </FormField>

          <SectionDivider label="Restaurant" />
          <FormField
            label="Heading"
            htmlFor="restaurant-heading"
            error={errors.restaurantHeading}
          >
            <Input
              id="restaurant-heading"
              placeholder="Restaurant & dining"
              aria-invalid={!!errors.restaurantHeading}
              {...register("restaurantHeading")}
            />
          </FormField>
          <FormField
            label="Subheading"
            htmlFor="restaurant-subheading"
            error={errors.restaurantSubheading}
          >
            <Input
              id="restaurant-subheading"
              placeholder="A short, seasonal menu, cooked with care."
              aria-invalid={!!errors.restaurantSubheading}
              {...register("restaurantSubheading")}
            />
          </FormField>

          <SectionDivider label="Contact" />
          <FormField label="Heading" htmlFor="contact-heading" error={errors.contactHeading}>
            <Input
              id="contact-heading"
              placeholder="Your stay starts here"
              aria-invalid={!!errors.contactHeading}
              {...register("contactHeading")}
            />
          </FormField>
          <FormField label="Body text" htmlFor="contact-body" error={errors.contactBody}>
            <Textarea
              id="contact-body"
              rows={2}
              placeholder="Reach out and we'll help you plan the details."
              aria-invalid={!!errors.contactBody}
              {...register("contactBody")}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          form="website-form"
          disabled={isPending || !isDirty}
          data-icon={isPending ? "inline-start" : undefined}
        >
          {isPending && <Spinner />}
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}


export function WebsitePageClient({ tenant }: { tenant: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Website"
        description="Manage your public website content and appearance."
        actions={
          <Button
            variant="outline"
            size="sm"
            render={<a href={`/s/${tenant}`} target="_blank" rel="noopener noreferrer" />}
          >
            <GlobeIcon className="size-4" />
            View live site
          </Button>
        }
      />
      <WebsiteForm tenant={tenant} />
    </div>
  );
}
