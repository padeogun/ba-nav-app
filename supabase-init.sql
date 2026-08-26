-- BA Nav Phase 1 + 2 schema
-- Paste and run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS "User" (
  "id"        UUID        PRIMARY KEY,
  "email"     TEXT        NOT NULL UNIQUE,
  "name"      TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Motivation" (
  "id"                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"               UUID        NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "scores"               JSONB       NOT NULL DEFAULT '{}',
  "why"                  TEXT,
  "changes"              TEXT,
  "twoYears"             TEXT,
  "failureDespiteProfit" TEXT,
  "completed"            BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Temperament" (
  "id"        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID        NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "scores"    JSONB       NOT NULL DEFAULT '{}',
  "completed" BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "OwnershipStyle" (
  "id"        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID        NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "scores"    JSONB       NOT NULL DEFAULT '{}',
  "completed" BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CapabilityRating" (
  "id"       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"   UUID    NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "skillKey" TEXT    NOT NULL,
  "rating"   INTEGER NOT NULL,
  "enjoy"    BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE ("userId", "skillKey")
);

CREATE TABLE IF NOT EXISTS "FinancialReadiness" (
  "id"                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"            UUID        NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "capitalAvailable"  FLOAT8,
  "riskCapital"       FLOAT8,
  "existingDebt"      FLOAT8,
  "additionalCapital" FLOAT8,
  "desiredSize"       FLOAT8,
  "minHouseholdIncome" FLOAT8,
  "desiredDrawings"   FLOAT8,
  "maxGuarantee"      FLOAT8,
  "reserveMonths"     TEXT        NOT NULL DEFAULT '6',
  "maxLeverage"       TEXT        NOT NULL DEFAULT 'moderate',
  "completed"         BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "RiskRating" (
  "id"        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID    NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "riskKey"   TEXT    NOT NULL,
  "tolerance" INTEGER NOT NULL,
  UNIQUE ("userId", "riskKey")
);

CREATE TABLE IF NOT EXISTS "Lifestyle" (
  "id"                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"              UUID        NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "weeklyHours"         INTEGER     NOT NULL DEFAULT 45,
  "maxCommute"          INTEGER     NOT NULL DEFAULT 45,
  "weekendTolerance"    TEXT        NOT NULL DEFAULT 'occasional',
  "emergencyTolerance"  TEXT        NOT NULL DEFAULT 'sometimes',
  "travelTolerance"     TEXT        NOT NULL DEFAULT 'regional',
  "customerFacing"      TEXT        NOT NULL DEFAULT 'yes',
  "relocate"            TEXT        NOT NULL DEFAULT 'no',
  "remotePref"          TEXT        NOT NULL DEFAULT 'hybrid',
  "longTermInvolvement" TEXT        NOT NULL DEFAULT 'owner-manager',
  "minPersonalIncome"   FLOAT8      NOT NULL DEFAULT 0,
  "completed"           BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phase 3 tables

CREATE TABLE IF NOT EXISTS "SectorInterest" (
  "id"       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"   UUID    NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "sectorId" TEXT    NOT NULL,
  UNIQUE ("userId", "sectorId")
);

CREATE TABLE IF NOT EXISTS "BuyBox" (
  "id"                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"                   UUID        NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "geography"                TEXT        NOT NULL DEFAULT 'United Kingdom',
  "maxDistance"              TEXT        NOT NULL DEFAULT '45',
  "sectorsPreferred"         TEXT        NOT NULL DEFAULT '',
  "sectorsExcluded"          TEXT        NOT NULL DEFAULT '',
  "revenueMin"               TEXT        NOT NULL DEFAULT '',
  "revenueMax"               TEXT        NOT NULL DEFAULT '',
  "ebitdaMin"                TEXT        NOT NULL DEFAULT '',
  "ebitdaMax"                TEXT        NOT NULL DEFAULT '',
  "priceMin"                 TEXT        NOT NULL DEFAULT '',
  "priceMax"                 TEXT        NOT NULL DEFAULT '',
  "employeeMin"              TEXT        NOT NULL DEFAULT '',
  "employeeMax"              TEXT        NOT NULL DEFAULT '',
  "minMargin"                TEXT        NOT NULL DEFAULT '10',
  "minRecurring"             TEXT        NOT NULL DEFAULT '30',
  "maxCustomerConcentration" TEXT        NOT NULL DEFAULT '25',
  "maxSupplierConcentration" TEXT        NOT NULL DEFAULT '30',
  "minYearsTrading"          TEXT        NOT NULL DEFAULT '3',
  "cashConversion"           TEXT        NOT NULL DEFAULT 'moderate-to-high',
  "maxCapex"                 TEXT        NOT NULL DEFAULT 'low',
  "maxSellerDependency"      TEXT        NOT NULL DEFAULT 'moderate',
  "maxOwnerHours"            TEXT        NOT NULL DEFAULT '45',
  "dealTypes"                TEXT        NOT NULL DEFAULT '',
  "ownershipModel"           TEXT        NOT NULL DEFAULT 'Owner/operator',
  "completed"                BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
