-- CreateTable
CREATE TABLE "Dao" (
    "publicKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "about" TEXT,
    "registrationTxId" TEXT,
    "registrationStatus" TEXT NOT NULL,
    "raisingAmount" INTEGER NOT NULL,
    "raisingDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dao_pkey" PRIMARY KEY ("publicKey")
);

-- CreateTable
CREATE TABLE "User" (
    "appPrivateKey" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "fundingWalletAddress" TEXT,
    "registrationTxId" TEXT,
    "registrationStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("appPrivateKey")
);

-- CreateTable
CREATE TABLE "FundingWallet" (
    "publicKey" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingWallet_pkey" PRIMARY KEY ("publicKey")
);

-- CreateTable
CREATE TABLE "FundingTransaction" (
    "txId" TEXT NOT NULL,
    "walletPublicKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingTransaction_pkey" PRIMARY KEY ("txId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dao_slug_key" ON "Dao"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_fundingWalletAddress_key" ON "User"("fundingWalletPublicKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_fundingWalletPublicKey_fkey" FOREIGN KEY ("fundingWalletPublicKey") REFERENCES "FundingWallet"("publicKey") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingTransaction" ADD CONSTRAINT "FundingTransaction_walletPublicKey_fkey" FOREIGN KEY ("walletPublicKey") REFERENCES "FundingWallet"("publicKey") ON DELETE RESTRICT ON UPDATE CASCADE;
