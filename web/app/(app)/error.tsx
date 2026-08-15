"use client";

import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <Alert variant="destructive">
        <AlertCircleIcon aria-hidden />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          We could not reach the server. Your session is still fine — try again.
        </AlertDescription>
      </Alert>
      <Button className="cursor-pointer" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
