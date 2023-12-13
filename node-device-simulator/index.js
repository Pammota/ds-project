const express = require('express');
const amqp = require('amqplib/callback_api');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const port = 4000;

const devices = [
  "8854419c-e42c-4427-aa05-0a5da2e38df6",
  "6fdb63e3-8006-4e1c-b4c6-9f8d2f029682",
  "2-3-4-5",
  "e5a3142a-a491-422f-bd90-3bbf9773f5da",
  "a7409d1f-ef03-418f-928c-f5f149f1ef7b",
  "a776ba6d-a998-44eb-b251-94f20fc769b7",
  "dfb1cd97-9e09-4071-a5b4-5dc740d594c4",
  "e96c01e8-045a-4cba-b3f8-f59e6249c78d",
  "5661974f-5ca5-49a0-b65c-2372b7e00b66"
]

function getRandomDevice() {
  const randomIndex = Math.floor(Math.random() * devices.length);
  return devices[randomIndex];
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

amqp.connect('amqp://guest:guest@rabbitmq:5672/', (err, conn) => {
  if (err) {
    console.error(`Failed to connect to RabbitMQ: ${err}`);
    process.exit(1);
  }

  conn.createChannel((err, ch) => {
    if (err) {
      console.error(`Failed to create channel: ${err}`);
      process.exit(1);
    }

    const q = 'q1';
    const rows = [];

    ch.assertQueue(q, { durable: false });

    fs.createReadStream('sensor.csv')
      .pipe(csv({ headers: false }))
      .on('data', (row) => {
        rows.push(Number(Object.values(row)[0])); // Push the first value of the row object
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
        let rowIndex = 0;
        console.log(rows);
        setInterval(() => {
          if (rowIndex < rows.length) {
            const row = rows[rowIndex];
            const message = {
              timestamp: Date.now(),
              device_id: getRandomDevice(),
              measurement_value: Number(row)
            };
            ch.sendToQueue(q, Buffer.from(JSON.stringify(message)));
            console.log(`Sent ${JSON.stringify(message)}`);
            rowIndex++;
          }
        }, 5000);  // Send message every 5 seconds
      });
  });
});