// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * My main objective is to become familiar with Google Cloud APIs.
 * Currently, I'm not concerned about adhering to principles like
 * SOLID or DRY, or focusing on building and testing. I'm simply
 * focused on doing what I think is okay for now.
 */

import express from 'express';
import {pinoHttp, logger} from './utils/logging.js';

const app = express();

// Use request-based logger for log correlation
app.use(pinoHttp);

// Example endpoint
app.get('/', async (req, res) => {
  // Use basic logger without HTTP request info
  // Example of structured logging
  logger.info({logField: 'custom-entry', arbitraryField: 'custom-entry'});
  // Use request-based logger with log correlation
  // https://cloud.google.com/run/docs/logging#correlate-logs
  req.log.info('Child logger with trace Id.');
  res.send('Customer service / Asynchronous implementation.');
});

app.post('/api/v1/customer/get', async (req, res) => {
  const jsonData = JSON.parse(req.body);
  let customerId = 0;
  const invalidFields = [''];
  const keys = Object.keys(jsonData);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (key == 'customer_id') {
      customerId = jsonData[key];
    } else {
      invalidFields.append(key);
    }
  }
  if (customerId === 0) {
    return res.status(500).send({'message': 'Internal error occured.'});
  }

  const {Datastore, PropertyFilter} = require('@google-cloud/datastore');
  const datastore = new Datastore();
  const query = datastore
      .createQuery('Task')
      .filter(
          new PropertyFilter('kind', '=', 'Customer'),
      );
  const [results] = await datastore.runQuery(query);

  if (results.length !== 1) {
    return res.status(500).send({'message': 'Internal error occured.'});
  }
  const result = results[0];
  const resp = {
    'customer_id': result['customer_id'],
    'credit': result['credit'],
    'limit': result['limit'],
  };
  res.status(200).send(resp);
});
app.post('/customer-service-async/api/v1/customer/get', async (req, res) => {
  const jsonData = JSON.parse(req.body);
  let customerId = 0;
  const invalidFields = [''];
  const keys = Object.keys(jsonData);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (key == 'customer_id') {
      customerId = jsonData[key];
    } else {
      invalidFields.append(key);
    }
  }
  if (customerId === 0) {
    return res.status(500).send({'message': 'Internal error occured.'});
  }

  const {Datastore, PropertyFilter} = require('@google-cloud/datastore');
  const datastore = new Datastore();
  const query = datastore
      .createQuery('Task')
      .filter(
          new PropertyFilter('kind', '=', 'Customer'),
      );
  const [results] = await datastore.runQuery(query);

  if (results.length !== 1) {
    return res.status(500).send({'message': 'Internal error occured.'});
  }
  const result = results[0];
  const resp = {
    'customer_id': result['customer_id'],
    'credit': result['credit'],
    'limit': result['limit'],
  };
  res.status(200).send(resp);
});

app.post('/api/v1/customer/limit', async (req, res) => {
  const jsonData = JSON.parse(req.body);
  let customerId = 0;
  let limit = 0;
  const invalidFields = [''];
  const keys = Object.keys(jsonData);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (key == 'customer_id') {
      customerId = jsonData[key];
    } else if (key == 'limit') {
      limit = jsonData[key];
    } else {
      invalidFields.append(key);
    }
  }
  if (customerId === 0 || limit === 0) {
    return res.status(500).send({'message': 'Internal error occured.'});
  }

  const {Datastore, PropertyFilter} = require('@google-cloud/datastore');
  const datastore = new Datastore();
  const query = datastore
      .createQuery('Customer')
      .filter(
          new PropertyFilter('customer_id', '=', customerId),
      );
  const [results] = await datastore.runQuery(query);

  let resp = {};
  if (results.length === 1) {
    const result = results[0];
    const credit = result['credit'];
    if (limit < credit) {
      return res.status(500).send({'message': 'Internal error occured.'});
    }
    // const customerKey = datastore.key(['Customer', customerId]);
    // try {
    //   await transaction.run();
    //   const [customer] =
    //     await transaction.get(customerKey);
    //   customer['credit'] = credit;
    //   transaction.save({
    //     key: customerKey,
    //     data: customer,
    //   });
    //   await transaction.commit();
    // } catch (err) {
    //   await transaction.rollback();
    //   throw err;
    // }
    resp = {
      'customer_id': customerId,
      'credit': credit,
      'limit': limit,
    };
    const customerKey = datastore.key('Customer');
    const customerEntity = {
      key: customerKey,
      data: resp,
    };
    await datastore.update(customerEntity);
  } else {
    resp = {
      'customer_id': customerId,
      'credit': 0,
      'limit': limit,
    };
    const customerKey = datastore.key('Customer');
    const customerEntity = {
      key: customerKey,
      data: resp,
    };
    await datastore.save(customerEntity);
  }
  return res.status(200).send(resp);
});
app.post('/customer-service-async/api/v1/customer/limit', async (req, res) => {
  const jsonData = JSON.parse(req.body);
  let customerId = 0;
  let limit = 0;
  const invalidFields = [''];
  const keys = Object.keys(jsonData);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (key == 'customer_id') {
      customerId = jsonData[key];
    } else if (key == 'limit') {
      limit = jsonData[key];
    } else {
      invalidFields.append(key);
    }
  }
  if (customerId === 0 || limit === 0) {
    return res.status(500).send({'message': 'Internal error occured.'});
  }

  const {Datastore, PropertyFilter} = require('@google-cloud/datastore');
  const datastore = new Datastore();
  const query = datastore
      .createQuery('Customer')
      .filter(
          new PropertyFilter('customer_id', '=', customerId),
      );
  const [results] = await datastore.runQuery(query);

  let resp = {};
  if (results.length === 1) {
    const result = results[0];
    const credit = result['credit'];
    if (limit < credit) {
      return res.status(500).send({'message': 'Internal error occured.'});
    }
    // const customerKey = datastore.key(['Customer', customerId]);
    // try {
    //   await transaction.run();
    //   const [customer] =
    //     await transaction.get(customerKey);
    //   customer['credit'] = credit;
    //   transaction.save({
    //     key: customerKey,
    //     data: customer,
    //   });
    //   await transaction.commit();
    // } catch (err) {
    //   await transaction.rollback();
    //   throw err;
    // }
    resp = {
      'customer_id': customerId,
      'credit': credit,
      'limit': limit,
    };
    const customerKey = datastore.key('Customer');
    const customerEntity = {
      key: customerKey,
      data: resp,
    };
    await datastore.update(customerEntity);
  } else {
    resp = {
      'customer_id': customerId,
      'credit': 0,
      'limit': limit,
    };
    const customerKey = datastore.key('Customer');
    const customerEntity = {
      key: customerKey,
      data: resp,
    };
    await datastore.save(customerEntity);
  }
  return res.status(200).send(resp);
});

