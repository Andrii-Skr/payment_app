import { spec_doc } from "./../node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d";
import { entity } from "@prisma/client";
import { partners } from "@prisma/client";
import { documents } from "@prisma/client";
import prisma from "./prisma-client";
// import {hashSync} from "bcrypt"

function getRandomPositiveOffset() {
  return Math.floor(Math.random() * 5) + 1;
}

function getRandomDate() {
  const currentDate = new Date();
  const offset = getRandomPositiveOffset();
  const futureDate = new Date(currentDate);
  futureDate.setDate(currentDate.getDate() + offset);
  return futureDate;
}

async function addData() {
  await prisma.user.createMany({
    data: [
      {
        login: "user1",
        password: "user1",
        role_id: 1,
        name: "user1",
      },
    ],
  });

  await prisma.entity.createMany({
    data: [
      {
        name: "Выбор",
        type: 1,
        edrpou: "12345678",
      },
      {
        name: "Зенит",
        type: 1,
        edrpou: "22345678",
      },
    ],
  });
}

async function addPartners() {
  await prisma.partners.createMany({
    data: [

      {
        name: "partner5Зенит",
        type: 2,
        edrpou: "05345678",
        entity_id: 2,
      },
      {
        name: "partner6Зенит",
        type: 2,
        edrpou: "06345678",
        entity_id: 2,
      },
      {
        name: "partner7Зенит",
        type: 2,
        edrpou: "07345678",
        entity_id: 2,
      },
      {
        name: "partner8Зенит",
        type: 2,
        edrpou: "08345678",
        entity_id: 2,
      },
      {
        name: "partner1Выбор",
        type: 1,
        edrpou: "01345678",
        entity_id: 1,
      },
      {
        name: "partner2Выбор",
        type: 1,
        edrpou: "02345678",
        entity_id: 1,
      },
      {
        name: "partner3Выбор",
        type: 1,
        edrpou: "03345678",
        entity_id: 1,
      },
      {
        name: "partner4Выбор",
        type: 1,
        edrpou: "04345678",
        entity_id: 1,
      },
      {
        name: "partner9Выбор",
        type: 1,
        edrpou: "09345678",
        entity_id: 1,
      },
      {
        name: "partner19Выбор",
        type: 1,
        edrpou: "19345678",
        entity_id: 1,
      },
      {
        name: "partner10Выбор",
        type: 1,
        edrpou: "10345678",
        entity_id: 1,
      },
      {
        name: "partner11Выбор",
        type: 1,
        edrpou: "11345678",
        entity_id: 1,
      },
      {
        name: "partner12Выбор",
        type: 1,
        edrpou: "12345678",
        entity_id: 1,
      },
      {
        name: "partner13Выбор",
        type: 1,
        edrpou: "13345678",
        entity_id: 1,
      },
      {
        name: "partner14Выбор",
        type: 1,
        edrpou: "14345678",
        entity_id: 1,
      },
      {
        name: "partner15Выбор",
        type: 1,
        edrpou: "15345678",
        entity_id: 1,
      },
      {
        name: "partner16Выбор",
        type: 1,
        edrpou: "16345678",
        entity_id: 1,
      },
      {
        name: "partner17Выбор",
        type: 1,
        edrpou: "17345678",
        entity_id: 1,
      },
      {
        name: "partner18Выбор",
        type: 1,
        edrpou: "18345678",
        entity_id: 1,
      },
      {
        name: "partner20Выбор",
        type: 1,
        edrpou: "20345678",
        entity_id: 1,
      },
      {
        name: "partner21Выбор",
        type: 1,
        edrpou: "21345678",
        entity_id: 1,
      },
      {
        name: "partner22Выбор",
        type: 1,
        edrpou: "22345678",
        entity_id: 1,
      },
      {
        name: "partner23ыбор",
        type: 1,
        edrpou: "23345678",
        entity_id: 1,
      },
      {
        name: "partner24Выбор",
        type: 1,
        edrpou: "24345678",
        entity_id: 1,
      },
      {
        name: "partner25Выбор",
        type: 1,
        edrpou: "25345678",
        entity_id: 1,
      },
      {
        name: "partner26Выбор",
        type: 1,
        edrpou: "26345678",
        entity_id: 1,
      },
    ],
  });

  await prisma.partner_account_number.createMany({
    data: [
      {
        partner_id: 1,
        bank_account: "IBAN 1 12345678901234567890",
        mfo: "1234",
      },
      {
        partner_id: 1,
        bank_account: "IBAN 1 22345678901234567890",
        mfo: "2234",
      },
      {
        partner_id: 2,
        bank_account: "IBAN 2 32345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 1,
        bank_account: "IBAN 1 12345678901234567890",
        mfo: "1234",
      },
      {
        partner_id: 1,
        bank_account: "IBAN 1 22345678901234567890",
        mfo: "2234",
      },
      {
        partner_id: 2,
        bank_account: "IBAN 2 32345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 4,
        bank_account: "IBAN 4 42345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 5,
        bank_account: "IBAN 5 52345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 6,
        bank_account: "IBAN 6 62345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 7,
        bank_account: "IBAN 7 72345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 8,
        bank_account: "IBAN 8 92345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 9,
        bank_account: "IBAN 9 92345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 10,
        bank_account: "IBAN 10 92345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 11,
        bank_account: "IBAN 11 92345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 12,
        bank_account: "IBAN 12 92345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 13,
        bank_account: "IBAN 13 92345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 14,
        bank_account: "IBAN 14 92345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 15,
        bank_account: "IBAN 15 92345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 16,
        bank_account: "IBAN 16 92345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 17,
        bank_account: "IBAN 17 345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 18,
        bank_account: "IBAN 18 345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 19,
        bank_account: "IBAN 19 345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 20,
        bank_account: "IBAN 20 345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 21,
        bank_account: "IBAN 21 345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 22,
        bank_account: "IBAN 22 345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 23,
        bank_account: "IBAN 23 345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 24,
        bank_account: "IBAN 24 345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 25,
        bank_account: "IBAN 25 345678901234567890",
        mfo: "3234",
      },
      {
        partner_id: 26,
        bank_account: "IBAN 26 345678901234567890",
        mfo: "3234",
      },
    ],
  });
  await prisma.documents.createMany({
    data: [
      {
        entity_id: 2,
        partner_id: 1,
        account_number: "Счет № 1",
        date: new Date(),
        account_sum: 1000.0,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 1 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 2,
        partner_id: 2,
        account_number: "Счет № 2",
        date: new Date(),
        account_sum: 1100.5,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 2 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 2,
        partner_id: 3,
        account_number: "Счет № 3",
        date: new Date(),
        account_sum: 1200.75,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 3 32345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 2,
        partner_id: 4,
        account_number: "Счет № 4",
        date: new Date(),
        account_sum: 1300.8,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 4 42345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 5,
        account_number: "Счет № 5",
        date: new Date(),
        account_sum: 1400.95,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 5 52345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 6,
        account_number: "Счет № 6",
        date: new Date(),
        account_sum: 1500.6,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 6 62345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 7,
        account_number: "Счет № 7",
        date: new Date(),
        account_sum: 1600.1,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 7 72345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 8,
        account_number: "Счет № 8",
        date: new Date(),
        account_sum: 1700.2,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 8 92345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 9,
        account_number: "Счет № 9",
        date: new Date(),
        account_sum: 1800.3,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 9 92345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 10,
        account_number: "Счет № 10",
        date: new Date(),
        account_sum: 1900.4,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 10 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 11,
        account_number: "Счет № 11",
        date: new Date(),
        account_sum: 2000.55,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 11 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },

      {
        entity_id: 1,
        partner_id: 12,
        account_number: "Счет № 12",
        date: new Date(),
        account_sum: 2100.65,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 12 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 13,
        account_number: "Счет № 13",
        date: new Date(),
        account_sum: 2200.75,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 13 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 14,
        account_number: "Счет № 14",
        date: new Date(),
        account_sum: 2300.85,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 14 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 15,
        account_number: "Счет № 15",
        date: new Date(),
        account_sum: 2400.95,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 15 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 16,
        account_number: "Счет № 16",
        date: new Date(),
        account_sum: 2500.05,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 16 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 17,
        account_number: "Счет № 17",
        date: new Date(),
        account_sum: 2600.15,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 17 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 18,
        account_number: "Счет № 18",
        date: new Date(),
        account_sum: 2700.25,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 18 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 19,
        account_number: "Счет № 19",
        date: new Date(),
        account_sum: 2800.35,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 19 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 20,
        account_number: "Счет № 20",
        date: new Date(),
        account_sum: 2000.35,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 20 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 21,
        account_number: "Счет № 21",
        date: new Date(),
        account_sum: 2100.35,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 21 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 22,
        account_number: "Счет № 22",
        date: new Date(),
        account_sum: 2200.35,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 22 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 23,
        account_number: "Счет № 23",
        date: new Date(),
        account_sum: 2300.35,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 23 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 24,
        account_number: "Счет № 24",
        date: new Date(),
        account_sum: 2400.35,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 24 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 25,
        account_number: "Счет № 25",
        date: new Date(),
        account_sum: 2500.35,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 25 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 26,
        account_number: "Счет № 26",
        date: new Date(),
        account_sum: 2500.35,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 25 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 11,
        account_number: "Счет № 27",
        date: new Date(),
        account_sum: 7000.55,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 11 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 11,
        account_number: "Счет № 28",
        date: new Date(),
        account_sum: 6000.55,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 11 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 11,
        account_number: "Счет № 29",
        date: new Date(),
        account_sum: 5000.55,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 11 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 11,
        account_number: "Счет № 30",
        date: new Date(),
        account_sum: 4000.55,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 11 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
      {
        entity_id: 1,
        partner_id: 11,
        account_number: "Счет № 31",
        date: new Date(),
        account_sum: 3000.55,
        account_sum_expression: "",
        purpose_of_payment: "Оплата услуг",
        bank_account: "IBAN 11 12345678901234567890",
        mfo: "1234",
        is_saved: true,
        is_paid: false,
        user_id: 1,
      },
    ],
  });

  await prisma.spec_doc.createMany({
    data: [
      {
        documents_id: 1,
        pay_sum: 611.54,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 1,
        pay_sum: 388.46,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 2,
        pay_sum: 550.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 2,
        pay_sum: 550.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },

      {
        documents_id: 3,
        pay_sum: 700.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 3,
        pay_sum: 500.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 4,
        pay_sum: 600.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 4,
        pay_sum: 700.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 5,
        pay_sum: 800.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 5,
        pay_sum: 600.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 6,
        pay_sum: 750.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 6,
        pay_sum: 750.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 7,
        pay_sum: 900.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 7,
        pay_sum: 700.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 8,
        pay_sum: 850.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 8,
        pay_sum: 850.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },

      {
        documents_id: 9,
        pay_sum: 1000.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 9,
        pay_sum: 800.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 10,
        pay_sum: 950.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 10,
        pay_sum: 950.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 11,
        pay_sum: 1200.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 11,
        pay_sum: 800.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },

      {
        documents_id: 12,
        pay_sum: 1050.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 12,
        pay_sum: 1050.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },

      {
        documents_id: 13,
        pay_sum: 1100.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 13,
        pay_sum: 1100.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },

      {
        documents_id: 14,
        pay_sum: 1150.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 14,
        pay_sum: 1150.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },

      {
        documents_id: 15,
        pay_sum: 1300.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 15,
        pay_sum: 1100.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },

      {
        documents_id: 16,
        pay_sum: 1250.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 16,
        pay_sum: 1250.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },

      {
        documents_id: 17,
        pay_sum: 1400.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },
      {
        documents_id: 17,
        pay_sum: 1200.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 18,
        pay_sum: 1350.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 18,
        pay_sum: 1350.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 19,
        pay_sum: 1500.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 19,
        pay_sum: 1300.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },

      {
        documents_id: 20,
        pay_sum: 1450.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 20,
        pay_sum: 1450.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 21,
        pay_sum: 1600.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },
      {
        documents_id: 21,
        pay_sum: 1400.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 22,
        pay_sum: 1550.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 22,
        pay_sum: 1550.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 23,
        pay_sum: 1700.0,
        expected_date: getRandomDate(),
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 23,
        pay_sum: 1500.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 24,
        pay_sum: 1650.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },
      {
        documents_id: 24,
        pay_sum: 1650.0,
        expected_date: getRandomDate(),
        dead_line_date: null,
      },

      {
        documents_id: 25,
        pay_sum: 1800.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 25,
        pay_sum: 1600.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 26,
        pay_sum: 1600.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 27,
        pay_sum: 2400.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 28,
        pay_sum: 2000.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 29,
        pay_sum: 1900.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 30,
        pay_sum: 1800.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
      {
        documents_id: 31,
        pay_sum: 1700.0,
        expected_date: null,
        dead_line_date: getRandomDate(),
      },
    ],
  });
}

async function clearData() {
  await prisma.$executeRaw`TRUNCATE TABLE "entity" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "partners" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "partner_account_number" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "documents" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "spec_doc" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;`;
}

async function main() {
  try {
    await clearData();
    await addData();
    await addPartners();
  } catch (error) {
    console.log(error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
