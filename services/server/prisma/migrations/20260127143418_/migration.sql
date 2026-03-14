-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "chimeMeetingId" TEXT NOT NULL,
    "chimeMeetingArn" TEXT,
    "externalMeetingId" TEXT,
    "mediaRegion" TEXT,
    "mediaPlacement" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_attendees" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chimeAttendeeId" TEXT NOT NULL,
    "chimeAttendeeArn" TEXT,
    "joinToken" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "meeting_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meetings_callId_key" ON "meetings"("callId");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_chimeMeetingId_key" ON "meetings"("chimeMeetingId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendees_chimeAttendeeId_key" ON "meeting_attendees"("chimeAttendeeId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendees_meetingId_userId_key" ON "meeting_attendees"("meetingId", "userId");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
