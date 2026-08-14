import { redirect } from "next/navigation";

import { OtpForm } from "@/features/auth/components/otp-form";
import { NEPALI_PHONE_REGEX } from "@/features/auth/schema";

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { phone } = await searchParams;
  const phoneNumber = Array.isArray(phone) ? phone[0] : phone;

  // Landing here without a number means the OTP was never requested.
  if (!phoneNumber || !NEPALI_PHONE_REGEX.test(phoneNumber)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md">
        <OtpForm phoneNumber={phoneNumber} />
      </div>
    </div>
  );
}
