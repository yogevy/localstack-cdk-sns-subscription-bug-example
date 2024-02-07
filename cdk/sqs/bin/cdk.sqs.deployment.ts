#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {CdkSqsStack} from "../lib/cdk.sqs.stack";
const app = new cdk.App();


new CdkSqsStack(app, `cdk-test-sqs-1`, {
    env: {
        region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
        account: process.env.AWS_DEFAULT_ACCOUNT || '000000000000',
    },
    // tags: 'local',
    stage: 'local',
    sqsName: 'test-queue-1',
    fifo: true,
    subscriptions: [
        {
            topicName: 'test-topic-1',
            events: ['event.type1', 'event.type2', 'event.type3'],
        }
    ],
    deadLetterQueue: true,
});


