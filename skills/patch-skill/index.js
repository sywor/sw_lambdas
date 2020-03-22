'use strict';
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    apiVersion: '2012-08-10'
});

exports.handler = async (event) => {

    var skill = event.skill;

    var params = {
        TableName: "sw_character_skills",
        Key: {
            characterId: event.characterId,
            skillName: skill.skillName
        },
        UpdateExpression: "set #skill = :skill",
        ExpressionAttributeValues: {
            ":skill": {
                career: skill.career,
                pool: skill.pool
            }
        },
        ExpressionAttributeNames: {
            "#skill": "skill",
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const response = await docClient.update(params).promise();
        return {
            statusCode: 200,
            body: {
                [skill.skillName]: response.Attributes.skill
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
