registerPlugin({
  name: "AntiAntiMover",
  version: "1.0.0",
  description: "Block all AntiMove Plugins",
  backends: ["ts3"],
  author: "Alexander <alex@pluoi.com>",
  vars: [{
      name: "group",
      title: "Sticky Group",
      type: "number"
    },
    {
      name: "switchdelay",
      title: "After how many seconds is a user allowed leave the channel if it was moved",
      type: "number",
      placeholder: "1"
    },
    {
      name: "groupdelay",
      title: "For how many seconds should the user have the group?",
      type: "number",
      placeholder: "3"
    }
  ]
}, (sinusbot, config) => {
  const event = require("event");
  var cache = {};
  var removeGroup = [];
  event.on("clientMove", (moveInfo) => {
    let client = moveInfo.client;
    if (client.isSelf()) {
      return;
    }

    if (moveInfo.fromChannel == null || moveInfo.toChannel == null) {
      if(removeGroup.includes(client.databaseID())) {
        removeClient(client);
      }
      return;
    }

    if (moveInfo.invoker != undefined) {
      if (!cache.hasOwnProperty(client.databaseID())) {
        cache[client.databaseID()] = Date.now();
      }
      return;
    }

    if (!cache.hasOwnProperty(client.databaseID())) {
      return;
    }

    let lastMove = cache[client.databaseID()];

    if (!((lastMove + (1000 * config.switchdelay)) > Date.now())) {
      return;
    }

    client.addToServerGroup(config.group);
    client.moveTo(moveInfo.fromChannel);

    removeGroup.push(client.databaseID());

    setTimeout(() => {
      removeClient(client);
    }, 1000 * config.groupdelay);
  });

  function removeClient(user) {
    user.removeFromServerGroup(config.group);

    delete cache[user.databaseID()];

    const index = removeGroup.indexOf(user.databaseID());

    if (index > -1) {
      removeGroup.splice(index, 1);
    }
  }
});