#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {CdkSqsStack} from "../lib/cdk.sqs.stack";
const app = new cdk.App();

const subscriptionsContext = app.node.tryGetContext('subscriptionsContext');

const subscriptions = subscriptionsContext === 'both' ? [
        {topicName: 'test-topic'},
        {topicName: 'test-topic-2'}
    ] :[
    {topicName: 'test-topic'},
]

new CdkSqsStack(app, `cdk-buyers-sqs`, {
    env: {
        region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
        account: process.env.AWS_DEFAULT_ACCOUNT || '000000000000',
    },
    sqsName: 'test-queue',
    subscriptions,
});
