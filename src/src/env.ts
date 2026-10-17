import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  DEV_EMPLOYEE_ID: {
    schema: (value) => value ?? "1",
    description:
      "Dev-only fallback employee id used by hooks.server.ts when no Bearer token is sent.",
  },
  DEV_ROLE: {
    schema: (value) => value ?? "NHAN_VIEN",
    description: "Dev-only fallback role: NHAN_VIEN or QUAN_LY.",
  },
  DEV_CENTER_CODE: {
    schema: (value) => value ?? "TT01",
    description: "Dev-only fallback centre code.",
  },
});
