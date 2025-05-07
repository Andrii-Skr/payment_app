-- CreateTable
CREATE TABLE "bank_info" (
    "mfo" VARCHAR(6) NOT NULL,
    "bank_name" VARCHAR NOT NULL,

    CONSTRAINT "bank_info_pkey" PRIMARY KEY ("mfo")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "vat_type" BOOLEAN NOT NULL,
    "vat_percent" DECIMAL(65,30) NOT NULL,
    "account_number" TEXT NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "account_sum" DECIMAL(10,2) NOT NULL,
    "account_sum_expression" TEXT,
    "partner_account_number_id" INTEGER NOT NULL,
    "purpose_of_payment" TEXT NOT NULL,
    "note" TEXT,
    "is_saved" BOOLEAN NOT NULL DEFAULT false,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    "is_auto_payment" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spec_doc" (
    "id" SERIAL NOT NULL,
    "documents_id" INTEGER NOT NULL,
    "auto_payment_id" INTEGER,
    "pay_sum" DECIMAL(10,2) NOT NULL,
    "expected_date" TIMESTAMP,
    "dead_line_date" TIMESTAMP,
    "paid_date" TIMESTAMP,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "spec_doc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_payment" (
    "id" SERIAL NOT NULL,
    "documents_id" INTEGER NOT NULL,
    "pay_sum" DECIMAL(10,2) NOT NULL,
    "expected_date" TIMESTAMP,
    "dead_line_date" TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "auto_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "partner_name" TEXT NOT NULL,
    "edrpou" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "account_sum" DECIMAL(10,2) NOT NULL,
    "account_sum_expression" TEXT,
    "vat_type" BOOLEAN NOT NULL,
    "vat_percent" DECIMAL(65,30) NOT NULL,
    "partner_account_number_id" INTEGER NOT NULL,
    "purpose_of_payment" TEXT NOT NULL,
    "note" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "type" DECIMAL(1,0),
    "edrpou" VARCHAR(8) NOT NULL,
    "bank_account" TEXT NOT NULL,
    "bank_name" TEXT,
    "mfo" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_request_log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "ip" VARCHAR(45),
    "route" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_request_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "type" DECIMAL(1,0),
    "edrpou" VARCHAR(8) NOT NULL,
    "group" SMALLINT[],
    "entity_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_account_number" (
    "id" SERIAL NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "bank_account" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "mfo" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "partner_account_number_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synonym_for_partners" (
    "id" SERIAL NOT NULL,
    "partners_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "synonym_for_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_partners" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "partner_id" INTEGER NOT NULL,

    CONSTRAINT "users_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "login" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_entities" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "entity_id" INTEGER NOT NULL,

    CONSTRAINT "users_entities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_info_mfo_key" ON "bank_info"("mfo");

-- CreateIndex
CREATE UNIQUE INDEX "spec_doc_auto_payment_id_expected_date_is_deleted_key" ON "spec_doc"("auto_payment_id", "expected_date", "is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "template_name_key" ON "template"("name");

-- CreateIndex
CREATE UNIQUE INDEX "entity_edrpou_key" ON "entity"("edrpou");

-- CreateIndex
CREATE INDEX "api_request_log_route_created_at_idx" ON "api_request_log"("route", "created_at");

-- CreateIndex
CREATE INDEX "api_request_log_user_id_created_at_idx" ON "api_request_log"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "partners_edrpou_key" ON "partners"("edrpou");

-- CreateIndex
CREATE UNIQUE INDEX "user_login_key" ON "user"("login");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_partner_account_number_id_fkey" FOREIGN KEY ("partner_account_number_id") REFERENCES "partner_account_number"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spec_doc" ADD CONSTRAINT "spec_doc_documents_id_fkey" FOREIGN KEY ("documents_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "spec_doc" ADD CONSTRAINT "spec_doc_auto_payment_id_fkey" FOREIGN KEY ("auto_payment_id") REFERENCES "auto_payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_payment" ADD CONSTRAINT "auto_payment_documents_id_fkey" FOREIGN KEY ("documents_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "template" ADD CONSTRAINT "template_partner_account_number_id_fkey" FOREIGN KEY ("partner_account_number_id") REFERENCES "partner_account_number"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "api_request_log" ADD CONSTRAINT "api_request_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "partner_account_number" ADD CONSTRAINT "partner_account_number_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "synonym_for_partners" ADD CONSTRAINT "synonym_for_partners_partners_id_fkey" FOREIGN KEY ("partners_id") REFERENCES "partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_partners" ADD CONSTRAINT "users_partners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_partners" ADD CONSTRAINT "users_partners_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_entities" ADD CONSTRAINT "users_entities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_entities" ADD CONSTRAINT "users_entities_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
