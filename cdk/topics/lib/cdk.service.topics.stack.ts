import { Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export class CdkServiceTopicsStack extends Stack {
    constructor(scope: Construct, id: string, private props: StackProps & {topicName: string }) {
        super(scope, id, props);

        this.createFifoTopic(this.props.topicName);
    }

    private createFifoTopic(topicName: string) {
        new sns.Topic(this, `${topicName}-topic-fifo`, {
            displayName: `${topicName}.fifo`,
            topicName: `${topicName}.fifo`,
            fifo: true,
        });
    }
}
