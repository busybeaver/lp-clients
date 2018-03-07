const { Agent, Consumer, Event, CommonFilter } = require('./index');

let agentConf = {
    "accountId": "le17835410",
    "username": "awesomebot",
    "appKey": "5e102bf2f30047518b1cf45b397620d5",
    "secret": "18bc1e6a022308b8",
    "accessToken": "af8215fed63d449d94d7ee06e5081695",
    "accessTokenSecret": "49d7255605bc3570",
    "csdsDomain": "hc1n.dev.lprnd.net"
};

let consumerConf = {
    "accountId": "le17835410",
    "csdsDomain": "hc1n.dev.lprnd.net"
};

let agent = new Agent(agentConf);
let consumer = new Consumer(consumerConf);


function HaveConversation() {
    consumer.sendMessage('First')
        .then(() => agent.sendMessage('Second', consumer.conversationId))
        .then(() => consumer.sendMessage('Third'))
        .then(() => agent.sendMessage('Fourth', consumer.conversationId))
        .then(() => consumer.sendMessage('Finishing that now'))
        .then(() => {
            consumer.closeConversation();
        });
}

agent.on(Event.CONNECTED, () => {
    agent.setAgentState(true)
        .then(console.info, console.error);
    agent.subscribeConversations(false)
        .then(() => {
            setTimeout(() => {
                agent.joinConversation(consumer.conversationId)
                    .then(() => HaveConversation());
            }, 1000);
        }, console.error);
});

consumer.on(Event.CONNECTED, () => {
    consumer.authorize();

    consumer.subscribeConversation()
        .then(console.info, console.error);

    consumer.requestConversation()
        .then(res => {
            if (res.code === 200) consumer.conversationId = res.body.conversationId;
        }, console.error)
        .catch(console.error);
});

consumer.on(Event.ERROR, console.error);
agent.on(Event.ERROR, console.error);

consumer.connect();
agent.connect();