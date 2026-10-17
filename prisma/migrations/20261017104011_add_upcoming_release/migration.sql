-- CreateTable
CREATE TABLE "upcoming_release" (
    "id" TEXT NOT NULL DEFAULT 'homepage',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "nameLine1" TEXT NOT NULL DEFAULT 'Void',
    "nameLine2" TEXT NOT NULL DEFAULT 'Runner',
    "version" TEXT NOT NULL DEFAULT 'V3',
    "description" TEXT NOT NULL DEFAULT 'The next iteration of urban mobility.',
    "countdownEnds" TIMESTAMP(3),
    "buttonLabel" TEXT NOT NULL DEFAULT 'Set Reminder',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upcoming_release_pkey" PRIMARY KEY ("id")
);
