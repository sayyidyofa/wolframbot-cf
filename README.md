## Wolfram Alpha LINE Bot (CF Edition)

This is the source code for one of my projects that is hosted in Cloudflare using Workers.

Read more about it in my [Cloudflare Page](https://wolframbot-page.pages.dev)

The original bot is implemented using Flask. Source: [Github repo](https://github.com/sayyidyofa/WolframBot)

### Develop

If you wanna try the bot in your local machine, then fill out the values in the file `wrangler.toml` , examples can be read from `wrangler.toml.example`

`APPID` refers to [Wolfram Alpha API ID](https://products.wolframalpha.com/api/documentation/), required to use the API of Wolfram. 

`CHANNEL_ACCESS_TOKEN` refers to [LINE Bot token](https://developers.line.biz/en/docs/messaging-api/channel-access-tokens/), required for the bot to actually work. 

Other values in `wrangler.toml` refers to Cloudflare Workers wrangler configuration.

