-- AlterTable
ALTER TABLE "public"."Auction" ADD COLUMN     "winnerId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Auction" ADD CONSTRAINT "Auction_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
