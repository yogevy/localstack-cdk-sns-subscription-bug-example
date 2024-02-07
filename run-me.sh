# please run npm ci before running this script

export LOCALSTACK_API_KEY=xxxx
export DEFAULT_REGION=us-east-1
export AWS_DEFAULT_ACCOUNT=000000000000

topic_arn="arn:aws:sns:us-east-1:000000000000:test-topic-1.fifo"

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


echo "***** deploy sqs subscription to test-topic with filter policy of {\"eventType\": [\"eventType1\", \"evenType2\"]} *****"
cd ../../cdk/sqs
cdklocal deploy --all --require-approval never

echo "***** test-topic subscriptions filter policy *****"
subscription_arn=$(awslocal sns list-subscriptions-by-topic --topic-arn "$topic_arn" --output text --query 'Subscriptions[0].SubscriptionArn')
attributes=$(awslocal sns get-subscription-attributes --subscription-arn "$subscription_arn" --output json)
echo "$attributes" | jq -r '.Attributes.FilterPolicy'

cd ../../
echo "***** deploy lambda *****"
serverless deploy --stage=local

echo "**** Publishing dnd message with attribute of eventType equals to eventType1 ****"
awslocal sns publish --topic-arn ${topic_arn} \
  --message "message 1" \
  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type1"}}' \
  --message-group-id "1" \
  --message-deduplication-id "1" \
  --region us-east-1

sleep 5

echo "**** Publishing dnd message with attribute of eventType equals to eventType2 ****"
awslocal sns publish --topic-arn ${topic_arn} \
  --message "message 2" \
  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type2"}}' \
  --message-group-id "1" \
  --message-deduplication-id "2" \
  --region us-east-1

sleep 5

echo "**** Publishing dnd message with attribute of eventType equals to eventType3 ****"
awslocal sns publish --topic-arn ${topic_arn} \
  --message "message 3" \
  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type3"}}' \
  --message-group-id "1" \
  --message-deduplication-id "3" \
  --region us-east-1