app.post('/api/v1/customer/pubsub', async (req, res) => {
  const envelope = JSON.parse(req.body);
  if (!envelope || typeof envelope !== 'object' || !('message' in envelope)) {
    return res.status(500).send({'message': 'Internal error occured.'});
  }
  const message = envelope.message;
  if (!message || !('data' in message) || !('attributes' in message)) {
    return res.status(500).send({'message': 'Internal error occured.'});
  }
  const {data, attributes} = message;
  if (!data || !attributes || !('event_id' in attributes) || !('event_type' in attributes)) {
    return res.status(500).send({'message': 'Internal error occured.'});
  }

  const {Datastore} = require('@google-cloud/datastore');
  const datastore = new Datastore();

  const order = JSON.parse(base64.toByteArray(data).toString('utf-8'));
  const eventId = attributes.event_id;
  const eventType = attributes.event_type;

  const query = datastore.createQuery('ProcessedEvent').filter('event_id', '=', eventId).select('__key__');
  datastore.runQuery(query, (err, entities) => {
    if (err) {
      console.error('Error querying ProcessedEvent:', err);
      return res.status(500).send('Finished.');
    }

    if (entities.length > 0) {
      console.log(`Duplicate event ${eventId}`);
      return res.status(200).send('Finished.');
    }

    if (eventType !== 'order_create') {
      console.log(`Unknown event type ${eventType}`);
      return res.status(200).send('Finished.');
    }

    const customerId = order.customer_id;
    const number = order.number;

    const customerQuery = datastore.createQuery('Customer').filter('customer_id', '=', customerId).limit(1);
    datastore.runQuery(customerQuery, (err, results) => {
      if (err) {
        console.error('Error querying Customer:', err);
        return res.status(500).send({'message': 'Internal error occured.'});
      }

      const customer = results[0];
      if (!customer) {
        return res.status(500).send({'message': 'Internal error occured.'});
      }

      let accept;
      let {credit, limit} = customer;
      credit += number * 100;

      const transaction = datastore.transaction();
      transaction.run((err) => {
        if (err) {
          console.error('Error starting transaction:', err);
          return transaction.rollback(() =>
            res.status(500).send({'message': 'Internal error occured.'}),
          );
        }

        if (credit > limit) {
          accept = false;
        } else {
          accept = true;
          customer.credit = credit;
          transaction.save(customer);
        }

        const checkResult = {
          customer_id: customerId,
          order_id: order.order_id,
          accepted: accept,
        };

        const event = {
          event_id: uuidv4(),
          topic: 'customer-service-event',
          type: 'order_checked',
          timestamp: new Date().toISOString(),
          published: false,
          body: JSON.stringify(checkResult),
        };

        const eventKey = datastore.key('Event');
        const eventEntity = {
          key: eventKey,
          data: event,
        };

        const processedEventKey = datastore.key('ProcessedEvent');
        const processedEventEntity = {
          key: processedEventKey,
          data: {
            event_id: eventId,
            timestamp: new Date().toISOString(),
          },
        };

        transaction.save([eventEntity, processedEventEntity], (err) => {
          if (err) {
            console.error('Error saving entities:', err);
            return transaction.rollback(() =>
              res.status(500).send({'message': 'Internal error occured.'}),
            );
          }

          transaction.commit((err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              return transaction.rollback(() =>
                res.status(500).send({'message': 'Internal error occured.'}),
              );
            }

            return res.status(200).send('Finished.');
          });
        });
      });
    });
  });
});

export default app;
