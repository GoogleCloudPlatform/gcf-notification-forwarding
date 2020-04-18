# gcf-notification-forwarding

This repository contains code for the tutorial: [Sending notifications for GCP
events](https://cloud.google.com/solutions/sending-notifications-for-google-cloud-events). The code will deploy
[Cloud Functions](https://cloud.google.com/functions/) that

*   Reads messages from a Pub/Sub topic and pushes it to a Cloud Function that
    serves as a webhook
*   Acts as a webhook

If you already have an existing webhook URL, instead of deploying the code in the webhook folder, you can specify the webhook URL through the WEBHOOK_URL environment variable when you deploy the push notification code instead, via:

    gcloud functions deploy pushEventsToWebhook  \
        --runtime=nodejs8 \
        --trigger-topic=$PUBSUB_TOPIC \
        --set-env-vars=WEBHOOK_URL=$WEBHOOK_URL \
        --source=push_notification/


## Disclaimer

This is not an officially supported Google product.
