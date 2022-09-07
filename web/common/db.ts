import { PrismaClient } from "@prisma/client";

if (!global.prisma) {
    global.prisma = new PrismaClient({ log: ['query'], });
}
export default global.prisma;
