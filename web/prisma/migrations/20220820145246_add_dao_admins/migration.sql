-- CreateTable
CREATE TABLE "DaoAdmin" (
    "id" SERIAL NOT NULL,
    "daoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DaoAdmin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DaoAdmin" ADD CONSTRAINT "DaoAdmin_daoId_fkey" FOREIGN KEY ("daoId") REFERENCES "Dao"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaoAdmin" ADD CONSTRAINT "DaoAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("appPrivateKey") ON DELETE RESTRICT ON UPDATE CASCADE;
