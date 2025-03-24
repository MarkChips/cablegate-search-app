const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");

const baseDir = "./test-set/1975";

// Function to parse HTML content
function parseCableHtml(html, fileName, year, month) {
  const $ = cheerio.load(html);
  const doc = {
    _id: fileName,
    year: year,
    month: month,
  };

  // Extract table metadata
  const tableRow = $("table.cable tr").eq(1); // Second row (data row)
  doc.created = new Date(tableRow.find("td").eq(1).text().trim()).toISOString(); // e.g., "1988-05-04T13:00:00Z"
  doc.released = new Date(
    tableRow.find("td").eq(2).text().trim()
  ).toISOString(); // e.g., "2011-08-30T01:44:00Z"
  doc.classification = tableRow.find("td").eq(3).text().trim(); // e.g., "CONFIDENTIAL"
  doc.origin = tableRow.find("td").eq(4).text().trim(); // e.g., "Embassy Kampala"

  // Extract cable text from <code><pre> blocks
  const preBlocks = $("code pre");
  const headerText = preBlocks.eq(0).text().trim(); // First block: Header
  const bodyText = preBlocks.eq(1).text().trim(); // Second block: Full cable

  // Parse header text
  const headerLines = headerText.split("\n").map((line) => line.trim());
  headerLines.forEach((line) => {
    if (line.startsWith("FM ")) {
      doc.from = line.substring(3).trim(); // e.g., "AMEMBASSY KAMPALA"
    }
    if (line.startsWith("TO ")) {
      doc.to = line.substring(3).trim(); // e.g., "SECSTATE WASHDC PRIORITY 9980"
    }
  });

  // Parse body text
  const bodyLines = bodyText.split("\n").map((line) => line.trim());

  console.log(`-------------- ${fileName} cable length:`, bodyLines.length);

  let bodyStartIndex = 0;
  for (let i = 0; i < bodyLines.length; i++) {
    const line = bodyLines[i];

    // console.log(i, line);

    // Subject
    if (line.startsWith("SUBJECT:")) {
      doc.subject = line.substring(8).trim(); // e.g., "ANNUAL TERRORISM REPORT--STATUS OF PLO IN UGANDA"
    }

    // Tags
    else if (line.startsWith("TAGS:")) {
      doc.tags = line.substring(5).trim().split(/\s+/); // e.g., ["PTER", "UG"]
    }

    // Body starts after numbered paragraph
    else if (line.match(/^\¶[1.]\.\s+/)) {
      bodyStartIndex = i;
      console.log("regex matched:", bodyStartIndex);
      break;
    }
  }
  // Extract full body
  doc.body = bodyLines.slice(bodyStartIndex).join("\n").trim();

  console.log(doc.body);

  return doc;
}

// Main processing function
async function processCablegateFiles() {
  const files = await fs.readdir(baseDir, { recursive: true });
  const htmlFiles = files.filter((file) => file.endsWith(".html"));

  console.log(`Found ${htmlFiles.length} HTML files`);

  const documents = [];
  for (let i = 0; i < htmlFiles.length; i++) {
    const file = htmlFiles[i];
    const filePath = path.join(baseDir, file);
    const fileName = path.basename(file, ".html");

    // Extract year and month from directory structure
    const pathParts = file.split(path.sep);
    const year = parseInt(pathParts[0], 10);
    const month = parseInt(pathParts[1], 10);

    // console.log(pathParts, "year:", year, "month:", month);

    const html = await fs.readFile(filePath, "utf8");
    const doc = parseCableHtml(html, fileName, year, month);
    documents.push(doc);
  }
}

processCablegateFiles();
