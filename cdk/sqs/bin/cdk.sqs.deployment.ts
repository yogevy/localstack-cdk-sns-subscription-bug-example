#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {CdkSqsStack} from "../lib/cdk.sqs.stack";
const app = new cdk.App();
import * as sns from 'aws-cdk-lib/aws-sns';

const filterContext = app.node.tryGetContext('filterContext');

const subscription = {topicName: 'test-topic', filterPolicy: {'eventType': sns.SubscriptionFilter.stringFilter({allowlist: [filterContext]})}}

new CdkSqsStack(app, `cdk-buyers-sqs`, {
    env: {
        region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
        account: process.env.AWS_DEFAULT_ACCOUNT || '000000000000',
    },
    sqsName: 'test-queue',
    subscription,
});
