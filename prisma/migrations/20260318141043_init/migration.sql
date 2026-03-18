-- CreateTable
CREATE TABLE "GuildSettings" (
    "id" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "adminRoleID" TEXT,
    "notificationChannelID" TEXT,
    "prefix" TEXT,
    "lastConfigUpdate" TIMESTAMP(3),
    "jamPositionateChannelID" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GuildSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildUser" (
    "id" TEXT NOT NULL,
    "discordID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuildUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JamTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "categoryID" TEXT NOT NULL,
    "textChannelID" TEXT NOT NULL,
    "voiceChannelID" TEXT NOT NULL,
    "discordRoleID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JamTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JamTeamMember" (
    "id" TEXT NOT NULL,
    "teamID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isTeamLeader" BOOLEAN NOT NULL DEFAULT false,
    "joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JamTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildSettings_guildID_key" ON "GuildSettings"("guildID");

-- CreateIndex
CREATE UNIQUE INDEX "GuildSettings_adminRoleID_key" ON "GuildSettings"("adminRoleID");

-- CreateIndex
CREATE UNIQUE INDEX "GuildSettings_notificationChannelID_key" ON "GuildSettings"("notificationChannelID");

-- CreateIndex
CREATE UNIQUE INDEX "GuildUser_guildID_key" ON "GuildUser"("guildID");

-- AddForeignKey
ALTER TABLE "JamTeamMember" ADD CONSTRAINT "JamTeamMember_teamID_fkey" FOREIGN KEY ("teamID") REFERENCES "JamTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
