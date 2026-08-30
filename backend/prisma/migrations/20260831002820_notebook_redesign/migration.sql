-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "figNo" TEXT,
ADD COLUMN     "method" TEXT,
ADD COLUMN     "problem" TEXT,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "verified" TEXT;

-- CreateTable
CREATE TABLE "OpenSourceContribution" (
    "id" SERIAL NOT NULL,
    "project" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "statusKind" TEXT NOT NULL DEFAULT 'verify',
    "url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OpenSourceContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "km" DOUBLE PRECISION NOT NULL,
    "pace" DOUBLE PRECISION NOT NULL,
    "dur" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "hr" INTEGER,
    "elev" INTEGER,
    "cal" INTEGER,
    "note" TEXT,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Run_date_key" ON "Run"("date");

