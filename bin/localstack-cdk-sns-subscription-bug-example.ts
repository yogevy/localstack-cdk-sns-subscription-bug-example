#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LocalstackCdkSnsSubscriptionBugExampleStack } from '../lib/localstack-cdk-sns-subscription-bug-example-stack';

const app = new cdk.App();
new LocalstackCdkSnsSubscriptionBugExampleStack(app, 'LocalstackCdkSnsSubscriptionBugExampleStack');
