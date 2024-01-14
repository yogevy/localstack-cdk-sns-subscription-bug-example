# please run npm ci before running this script

export LOCALSTACK_API_KEY=xxxxxxx
export DEFAULT_REGION=us-east-1
export AWS_DEFAULT_ACCOUNT=000000000000

topic_arn="arn:aws:sns:us-east-1:000000000000:test-topic.fifo"

if [ "$LOCALSTACK_API_KEY" = "" ]; then
  echo "Please set LOCALSTACK_API_KEY"
  exit 1
fi

echo "***** starting localstack container *****"
docker-compose --project-directory localstack-pro up -d

sleep 10

cdklocal bootstrap aws://000000000000/us-east-1

echo "***** deploy cdk topic *****"
cd cdk/topics
cdklocal deploy --all --require-approval never

echo "***** list topics *****"
awslocal sns list-topics


echo "***** deploy sqs with subscription to test-topic *****"
cd ../../cdk/sqs
cdklocal deploy --all --require-approval never  --context filterContext=first

echo "***** test-topic subscriptions filter policy *****"
subscription_arn=$(awslocal sns list-subscriptions-by-topic --topic-arn "$topic_arn" --output text --query 'Subscriptions[0].SubscriptionArn')
attributes=$(awslocal sns get-subscription-attributes --subscription-arn "$subscription_arn" --output json)
echo "$attributes" | jq -r '.Attributes.FilterPolicy'

echo "***** update sqs subscription to both test-topic and test-2-topic *****"
cdklocal deploy --all --require-approval never --context filterContext=second

echo "***** test-topic subscriptions filter policy *****"
subscription_arn=$(awslocal sns list-subscriptions-by-topic --topic-arn "$topic_arn" --output text --query 'Subscriptions[0].SubscriptionArn')
attributes=$(awslocal sns get-subscription-attributes --subscription-arn "$subscription_arn" --output json)
echo "$attributes" | jq -r '.Attributes.FilterPolicy'

