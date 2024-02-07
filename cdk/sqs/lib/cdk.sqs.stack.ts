import { Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class CdkSqsStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        private props: StackProps & {
            sqsName: string;
            fifo?: boolean;
            subscriptions: {
                topicName: string;
                environment?: string;
                events?: string[];
                filters?: { [key: string]: sns.SubscriptionFilter };
            }[];
        },
    ) {
        super(scope, id, props);

        const queue = this.createQueue();

        for (const subscription of this.props.subscriptions) {
            this.addSubscriptions(queue, subscription);
        }
    }

    private createQueue(): sqs.Queue {
        const { sqsName, fifo } = this.props;

        const queueProps: sqs.QueueProps = Object.assign(
            {},
            fifo
                ? {
                    queueName: `${sqsName}` + '.fifo',
                    fifo: true,
                }
                : {
                    queueName: `${sqsName}`,
                }
        );

        return new sqs.Queue(this, `${sqsName}-queue` + (fifo ? '.fifo' : ''), queueProps);
    }


    private addSubscriptions(
        queue: sqs.Queue,
        subscription: { topicName: string; events?: string[]; environment?: string; filters?: { [key: string]: sns.SubscriptionFilter } },
    ) {
        const { fifo } = this.props;

        const { topicName, events, environment, filters } = subscription;

        const fullTopicName = `${topicName}` + (fifo ? '.fifo' : '');

        const topicArn = `arn:aws:sns:us-east-1:000000000000:${fullTopicName}`;

        const topic = sns.Topic.fromTopicArn(this, `find-topic-${topicName}`, topicArn);

        if (events || environment) {
            const filterPolicy = {};
            if (events) {
                Object.assign(filterPolicy, {
                    eventType: sns.SubscriptionFilter.stringFilter({

                        allowlist: events,
                    })
                    });
            }

            Object.assign(filterPolicy, filters);

            return topic.addSubscription(new snsSubscriptions.SqsSubscription(queue, { filterPolicy }));
        }

        return topic.addSubscription(new snsSubscriptions.SqsSubscription(queue));
    }
}
