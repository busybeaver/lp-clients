import {
  UmsClient,
  IWsTransportConfig,
  IConsumerSession,
  IConsumerCredentials,
  DefaultUmsClientConfig,
  WsTransport,
  DefaultWsTransportConfig,
  UnauthenticatedConsumerSessionProvider,
  DefaultCsdsConfig,
  ConsumerWsConnectionFactory,
} from "../lib";
import {
  randomBytes,
} from "crypto";
import {
  RequestConversationResponse, wrapConsumerResponses,
} from "../lib/generated/consumer_responses";

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection", error);
  process.exit(-1);
});

const config = new DefaultUmsClientConfig<IWsTransportConfig<IConsumerSession>, IConsumerCredentials, IConsumerSession>({
  transport: new WsTransport(),
  transportConfig: new DefaultWsTransportConfig({
    connectionFactory: new ConsumerWsConnectionFactory(),
  }),
  credentials: {}, // unauthenticated
  sessionProvider: new UnauthenticatedConsumerSessionProvider(),
  csdsConfig: new DefaultCsdsConfig({
    accountId: "39794880",
  }),
  umsRequestTimeout: 20000,
});
const Client = wrapConsumerResponses(UmsClient);
const client = new Client(config);
client.doPublishEvent({
  id: randomId(),
  body: {
    dialogId: res.body ? res.body.conversationId : "-1",
    event: {
      type: "ContentEvent",
      contentType: "text/plain",
      message: "hello world :)",
    },
  },
})

const randomId = () => randomBytes(4 * 4).toString("hex");

(async () => {
  await client.start();

  client.onExConversationChangeNotification(console.debug);
  client.onMessagingEventNotification(console.info);

  const res: RequestConversationResponse = await client.sendMessage({
    type: "cm.ConsumerRequestConversation",
    id: randomId(),
  });

  await client.sendMessage({
    type: "ms.PublishEvent",
    id: randomId(),
    body: {
      dialogId: res.body ? res.body.conversationId : "-1",
      event: {
        type: "ContentEvent",
        contentType: "text/plain",
        message: "hello world :)",
      },
    },
  });
  console.log(3);
})();
