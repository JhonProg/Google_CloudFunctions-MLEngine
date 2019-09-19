/**
* Obtiene la polaridad (negativo, neutro, positivo) de un texto.
* @param {text} Texto a analizar su sentimiento.
*/
async function analyzeSentimentOfText(objectId, text) {
  // Imports the Google Cloud client library
  const language = require('@google-cloud/language');
  
  // Creates a client
  const client = new language.LanguageServiceClient();
  
  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  // Detects the sentiment of the document
  const [result] = await client.analyzeSentiment({document});
  const sentiment = result.documentSentiment;
  
  console.log(`Document sentiment:`);
  console.log(`  ObjectId: ${objectId}`);
  console.log(`  Text: ${text}`);
  console.log(`  Score: ${sentiment.score}`);
  console.log(`  Magnitude: ${sentiment.magnitude}`);
  
  //Insertar en BigQuery:
  insertRowsAsStream({
      ID: objectId, 
      TEXT: text, 
      SCORE: sentiment.score, 
      MAGNITUDE: sentiment.magnitude
  });

};


/**
* Insertar data en BigQuery.
*/
async function insertRowsAsStream(inRow) {
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');
  
  // Inserts the JSON objects into my_dataset:my_table.
  const datasetId = 'restaurantsScoreDataset';
  const tableId = 'object_sentiment_score';
  const row = inRow;

  // Create a client
  const bigqueryClient = new BigQuery();

  // Insert data into a table
  await bigqueryClient
    .dataset(datasetId)
    .table(tableId)
    .insert(row);
  console.log('Inserted.');
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.analyzeSentiment = (req, res) => {
  let message = req.body.text;
  let objectId = req.body.objectId;
  
  if(objectId && message){
  	analyzeSentimentOfText(objectId, message);
  }
  
  res.status(200).send("Ok");

};
