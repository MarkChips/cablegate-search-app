require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');

// MongoDB configuration
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
const dbName = 'cablegate';
const collectionName = 'documents';

// Directory containing Cablegate files
const baseDir = './cable';

// Function to parse HTML content
function parseCableHtml(html, fileName) {
  const $ = cheerio.load(html);
  const doc = {
    _id: fileName.match(/(\d{2}[A-Z]+\d+)/)[1], // e.g., "88KAMPALA1783"
    year: parseInt(fileName.slice(0, 4)), // e.g., 1988
    month: parseInt(fileName.slice(5, 7)), // e.g., 05
  };

  // Extract table metadata
  const tableRow = $('table.cable tr').eq(1); // Second row (data row)
  doc.referenceId = tableRow.find('td').eq(0).text().trim(); // e.g., "88KAMPALA1783"
  doc.created = new Date(tableRow.find('td').eq(1).text().trim()).toISOString(); // e.g., "1988-05-04T13:00:00Z"
  doc.released = new Date(tableRow.find('td').eq(2).text().trim()).toISOString(); // e.g., "2011-08-30T01:44:00Z"
  doc.classification = tableRow.find('td').eq(3).text().trim().toUpperCase(); // e.g., "CONFIDENTIAL"
  doc.origin = tableRow.find('td').eq(4).text().trim(); // e.g., "Embassy Kampala"

  // Extract cable text from <code><pre> blocks
  const preBlocks = $('code pre');
  const headerText = preBlocks.eq(0).text().trim(); // First block: Header
  const bodyText = preBlocks.eq(1).text().trim(); // Second block: Full cable

  // Parse header text
  const headerLines = headerText.split('\n').map(line => line.trim());
  headerLines.forEach(line => {
    if (line.match(/^\w\s+\d{6}Z\s+[A-Z]{3}\s+\d{2}/i)) {
      const match = line.match(/(\d{2})(\d{2})(\d{2})Z\s+([A-Z]{3})\s+(\d{2})/i);
      if (match) {
        const [, day, month, year, monthName] = match;
        doc.date = new Date(`${monthName} ${day}, 20${year}`).toISOString();
      }
    }
    if (line.startsWith('FM ')) {
      doc.from = line.substring(3).trim(); // e.g., "AMEMBASSY KAMPALA"
    }
    if (line.startsWith('TO ')) {
      doc.to = line.substring(3).trim(); // e.g., "SECSTATE WASHDC PRIORITY 9980"
    }
  });

  // Parse body text
  const bodyLines = bodyText.split('\n').map(line => line.trim());
  let bodyStartIndex = 0;
  for (let i = 0; i < bodyLines.length; i++) {
    const line = bodyLines[i];

    // Subject
    if (line.startsWith('SUBJECT:')) {
      doc.subject = line.substring(8).trim(); // e.g., "ANNUAL TERRORISM REPORT--STATUS OF PLO IN UGANDA"
    }

    // Tags
    if (line.startsWith('TAGS:')) {
      doc.tags = line.substring(5).trim().split(/\s+/); // e.g., ["PTER", "UG"]
    }

    // Body starts after numbered paragraph
    if (line.match(/^\d+\.\s*\(/)) {
      bodyStartIndex = i;
      break;
    }
  }

  // Extract full body
  doc.body = bodyLines.slice(bodyStartIndex).join('\n').trim();

  return doc;
}

// Main processing function
async function processCablegateFiles() {
  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const files = await fs.readdir(baseDir, { recursive: true });
    const htmlFiles = files.filter(file => file.endsWith('.html'));

    console.log(`Found ${htmlFiles.length} HTML files`);

    const documents = [];
    for (const file of htmlFiles) {
      const filePath = path.join(baseDir, file);
      const fileName = path.basename(file, '.html');

      const html = await fs.readFile(filePath, 'utf8');
      const doc = parseCableHtml(html, fileName);
      documents.push(doc);

      if (documents.length >= 1000) {
        await collection.insertMany(documents, { ordered: false });
        console.log(`Inserted ${documents.length} documents`);
        documents.length = 0;
      }
    }

    if (documents.length > 0) {
      await collection.insertMany(documents, { ordered: false });
      console.log(`Inserted ${documents.length} documents`);
    }

    await collection.createIndex({ body: 'text' });
    console.log('Text index created on body field');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

processCablegateFiles();