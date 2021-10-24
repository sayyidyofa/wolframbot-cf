addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

const helpMessage = "\nList of Commands:" +
  "\n/solve: Find the solution of a quadratic equation, input example:" +
  "\n/solve x^2 - y^2 + 1 = 0";

const waitingMessage = [
  "Getting my math notes...",
  "Alright, asking google...",
  "Yes master, I will obey",
  "Okay, okay. I will work",
  "You know, my job is only to get the answer from Wolfram. I dont actually solve these myself",
  "If I fail to deliver your answer, you can go query it yourself at wolfram"
];

async function reply(messages, replyToken) {
  let response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: messages
    })
  });

  return { type: "LINE reply message", status: response.status };
}

async function dm(messages, userId) {
  let response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: userId,
      messages: messages
    })
  });

  return { type: "LINE direct message", status: response.status };
}

async function callWolfram(eqString) {
  let result = [];
  let chungus = await fetch(
    `https://api.wolframalpha.com/v2/query?appid=${APPID}&input=${eqString}&format=image,plaintext&output=json`
  );
  let objectedChungus = await chungus.json();
  objectedChungus.queryresult.pods.forEach(pod => {
    if (pod.title === "Real solutions" || pod.title === "Solutions") pod.subpods.forEach(subpod => result.push(subpod.img.alt));
  });
  result.push(objectedChungus.queryresult.pods[2].subpods[0].img.src);

  return {graph: result.pop(), solution: result.join(", ")};
}

async function handleRequest(request) {
  const { pathname } = new URL(request.url);
  const lePath = `/${ENDPOINT}`;

  if (pathname === lePath && request.method === "POST") {

    let fogg = await request.json();

    let lineDMs = fogg.events
      .filter(e => e.type === "message")
      .filter(e => e.message.type === "text")
      .filter(e => e.source.type === "user");

    for (const lineDM of lineDMs) {
      if (lineDM.message.text === "/help") Promise.resolve(reply([
        {type: "text", text: helpMessage}
      ], lineDM.replyToken)).then(console.log);
      else {
        if (lineDM.message.text.startsWith("/solve")) {
          Promise.resolve(reply([
            {type: "text", text: waitingMessage[Math.floor(Math.random()*waitingMessage.length)]}
          ], lineDM.replyToken)).then(console.log);

          callWolfram(lineDM.message.text.slice(7))
            .then(resultAndGraph => {
              const {graph, solution} = resultAndGraph;
              Promise.resolve(dm([
                {type: "text", text: `Real solution: ${solution}`},
                {type: "text", text: "Graphical plot:"},
                {type: "image", originalContentUrl: graph, previewImageUrl: graph}
              ], lineDM.source.userId)).then(console.log);
            }).catch(reason => {
            Promise.resolve(dm([
              {type: "text", text: `Math expression is not understandable. Details: ${reason}`}
            ], lineDM.source.userId)).then(console.log);
          });
        } else Promise.resolve(reply([
          {type: "text", text: "Type /help for help"}
        ], lineDM.replyToken)).then(console.log);
      }
    }

    return new Response("Ok");
  }

  return new Response("No");
}
