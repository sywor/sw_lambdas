'use strict';
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'
});

exports.handler = async (event) => {

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
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const response = await docClient.update(params).promise();
        return {
            statusCode: 200,
            body: {
                [patch.category]: response.Attributes.data
            }
        };
    }
    catch (e) {
        return {
            statusCode: 500,
            body: {
                error: e
            }
        };
    }
};
