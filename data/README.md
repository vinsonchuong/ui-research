# Data
On transferring data between server and client

## Replication
- What if data were automatically synced between client and server?
- When there are multiple clients, how to guarantee "message delivery"?
  - [Exactly-once message delivery](https://exactly-once.github.io/posts/exactly-once-delivery/)
  - Can ensure "at-least-once" message delivery with acknowledgements
  - Can ensure "at-most-once" message processing with message identifiers
  - There are protocols that standardize this process
    - [MQTT](https://mqtt.org/)
    - [aedes](https://github.com/moscajs/aedes), an MQTT implementation
- Consensus
  - Different users can edit a document at once.
  - It can take time for each edit to be acknowledged by the server and every user.
  - When conflicts arise, they have to be resolved.
