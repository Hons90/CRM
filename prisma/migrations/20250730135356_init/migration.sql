-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "revenueGoal" DECIMAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "companyName" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "createdBy" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Contact_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contactId" INTEGER NOT NULL,
    "documentType" TEXT,
    "filePath" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "uploadedBy" INTEGER NOT NULL,
    CONSTRAINT "ContactDocument_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ContactTag" (
    "contactId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    PRIMARY KEY ("contactId", "tagId"),
    CONSTRAINT "ContactTag_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContactTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DialerPool" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "poolName" TEXT NOT NULL,
    "uploadedBy" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DialerPool_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DialerNumber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "poolId" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "label" TEXT,
    "isCalled" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DialerNumber_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "DialerPool" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "saleType" TEXT NOT NULL,
    "saleDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CallLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "poolId" INTEGER,
    "status" TEXT NOT NULL,
    "outcome" TEXT,
    "duration" INTEGER NOT NULL,
    "callTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "CallLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CallLog_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "DialerPool" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
