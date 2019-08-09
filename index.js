const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const uuid = require('node-uuid');
const { promisify } = require("util");

const TargetBasket = 'output.pdf-preview-gen';
const DBTableName = 'pdf-previews';

let TempDir;

let DynamoDb;

// PDF convert function, I cannot fast find the solution for Win and Unix both,
// so I created two version of this function
let PDF2Images;

// It seems require('fs').promises is not experimental anymore,
// but I use promisify to avoid warnings in Node 10
const removeFile = promisify(fs.unlink);
const writeFile_pr = promisify(fs.writeFile);
const readFile_pr = promisify(fs.readFile);
const fileStat = promisify(fs.stat);
//----------------------------------------------

// Lambda entry point
exports.handler = async (event, context) => {
  const inBucket = event.Records[0].s3.bucket.name;
  const inFile = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  TempDir = '/tmp';
  PDF2Images = require('./pdf-convert-unix');

  try {
    await Process(inBucket, inFile, TargetBasket);
    // context.done())
  } catch (err) {
    console.error(err);
    //  context.fail(err);
  }
}

async function Process(InBasket, Name, OutBasket) {
  const PDFFile = path.join(TempDir, Name);
  await downloadS3File(InBasket, Name, PDFFile);
  const FileID = await insertFileInfo(PDFFile);
  await updateFileStatus(FileID, 'in progress');
  const Screenshots = await PDF2Images(PDFFile, TempDir);

  for (let i in Screenshots) {
    let Name = Screenshots[i];
    await uploadS3File(Name, OutBasket, path.basename(Name));
    await removeFile(Name);
    //fs.unlink(Name, ()=>{});
    Screenshots[i] = 'http://' + OutBasket + '.s3.amazonaws.com/' + path.basename(Name);
  }

  await updateFileScreenshots(FileID, Screenshots);
  await removeS3File(InBasket, Name);
  await removeFile(PDFFile);
  await updateFileStatus(FileID, 'finished');
}

async function downloadS3File(Basket, Name, TargetFile) {
  const s3 = new AWS.S3();
  const s3Params = {
    Bucket: Basket,
    Key: Name
  };
  const s3Object = await s3.getObject(s3Params).promise();
  await writeFile_pr(TargetFile, s3Object.Body);
}

async function uploadS3File(SourceFile, Basket, Name) {
  const data = await readFile_pr(SourceFile);

  const s3 = new AWS.S3();
  const s3Params = {
    Bucket: Basket,
    Key: Name,
    Body: data,
    ContentType: "image/jpeg",
    ACL: 'public-read',
  //  Metadata: { thumbnail: 'TRUE'}
  }
  await s3.putObject(s3Params).promise();
}

async function removeS3File(Basket, Name) {
  if (Name === 'test.pdf') return; // Do not remove my test file (for testing)

  const s3 = new AWS.S3();
  const s3Params = {
    Bucket: Basket,
    Key: Name
  };
  await s3.deleteObject(s3Params).promise();
}

// return FileID
async function insertFileInfo(File) {
  const name = path.basename(File);
  const stat = await fileStat(File);
  const id = uuid.v1();
  const params = {
    TableName: DBTableName,
    Item: {
        ID: id,
        FileName: name,
        FileSize: stat.size,
        Status: 'new',
        Screenshots: []
    }
  }

  await DynamoDb.put(params).promise();

  return id;
}

async function updateFileStatus(FileID, Status) {
  const params = {
    TableName: DBTableName,
    Key: { ID: FileID },
    UpdateExpression: 'set #Status = :Status',
    ExpressionAttributeValues: { ':Status': Status },
    ExpressionAttributeNames: { '#Status': 'Status' }
  }

  await DynamoDb.update(params).promise();
}

async function updateFileScreenshots(FileID, Screenshots) {
  const params = {
    TableName: DBTableName,
    Key: { ID: FileID },
    UpdateExpression: 'set PageCount = :count, Screenshots = :shots',
    ExpressionAttributeValues: { ':count': Screenshots.length, ':shots': Screenshots }
  }

  await DynamoDb.update(params).promise();
}


// Function for local testing
async function LocalTest() {
  console.log('Start...');

  try {
    AWS.config.loadFromPath('./config.json');
    DynamoDb = new AWS.DynamoDB.DocumentClient();
    TempDir = './temp';
    PDF2Images = require('./pdf-convert-win');

    await Process('input1.pdf-preview-gen', 'test.pdf', TargetBasket);
    //await uploadS3File('C:\\GitProjects\\pdf-preview-gen\\temp\\test-1.jpg', 'output.pdf-preview-gen', 'test.jpg');
    //await removeS3File('output.pdf-preview-gen', 'test.jpg');
    //await insertFileInfo('C:\\GitProjects\\pdf-preview-gen\\test.pdf');
    //await updateFileStatus('2', 'aaa');

    console.log('Processed.');
  } catch(err) {
    console.error(err);
  }
}

LocalTest();
