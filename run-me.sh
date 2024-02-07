# please run npm ci before running this script

export LOCALSTACK_API_KEY=xxxx
export DEFAULT_REGION=us-east-1
export AWS_DEFAULT_ACCOUNT=000000000000

topic_arn="arn:aws:sns:us-east-1:000000000000:test-topic-1.fifo"
topic_arn_2="arn:aws:sns:us-east-1:000000000000:test-topic-2.fifo"
topic_arn_3="arn:aws:sns:us-east-1:000000000000:test-topic-3.fifo"
topic_arn_4="arn:aws:sns:us-east-1:000000000000:test-topic-4.fifo"
topic_arn_5="arn:aws:sns:us-east-1:000000000000:test-topic-5.fifo"


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
  --message-deduplication-id "f176e085-6fd0-4995-be0c-40f58d199cde" \
  --region us-east-1

sleep(5)

awslocal sns publish --topic-arn ${topic_arn} \
  --message "message 2" \
  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type2"}}' \
  --message-group-id "1" \
  --message-deduplication-id "acbfc503-092e-436f-b63d-842db357bbf8" \
  --region us-east-1

sleep(5)

awslocal sns publish --topic-arn ${topic_arn} \
  --message "message 3" \
  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type3"}}' \
  --message-group-id "1" \
  --message-deduplication-id "3" \
  --region us-east-1

#echo "**** Publishing dnd message with attribute of eventType equals to eventType1 ****"
#awslocal sns publish --topic-arn ${topic_arn_2} \
#  --message "message 1" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type1"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "5b5ca7a6-b0e4-4e54-8354-376e0a84d9e6" \
#  --region us-east-1
#
#
#awslocal sns publish --topic-arn ${topic_arn_2} \
#  --message "message 2" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type2"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "5741cc66-e5fb-4d8e-b12f-ad2fc55ed3b6" \
#  --region us-east-1
#
#awslocal sns publish --topic-arn ${topic_arn_2} \
#  --message "message 3" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type3"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "276c258e-336b-42b6-b43f-6d8c658c0547" \
#  --region us-east-1
#

#
#awslocal sns publish --topic-arn ${topic_arn_3} \
#  --message "message 1" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type1"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "31" \
#  --region us-east-1
#
#
#awslocal sns publish --topic-arn ${topic_arn_3} \
#  --message "message 2" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type2"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "32" \
#  --region us-east-1
#
#awslocal sns publish --topic-arn ${topic_arn_3} \
#  --message "message 3" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type3"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "33" \
#  --region us-east-1
#
#
#
#
#awslocal sns publish --topic-arn ${topic_arn_4} \
#  --message "message 1" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type1"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "41" \
#  --region us-east-1
#
#
#awslocal sns publish --topic-arn ${topic_arn_4} \
#  --message "message 2" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type2"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "42" \
#  --region us-east-1
#
#awslocal sns publish --topic-arn ${topic_arn_4} \
#  --message "message 3" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type3"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "43" \
#  --region us-east-1
#
#
#
#
#awslocal sns publish --topic-arn ${topic_arn_5} \
#  --message "message 1" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type1"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "51" \
#  --region us-east-1
#
#
#awslocal sns publish --topic-arn ${topic_arn_5} \
#  --message "message 2" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type2"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "52" \
#  --region us-east-1
#
#awslocal sns publish --topic-arn ${topic_arn_5} \
#  --message "message 3" \
#  --message-attributes '{"eventType":{"DataType":"String","StringValue":"event.type3"}}' \
#  --message-group-id "1" \
#  --message-deduplication-id "53" \
#  --region us-east-1
#
