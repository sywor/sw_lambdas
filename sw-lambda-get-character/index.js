'use strict';
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'

});

exports.handler = async (event) => {

    var params = {
        TableName: "sw_characters",
        Key: {
            "characterId": event.characterId
        }
    };

    try {
        const response = await docClient.get(params).promise();
        console.log(response);
        return {
            statusCode: 200,
            body: response.Item
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: {
                error: e
            }
        };
    }
};