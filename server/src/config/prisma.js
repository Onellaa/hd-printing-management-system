import { PrismaClient } from "@prisma/client";

// A single Prisma client instance is shared across the app.
export const prisma = new PrismaClient();

