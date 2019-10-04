import { NowRequest, NowResponse } from '@now/node'
import axios from 'axios'
import { parse, stringify } from 'query-string'

type Response = {
  error: null | string
  access_token: null | string
}

export default async function(req: NowRequest, res: NowResponse) {
  const { code, state } = req.query
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
      res.json({
        error: error,
        access_token: null,
      } as Response)
    } else {
      res.json({
        error: null,
        access_token,
      } as Response)
    }

  } catch (e) {
    res.json({
      error: e.message,
      access_token: null,
    } as Response)
  }
}
