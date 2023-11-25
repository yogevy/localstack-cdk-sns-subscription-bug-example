# please run npm ci before running this script

export LOCALSTACK_API_KEY=C8Mlxntop2
export DEFAULT_REGION=us-east-1
export AWS_DEFAULT_ACCOUNT=000000000000

if [ "$LOCALSTACK_API_KEY" = "" ]; then
  echo "Please set LOCALSTACK_API_KEY"
  exit 1
fi

echo "***** starting localstack container *****"
docker-compose --project-directory localstack-pro up -d

echo "***** deploy cdk topic *****"
cd cdk/topics
cdklocal deploy --all --require-approval never

echo "***** list topics *****"
awslocal sns list-topics


echo "***** deploy sqs with subscription to test-topic *****"
cd ../../cdk/sqs
cdklocal deploy --all --require-approval never

echo "***** test-topic subscriptions *****"
awslocal sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:000000000000:test-topic.fifo

echo "***** test-2-topic subscriptions *****"
awslocal sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:000000000000:test-2-topic.fifo


echo "***** update sqs subscription to both test-topic and test-2-topic *****"
cdklocal deploy --all --require-approval never --context subscriptionsContext=both

echo "***** test-topic subscriptions *****"
awslocal sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:000000000000:test-topic.fifo

echo "***** test-2-topic subscriptions *****"
awslocal sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:000000000000:test-2-topic.fifo

