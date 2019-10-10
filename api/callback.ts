import { NowRequest, NowResponse } from '@now/node'
import axios from 'axios'
import { parse, stringify } from 'query-string'
import {v4 as uuid} from 'uuid'
import { Client } from 'pg'
const client = new Client()

client.connect()

export default async function(req: NowRequest, res: NowResponse) {
  const { code, state, article_url } = req.query
  const ghParams = stringify({
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    state,
  })
  try {
    const ghCall = await axios({
      method: 'post',
      url: `https://github.com/login/oauth/access_token?${ghParams}`,
    })

    const { access_token, error } = parse(ghCall.data)

    if (error) {
      res.send(`<script>window.location.href="${article_url}?login_error"</script>`)
    }

    const tokenReference = uuid()
    const query = {
      text: 'INSERT INTO tokens(reference, token) VALUES($1, $2)',
      values: [tokenReference, access_token],
    }
    await client.query(query)

    res.send(`<script>window.location.href="${article_url}?token_reference=${tokenReference}"</script>`)
  } catch (e) {
    console.log(e);
    res.send(`<script>window.location.href="${article_url}?login_error"</script>`)
  }
}
