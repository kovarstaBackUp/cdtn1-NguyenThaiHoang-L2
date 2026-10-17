declare global {
  namespace App {
    interface Locals {
      employee: { employeeId: bigint; role: string; centerCode: string } | null;
    }
  }
}

export {};
