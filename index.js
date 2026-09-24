import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PDFDocument, StandardFonts } from "pdf-lib";

const typeDefs = `#graphql

  type Claim {
    dcn: ID!
    memberId: String!
    status: String!
    receivedDate: String!
  }

  type PdfDocument {
    dcn: ID!
    fileName: String!
    contentType: String!
    pdfBase64: String!
  }

  type Query {

    getDCNNumbers: [Claim!]!

    getClaim(dcn: ID!): Claim

    getClaimPdf(dcn: ID!): PdfDocument
  }
`;

const claims = [
  {
    dcn: "DCN10004",
    memberId: "TEST004",
    status: "RECEIVED",
    receivedDate: "2026-09-23"
  },
  {
    dcn: "DCN10002",
    memberId: "TEST002",
    status: "PENDING",
    receivedDate: "2026-09-22"
  },
  {
    dcn: "DCN10005",
    memberId: "TEST005",
    status: "RECEIVED",
    receivedDate: "2026-09-23"
  }
];

async function createPdf(claim) {

  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([612, 792]);

  const font = await pdfDoc.embedFont(
    StandardFonts.Helvetica
  );

  const boldFont = await pdfDoc.embedFont(
    StandardFonts.HelveticaBold
  );

  page.drawText("Sample International Claim", {
    x: 50,
    y: 730,
    size: 20,
    font: boldFont
  });

  page.drawText(`Document Control Number: ${claim.dcn}`, {
    x: 50,
    y: 680,
    size: 14,
    font
  });

  page.drawText(`Member ID: ${claim.memberId}`, {
    x: 50,
    y: 650,
    size: 14,
    font
  });

  page.drawText(`Claim Status: ${claim.status}`, {
    x: 50,
    y: 620,
    size: 14,
    font
  });

  page.drawText(`Received Date: ${claim.receivedDate}`, {
    x: 50,
    y: 590,
    size: 14,
    font
  });

  page.drawText(
    "This is a synthetic claim document created for Appian integration testing.",
    {
      x: 50,
      y: 530,
      size: 12,
      font
    }
  );

  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes).toString("base64");
}

const resolvers = {

  Query: {

    getDCNNumbers: () => claims,

    getClaim: (_, { dcn }) =>
      claims.find(claim => claim.dcn === dcn) ?? null,

    getClaimPdf: async (_, { dcn }) => {

      const claim =
        claims.find(claim => claim.dcn === dcn);

      if (!claim) {
        throw new Error(
          `No claim found for DCN ${dcn}`
        );
      }

      const pdfBase64 =
        await createPdf(claim);

      return {
        dcn: claim.dcn,
        fileName: `${claim.dcn}.pdf`,
        contentType: "application/pdf",
        pdfBase64
      };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const port =
  Number(process.env.PORT || 4000);

const { url } =
  await startStandaloneServer(server, {
    listen: {
      port,
      host: "0.0.0.0"
    }
  });

console.log(
  `GraphQL API running at ${url}`
);
