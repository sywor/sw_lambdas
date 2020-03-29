'use strict';
const uuid = require('uuid');
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'

});

async function checkIfCharacterExist(characterId) {
    var params = {
        TableName: "sw_character_description",
        KeyConditionExpression: "characterId = :characterId",
        ExpressionAttributeValues: {
            ":characterId": characterId
        }
    };

    try {
        return await docClient.query(params).promise();
    }
    catch (e) {
        console.log(e);
        return null;
    }
}


exports.handler = async (event) => {

    var queryResult = await checkIfCharacterExist(event.characterId);
    
    console.log(queryResult);

    if (queryResult.Count === 0) {
        throw new Error(JSON.stringify({
            statusCode: 404,
            reason: "character not found"
        }));
    }

    var itemId = uuid.v4();

    var params = {
        TableName: "sw_character_inventory",
        Item: {
            characterId: event.characterId,
            itemId: itemId,
            item: event.item
        }
    };

    var request = docClient.put(params).promise();

    return await request.then(async (data) => {
        return {
            statusCode: 200,
            body: {
                itemId: itemId
            }
        };
    },
        (error) => {

            throw new Error(JSON.stringify({
                statusCode: 500,
                reason: "dynamoDB error",
                code: error.code
            }));
        });
};
