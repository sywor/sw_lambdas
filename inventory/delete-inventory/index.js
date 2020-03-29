'use strict';
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'

});

exports.handler = async (event) => {

    var characterId = event.characterId;
    var itemId = event.itemId;

    var params = {
        TableName: "sw_character_inventory",
        Key: {
            characterId: characterId,
            itemId: itemId
        },
        ConditionExpression: "attribute_exists(characterId) and attribute_exists(itemId)"
    };

    var request = docClient.delete(params).promise();

    return await request.then(async(data) => {
        return {
            statusCode: 204
        };
    },
    (error) => {

        console.error(error);

        if (error.code === "ConditionalCheckFailedException") {
            throw new Error(JSON.stringify({
                statusCode: 404,
                reason: "character or item not found"
            }));
        }

        throw new Error(JSON.stringify({
            statusCode: 500,
            reason: "dynamoDB error",
            code: error.code
        }));
    });
};
