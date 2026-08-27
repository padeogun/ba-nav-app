-- BA Nav Phase 1 + 2 schema
-- Paste and run in Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS "user" (
  "id"        UUID        PRIMARY KEY,
  "email"     TEXT        NOT NULL UNIQUE,
  "name"      TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS motivation (
  "id"                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"               UUID        NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "scores"               JSONB       NOT NULL DEFAULT '{}',
  "why"                  TEXT,
  "changes"              TEXT,
  "twoYears"             TEXT,
  "failureDespiteProfit" TEXT,
  "completed"            BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS temperament (
  "id"        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID        NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "scores"    JSONB       NOT NULL DEFAULT '{}',
  "completed" BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ownershipStyle" (
  "id"        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID        NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "scores"    JSONB       NOT NULL DEFAULT '{}',
  "completed" BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "capabilityRating" (
  "id"       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"   UUID    NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "skillKey" TEXT    NOT NULL,
  "rating"   INTEGER NOT NULL,
  "enjoy"    BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE ("userId", "skillKey")
);

CREATE TABLE IF NOT EXISTS "financialReadiness" (
  "id"                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"            UUID        NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS "riskRating" (
  "id"        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID    NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "riskKey"   TEXT    NOT NULL,
  "tolerance" INTEGER NOT NULL,
  UNIQUE ("userId", "riskKey")
);

CREATE TABLE IF NOT EXISTS lifestyle (
  "id"                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"              UUID        NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS "sectorInterest" (
  "id"       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"   UUID    NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "sectorId" TEXT    NOT NULL,
  UNIQUE ("userId", "sectorId")
);

CREATE TABLE IF NOT EXISTS opportunity (
  "id"               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"           UUID        NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "title"            TEXT        NOT NULL,
  "url"              TEXT        NOT NULL DEFAULT '',
  "sector"           TEXT        NOT NULL DEFAULT '',
  "askingPrice"      TEXT        NOT NULL DEFAULT '',
  "ebitda"           TEXT        NOT NULL DEFAULT '',
  "revenue"          TEXT        NOT NULL DEFAULT '',
  "employees"        TEXT        NOT NULL DEFAULT '',
  "yearsTrading"     TEXT        NOT NULL DEFAULT '',
  "location"         TEXT        NOT NULL DEFAULT '',
  "notes"            TEXT        NOT NULL DEFAULT '',
  "stage"            TEXT        NOT NULL DEFAULT 'saved',
  "score"            TEXT        NOT NULL DEFAULT '',
  "scoreFlags"       TEXT        NOT NULL DEFAULT '',
  "chCompanyNumber"  TEXT        NOT NULL DEFAULT '',
  "chCompanyName"    TEXT        NOT NULL DEFAULT '',
  "chStatus"         TEXT        NOT NULL DEFAULT '',
  "chSicCodes"       TEXT        NOT NULL DEFAULT '',
  "chIncorporatedOn" TEXT        NOT NULL DEFAULT '',
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "buyBox" (
  "id"                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"                   UUID        NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
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
