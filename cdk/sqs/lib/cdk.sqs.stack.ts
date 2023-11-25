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
            subscriptions: {
                topicName: string;
            }[];
        },
    ) {
        super(scope, id, props);

        const queue = this.createQueue();

        for (const subscription of this.props.subscriptions) {
            this.addSubscription(queue, subscription);
        }
    }

    private createQueue(): sqs.Queue {
        const { sqsName} = this.props;

        const queueProps: sqs.QueueProps =  {
            queueName: `${sqsName}` + '.fifo',
            fifo: true,
        }


        return new sqs.Queue(this, `${sqsName}-queue-fifo`, queueProps);
    }

    private addSubscription(
        queue: sqs.Queue,
        subscription: { topicName: string; events?: string[]; environment?: string; filters?: { [key: string]: sns.SubscriptionFilter } },
    ) {
        const { topicName } = subscription;

        const fullTopicName = `${topicName}.fifo`;

        const topicArn = `arn:aws:sns:us-east-1:000000000000:${fullTopicName}`;

        const topic = sns.Topic.fromTopicArn(this, `find-topic-${topicName}`, topicArn);

        return topic.addSubscription(new snsSubscriptions.SqsSubscription(queue));
    }
}
