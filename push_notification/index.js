/* 
  Copyright 2019 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

const Buffer = require('safe-buffer').Buffer;
const request = require('request');
const isodate = require('isodate');

/**
 * Pushes an Event to a Webhook whenever a disk snapshot is taken successfully.
 *
 * Expects a PubSub message with JSON-formatted event data.
 *
 * @param {object} event Cloud Function PubSub message event.
 * @param {object} callback Cloud Function PubSub callback indicating
 *  completion.
 */

exports.pushEventsToWebhook = (event, callback) => {
  try {
    // Parses the Pub/Sub message content
    const payload = event.data ?
        JSON.parse(Buffer.from(event.data, 'base64').toString()) : '';

    if (payload != '') {
      // Read the snapshot's detail from the Pub/Sub message
      const projectId = payload.resource.labels.project_id;
      const zone = payload.jsonPayload.resource.zone;
      const diskName = payload.jsonPayload.resource.name;

      const dateTime = isodate(payload.timestamp);

      const resourceURL = `https://console.cloud.google.com/compute/disksDetail/zones/${zone}/disks/${diskName}?project=${projectId}&supportedpurview=project`;
      const projectURL = `https://console.cloud.google.com/home/dashboard?project=${projectId}`;

      // Building the event's content. The latter will be pushed to the webhook
      eventBody = {
        'data': [
          {
            'type': 'disk',
            'url': resourceURL,
            'name': diskName,

          },
          {
            'type': 'project',
            'project_id': projectId,
            'project_url': projectURL,
          },
          {
            'zone': zone,
          },
          {
            'date_time': dateTime,
          },
        ],
      };
      // Reads Config Parameters
      const WEBHOOK_URL = process.env.WEBHOOK_URL;

      if (WEBHOOK_URL) {
        // Posting the message to the webhook
        request.post(WEBHOOK_URL, {
          json: eventBody,
        }, (err, res, body) => {
          if (err) {
            console.log('An error occured sending the event to the webhook.');
            console.error(err);
            return;
          }
          console.log(`statusCode: ${res.statusCode}`);
          callback(null, `statusCode: ${res.statusCode}`);
          // console.log(body)
        });
      } else {
        const message = `WEBHOOK_URL environment variable is not set`;
        console.log(message);
        callback(null, message);
      }
    } else {
      const message = `Event message's content is empty.`;
      console.log(message);
      callback(null, message);
    }
  } catch (err) {
    console.log(err);
    callback(err);
  }
};
