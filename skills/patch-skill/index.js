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
        ReturnValues: "UPDATED_NEW",
        ConditionExpression: "attribute_exists(characterId) and attribute_exists(skillName)"
    };

    var request = docClient.update(params).promise();

    return await request.then(async (data) => {
        return {
            statusCode: 200,
            body: {
                [skill.skillName]: data
            }
        };
    },
        (error) => {

            console.error(error);

            if (error.code === "ConditionalCheckFailedException") {
                throw new Error(JSON.stringify({
                    statusCode: 404,
                    reason: "character or skill not found"
                }));
            }

            throw new Error(JSON.stringify({
                statusCode: 500,
                reason: "dynamoDB error",
                code: error.code
            }));
        });
};
