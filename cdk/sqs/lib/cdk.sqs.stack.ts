import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class CdkSqsStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        private props: StackProps & {
            stage: string;
            sqsName: string;
            fifo?: boolean;
            subscriptions: {
                topicName: string;
                environment?: string;
                events?: string[];
                filters?: { [key: string]: sns.SubscriptionFilter };
            }[];
            deadLetterQueue?: boolean;
            visibilityTimeout?: number;
        },
    ) {
        super(scope, id, props);

        const queue = this.createQueue();

        for (const subscription of this.props.subscriptions) {
            this.addSubscriptions(queue, subscription);
        }
    }

    private createQueue(): sqs.Queue {
        const { stage, sqsName, fifo, deadLetterQueue, visibilityTimeout } = this.props;

        const queueProps: sqs.QueueProps = Object.assign(
            {},
            fifo
                ? {
                    queueName: `${sqsName}` + '.fifo',
                    fifo: true,
                }
                : {
                    queueName: `${sqsName}`,
                },
            deadLetterQueue && {
                deadLetterQueue: {
                    maxReceiveCount: 1,
                    queue: this.addDeadLetterQueue(),
                },
            },
            {
                visibilityTimeout: Duration.seconds(visibilityTimeout ?? 120),
            },
        );

        return new sqs.Queue(this, `${sqsName}-queue-${stage}` + (fifo ? '.fifo' : ''), queueProps);
    }

    private addDeadLetterQueue(): sqs.Queue {
        const { sqsName, fifo } = this.props;

        const dlqQueueName = `${sqsName}` + '-dlq';

        const queueProps: sqs.QueueProps = fifo
            ? {
                queueName: dlqQueueName + '.fifo',
                fifo: true,
            }
            : {
                queueName: dlqQueueName,
            };

        return new sqs.Queue(this, `${sqsName}` + '-dlq' + (fifo ? '.fifo' : ''), queueProps);
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
