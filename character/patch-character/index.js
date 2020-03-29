'use strict';
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'
});

exports.handler = async(event) => {

    var patch = event.patch;

    var params = {
        TableName: "sw_character_description",
        Key: {
            characterId: event.characterId,
            category: patch.category
        },
        UpdateExpression: "set #data = :data",
        ExpressionAttributeValues: {
            ":data": patch.data,
        },
        ExpressionAttributeNames: {
            "#data": "data",
        },
        ConditionExpression: "attribute_exists(characterId)",
        ReturnValues: "UPDATED_NEW"
    };

    const response = docClient.update(params).promise();

    return await response.then(async(data) => {

            return {
                statusCode: 200,
                body: {
                    [patch.category]: data
                }
            };
        },
        (error) => {

            console.error(error);

            if (error.code === "ConditionalCheckFailedException") {
                throw new Error(JSON.stringify({
                    statusCode: 404,
                    reason: "character not found"
                }));
            }

            throw new Error(JSON.stringify({
                statusCode: 500,
                reason: "dynamoDB error",
                code: error.code
            }));
        });
};
