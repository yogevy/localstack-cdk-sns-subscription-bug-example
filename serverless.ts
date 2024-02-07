
const ServerlessSqsSubscription = ({
                                       sqsName,
                                       fifo,
                                       maximumConcurrency = 3,
                                   }: {
    sqsName: string;
    fifo: boolean;
    maximumConcurrency?: number;
}) => {
    return {
        arn: {
            'Fn::Join': [
                ':',
                [
                    'arn:aws:sqs',
                    { Ref: 'AWS::Region' },
                    { Ref: 'AWS::AccountId' },
                    `${sqsName}` + (fifo ? '.fifo' : ''),
                ],
            ],
        },
        batchSize: 1,
        functionResponseType: 'ReportBatchItemFailures',
        maximumConcurrency,
    };
};

const functions: Record<string, any> = {};

for (let i = 1; i <= 1; i++) {
    const field = `api${i}`;
    Object.assign(functions, {
        [field]: {
            timeout: 30,
            handler: 'src/serverless.handler',
            events: [{ sqs: ServerlessSqsSubscription({ sqsName: `test-queue-${i}`, fifo: true }) }],
        },
    });
}


const serverless = {
    service: 'test-service',
    plugins: [
        'serverless-bundle',
        'serverless-localstack',
        'serverless-prune-plugin',
    ],
    provider: {
        name: 'aws',
        deploymentMethod: 'direct',
        runtime: 'nodejs18.x',
        memorySize: '${self:custom.memorySize.${opt:stage, self:provider.stage}}' as unknown as number,
        versionFunctions: '${self:custom.versioning.${opt:stage, self:provider.stage}}' as unknown as boolean,
        endpointType: '${self:custom.endpointType.${opt:stage, self:provider.stage}}',
    },
    custom: {
        bundle: {
            sourcemaps: false,
                linting: false,
                tsconfig: './tsconfig.app.json',
                ignorePackages: [
                'superagent-proxy',
                'class-transformer/storage',
                'cache-manager',
                'class-transformer',
                'class-validator',
                '@nestjs/websockets/socket-module',
                '@nestjs/microservices/microservices-module',
                '@nestjs/microservices',
            ],
                minifyOptions: {
                keepNames: true,
            },
        },
        dbIamRole: 'mongo-connection-${opt:stage, self:provider.stage}-role',
            enable: {
            local: false,
                dev: false,
                prod: true,
        },
        versioning: {
            local: false,
                dev: true,
                prod: true,
        },
        localstack: {
            host: 'http://localhost',
                debug: true,
                edgePort: 4566,
                stages: ['local'],
        },
        memorySize: {
            local: 256,
            dev: 1024,
            prod: 1024,
        },
        prune: {
            automatic: true,
                number: 3,
        },
        endpointType: {
            local: 'REGIONAL',
                dev: 'REGIONAL',
                prod: 'EDGE',
        },
    },
    package: {
        individually: true,
    },
    functions
}

module.exports = serverless;
