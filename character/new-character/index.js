'use strict';
const uuid = require('uuid');
const fs = require('fs');
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'
});

const pattern = /CHARACTER_ID/g;

exports.handler = async (event, context) => {

    var characterId = uuid.v4();
    var data = fs.readFileSync('./template.json', "utf8");
    var batches = JSON.parse(data.replace(pattern, characterId));

    try {

        for (let index = 0; index < batches.length; index++) {

            let batch = batches[index];
            var result = await docClient.batchWrite(batch).promise();

            if (Object.keys(result.UnprocessedItems) !== 0) {
                console.log(`Unprocessed items for character: ${characterId}\nItems: ${JSON.stringify(result.UnprocessedItems)}`);
            }
        }

        return {
            statusCode: 200,
            body: {
                characterId: characterId
            }
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: {
                error: error
            }
        };
    }
};
