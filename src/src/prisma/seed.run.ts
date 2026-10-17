import { seed } from "./seed.ts";

await seed();
console.log("seeded");
process.exit(0);
