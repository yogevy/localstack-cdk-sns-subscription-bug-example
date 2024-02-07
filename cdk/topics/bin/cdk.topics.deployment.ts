#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {CdkServiceTopicsStack} from "../lib/cdk.service.topics.stack";

const app = new cdk.App();


for (let i=1; i <= 2; i++ ) {
    new CdkServiceTopicsStack(app, `cdk-test-topic-${i}-stack`, {
        env: {
            region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
            account: process.env.AWS_DEFAULT_ACCOUNT || '000000000000',
        },
        topicName: `test-topic-${i}`,
    });
}


